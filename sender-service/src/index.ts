import * as fsPromises from "fs/promises";
import path from "path";
import Queue, { Job, DoneCallback } from "bee-queue";
import { createClient, RedisClientType } from "redis";
import axios from "axios";
import NodeCache from "node-cache"; // <<< Import node-cache

// Import logging functions and status constants
import {
    updateLogStatusQueued,
    updateLogStatusProcessing,
    updateLogStatusSuccess,
    updateLogStatusFailed,
    updateLogError,
    LogStatus,
    LogStatusType,
} from "./repositories/logRepository";

// --- Interfaces ---
interface JobMessage {
    status: "new" | string;
    filePath: string;
    job_uuid: string;
}
type FhirBundle = any;
interface JobData {
    bundle: FhirBundle;
    job_uuid: string;
}
interface TokenResponse {
    access_token: string;
    expires_in: number; // Typically in seconds
    token_type: string;
}

// --- Constants ---
const REDIS_URL = process.env.REDIS_URL || "redis://redis_server:6379";
const JOB_CHANNEL = "job-channel";
const QUEUE_NAME = "send-bundle-satusehat-jobs";
const DATA_DIR = "/app/job_files/";

const SATUSEHAT_AUTH_URL = process.env.SATUSEHAT_AUTH_URL;
const SATUSEHAT_FHIR_URL = process.env.SATUSEHAT_FHIR_URL;
const SATUSEHAT_CLIENT_ID = process.env.SATUSEHAT_CLIENT_ID;
const SATUSEHAT_CLIENT_SECRET = process.env.SATUSEHAT_CLIENT_SECRET;

// --- Cache Setup ---
const tokenCache = new NodeCache(); // <<< Initialize the cache
const ACCESS_TOKEN_CACHE_KEY = "";
const TOKEN_EXPIRY_BUFFER_SECONDS = 60; // Get new token 60s before actual expiry

// --- Environment Variable Validation ---
if (
    !SATUSEHAT_AUTH_URL ||
    !SATUSEHAT_FHIR_URL ||
    !SATUSEHAT_CLIENT_ID ||
    !SATUSEHAT_CLIENT_SECRET
) {
    console.error(
        "Missing required SatuSehat environment variables (SATUSEHAT_AUTH_URL, SATUSEHAT_FHIR_URL, SATUSEHAT_CLIENT_ID, SATUSEHAT_CLIENT_SECRET)"
    );
    process.exit(1);
}

// --- Queue Setup ---
const queue: Queue<JobData> = new Queue<JobData>(QUEUE_NAME, {
    redis: { url: REDIS_URL },
    isWorker: true,
});

// --- Redis Client Setup (for Pub/Sub) ---
const redisSubscriber = createClient({ url: REDIS_URL });

// --- Authentication Function (Modified for Caching) ---
async function getAccessToken(): Promise<string> {
    // 1. Check cache first
    const cachedToken = tokenCache.get<string>(ACCESS_TOKEN_CACHE_KEY);
    if (cachedToken) {
        console.log("Using cached access token.");
        return cachedToken;
    }

    // 2. If not in cache or expired, request a new one
    console.log("Requesting new access token (cache miss or expired)...");
    try {
        const response = await axios.post<TokenResponse>(
            `${SATUSEHAT_AUTH_URL}`, // Already includes grant_type query param from .env
            new URLSearchParams({
                client_id: SATUSEHAT_CLIENT_ID!,
                client_secret: SATUSEHAT_CLIENT_SECRET!,
            }),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        const accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in; // Time in seconds until expiry

        // Calculate TTL for the cache (slightly less than actual expiry)
        const ttlInSeconds = expiresIn - TOKEN_EXPIRY_BUFFER_SECONDS;

        if (ttlInSeconds > 0) {
            // Store the new token in the cache with the calculated TTL
            tokenCache.set(ACCESS_TOKEN_CACHE_KEY, accessToken, ttlInSeconds);
            console.log(
                `Access token obtained and cached for ${ttlInSeconds} seconds.`
            );
        } else {
            // Handle edge case where expiry is very short or buffer is too large
            console.warn(
                `Token expiry (${expiresIn}s) is too short to cache effectively with buffer (${TOKEN_EXPIRY_BUFFER_SECONDS}s). Token not cached.`
            );
            // Still use the token for the current request
        }

        return accessToken; // Return the newly fetched token
    } catch (error: any) {
        console.error(
            "Error obtaining access token:",
            error.response?.data || error.message
        );
        // Re-throw the error so the calling function knows it failed
        throw new Error("Failed to obtain SatuSehat access token.");
    }
}

// --- Redis Event Handling ---
redisSubscriber.on("error", (err) =>
    console.error("Redis Subscriber Error:", err)
);

const handleRedisMessage = async (
    message: string,
    channel: string
): Promise<void> => {
    console.log(`Received message from channel "${channel}"`);
    let job_uuid: string | undefined;

    if (channel === JOB_CHANNEL) {
        try {
            if (!message || message.trim() === "" || message[0] !== "{") {
                console.warn(`Ignoring invalid non-JSON message: ${message}`);
                return;
            }

            const jobData: Partial<JobMessage> = JSON.parse(message);
            console.log("Parsed job message:", jobData);

            job_uuid = jobData.job_uuid;

            if (
                jobData.status === "new" &&
                typeof jobData.filePath === "string" &&
                jobData.filePath &&
                typeof job_uuid === "string" &&
                job_uuid
            ) {
                const jobFilePath = path.join(DATA_DIR, jobData.filePath);
                console.log(
                    `[${job_uuid}] Processing new job request for file: ${jobFilePath}`
                );

                let bundle: FhirBundle;
                try {
                    const fileContent = await fsPromises.readFile(
                        jobFilePath,
                        "utf8"
                    );
                    bundle = JSON.parse(fileContent);

                    if (
                        typeof bundle !== "object" ||
                        bundle === null ||
                        !bundle.resourceType
                    ) {
                        throw new Error(
                            `File ${jobFilePath} does not contain a valid JSON object or FHIR resource.`
                        );
                    }
                    console.log(
                        `[${job_uuid}] Read FHIR Bundle from ${jobFilePath}. ResourceType: ${bundle.resourceType}`
                    );

                    await updateLogStatusQueued({ job_uuid });
                    console.log(`[${job_uuid}] Log status updated to QUEUED.`);

                    const job: Job<JobData> = queue.createJob({
                        bundle: bundle,
                        job_uuid: job_uuid,
                    });
                    job.retries(3);
                    job.backoff("exponential", 10000);
                    await job.save();
                    console.log(
                        `[${job_uuid}] Job ${job.id} created and saved successfully.`
                    );

                    // Optional: Delete file after successful queuing
                    // await fsPromises.unlink(jobFilePath);
                    // console.log(`[${job_uuid}] Deleted job file: ${jobFilePath}`);
                } catch (err: any) {
                    let errorMsg = `Error processing file ${jobFilePath}: ${
                        err.message || err
                    }`;
                    if (err.code === "ENOENT") {
                        errorMsg = `File not found at ${jobFilePath}`;
                    } else if (err instanceof SyntaxError) {
                        errorMsg = `Error parsing JSON from file ${jobFilePath}: ${err.message}`;
                    }
                    console.error(`[${job_uuid}] ${errorMsg}`);

                    if (job_uuid) {
                        await updateLogError({
                            job_uuid: job_uuid,
                            error_message: errorMsg,
                        });
                    } else {
                        console.error(
                            "Cannot update log status to ERROR because job_uuid was not found in the message."
                        );
                    }
                }
            } else {
                console.warn(
                    `[${
                        job_uuid || "UUID_UNKNOWN"
                    }] Ignoring message: Status not 'new' or filePath/job_uuid missing/invalid. Message:`,
                    jobData
                );
                if (job_uuid) {
                    await updateLogError({
                        job_uuid: job_uuid,
                        error_message:
                            "Received message with valid UUID but invalid status/filePath.",
                    });
                }
            }
        } catch (err: any) {
            console.error(
                "Error parsing Redis message JSON or handling message:",
                err,
                "Raw message:",
                message
            );
        }
    }
};

// --- Queue Processing ---
queue.process(async (job: Job<JobData>, done: DoneCallback<any>) => {
    const { bundle, job_uuid } = job.data;

    console.log(
        `[${job_uuid}] Processing job ${job.id} - Sending FHIR Bundle to SatuSehat.`
    );

    if (
        !job_uuid ||
        typeof bundle !== "object" ||
        bundle === null ||
        !bundle.resourceType
    ) {
        const errorMsg = `Job ${job.id}: Invalid job data received (missing UUID or invalid FHIR Bundle).`;
        console.error(errorMsg);
        if (job_uuid) {
            await updateLogError({ job_uuid, error_message: errorMsg });
        }
        return done(new Error(errorMsg));
    }

    console.log(
        `[${job_uuid}] Job ${job.id}: Bundle ResourceType: ${
            bundle.resourceType
        }, ID: ${bundle.id || "N/A"}`
    );

    try {
        await updateLogStatusProcessing({ job_uuid });
        console.log(`[${job_uuid}] Log status updated to PROCESSING.`);

        // 1. Get Access Token (will use cache or fetch new)
        const accessToken = await getAccessToken(); // <<< This now uses the cache

        // 2. Send Bundle to SatuSehat FHIR Endpoint
        console.log(
            `[${job_uuid}] Job ${job.id}: Posting Bundle to ${SATUSEHAT_FHIR_URL}...`
        );
        const response = await axios.post(SATUSEHAT_FHIR_URL!, bundle, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            // timeout: 30000,
        });

        // --- Handle Success ---
        if (response.status === 200 || response.status === 201) {
            console.log(
                `[${job_uuid}] Job ${job.id} successfully sent Bundle. Status: ${response.status}.`
            );
            await updateLogStatusSuccess({
                job_uuid: job_uuid,
                response_json: response.data,
            });
            console.log(`[${job_uuid}] Log status updated to SENT_SUCCESS.`);
            done(null, response.data);
        } else {
            const warnMsg = `Job ${job.id} received unexpected success status: ${response.status}.`;
            console.warn(`[${job_uuid}] ${warnMsg}`);
            await updateLogStatusSuccess({
                job_uuid: job_uuid,
                response_json: response.data,
            });
            console.log(
                `[${job_uuid}] Log status updated to SENT_SUCCESS (with warning).`
            );
            done(null, response.data);
        }
    } catch (error: any) {
        // --- Handle Errors (Token or API Call) ---
        console.error(`[${job_uuid}] Error processing job ${job.id}:`);
        let errorMessage = "Unknown processing error";
        let errorResponseData = null;
        let logStatus: LogStatusType = LogStatus.SENT_FAILED;

        if (axios.isAxiosError(error)) {
            errorMessage = `API request failed: ${error.message}`;
            if (error.response) {
                errorResponseData = error.response.data;
                errorMessage += ` - Status ${
                    error.response.status
                }: ${JSON.stringify(errorResponseData)}`;
                console.error(`  Status: ${error.response.status}`);
                console.error(`  Data: ${JSON.stringify(errorResponseData)}`);
            } else if (error.request) {
                errorMessage += " - No response received.";
                console.error("  No response received from server.");
            } else {
                errorMessage += ` - Request setup error: ${error.message}`;
                console.error("  Error setting up request:", error.message);
            }
        } else if (
            error.message === "Failed to obtain SatuSehat access token."
        ) {
            errorMessage = error.message;
            logStatus = LogStatus.ERROR; // Token error is not an API send failure
            console.error(`  Authentication failed.`);
        } else {
            errorMessage =
                error instanceof Error ? error.message : String(error);
            logStatus = LogStatus.ERROR; // Other unexpected errors
            console.error(`  Unexpected error: ${errorMessage}`);
        }

        await updateLogStatusFailed({
            job_uuid: job_uuid,
            error_message: errorMessage,
            response_json: errorResponseData,
            status: logStatus,
        });
        console.error(`[${job_uuid}] Log status updated to ${logStatus}.`);

        done(new Error(errorMessage));
    }
});

// --- Service Initialization ---
async function startService() {
    try {
        await redisSubscriber.connect();
        console.log("Redis subscriber connected.");
        await redisSubscriber.subscribe(JOB_CHANNEL, handleRedisMessage);
        console.log(`Subscribed to "${JOB_CHANNEL}" on Redis Pub/Sub.`);
        console.log(
            `Sender service started. Queue: "${QUEUE_NAME}". Listening...`
        );

        queue.on("ready", () => console.log("Queue is ready!"));
        queue.on("error", (err) => console.error("Queue error:", err));
        queue.on("succeeded", (job, result) => {
            const job_uuid = job.data?.job_uuid || "UUID_UNKNOWN";
            console.log(`[${job_uuid}] Job ${job.id} succeeded.`);
        });
        queue.on("failed", (job, err) => {
            const job_uuid = job.data?.job_uuid || "UUID_UNKNOWN";
            console.error(
                `[${job_uuid}] Job ${job.id} failed with error: ${err.message}`
            );
        });
        queue.on("stalled", (jobId) => {
            console.warn(`Job ${jobId} stalled and will be retried.`);
        });
    } catch (err) {
        console.error("Failed to start sender service:", err);
        await shutdown().catch(console.error);
        process.exit(1);
    }
}

// --- Graceful Shutdown ---
async function shutdown() {
    console.log("Shutting down sender service...");
    let exitCode = 0;

    if (redisSubscriber.isOpen) {
        try {
            await redisSubscriber.unsubscribe(JOB_CHANNEL);
            console.log("Unsubscribed from Redis channel.");
            await redisSubscriber.quit();
            console.log("Redis subscriber disconnected.");
        } catch (err) {
            console.error("Error during Redis subscriber shutdown:", err);
            exitCode = 1;
        }
    }

    try {
        console.log("Closing Bee-Queue (waiting up to 30s for active jobs)...");
        await queue.close(30000);
        console.log("Bee-Queue closed.");
    } catch (err) {
        console.error("Error closing Bee-Queue:", err);
        exitCode = 1;
    }

    // Clear cache on shutdown (optional, as it's in-memory anyway)
    tokenCache.flushAll();
    console.log("Token cache flushed.");

    console.log(`Shutdown complete with exit code ${exitCode}.`);
    process.exit(exitCode);
}

process.on("SIGTERM", () => {
    console.info("SIGTERM signal received. Initiating shutdown...");
    shutdown();
});
process.on("SIGINT", () => {
    console.info("SIGINT signal received. Initiating shutdown...");
    shutdown();
});

// --- Start the Service ---
startService();

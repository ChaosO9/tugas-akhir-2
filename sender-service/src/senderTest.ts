// src/senderTest.ts - Refactored to align with index.ts structure

// Removed fsPromises and path imports as we'll use a dummy bundle
import Queue, { Job, DoneCallback } from "bee-queue";
import { createClient, RedisClientType } from "redis";
import axios from "axios"; // Keep import for structural similarity, even if not used in test processor
import NodeCache from "node-cache";
import { randomUUID } from "crypto"; // For generating UUIDs in the test processor

// Import logging functions and status constants (assuming path is correct relative to senderTest.ts)
// Adjust the path if senderTest.ts is in a different directory relative to repositories
import {
    updateLogStatusQueued,
    updateLogStatusProcessing,
    updateLogStatusSuccess,
    updateLogStatusFailed,
    updateLogError,
    LogStatus,
    LogStatusType,
} from "./repositories/logRepository";

// --- Interfaces (Copied from index.ts) ---
interface JobMessage {
    status: "new" | string;
    filePath?: string; // FilePath is no longer strictly required by the handler logic
    job_uuid: string;
}
type FhirBundle = any; // Or a more specific FHIR Bundle type if available
interface JobData {
    bundle: FhirBundle;
    job_uuid: string;
}
interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

// --- Constants (Aligned with index.ts) ---
const REDIS_URL = process.env.REDIS_URL || "redis://redis_server:6379"; // Use same default as index.ts
const JOB_CHANNEL = "job-channel";
const QUEUE_NAME = "send-bundle-satusehat-jobs";
const DATA_DIR = "/app/job_files/"; // Keep for structural similarity, though not used for reading in this test

// Constants needed for getAccessToken structure, even if not used by test processor
const SATUSEHAT_AUTH_URL = process.env.SATUSEHAT_AUTH_URL;
const SATUSEHAT_CLIENT_ID = process.env.SATUSEHAT_CLIENT_ID;
const SATUSEHAT_CLIENT_SECRET = process.env.SATUSEHAT_CLIENT_SECRET;
const SATUSEHAT_FHIR_URL = process.env.SATUSEHAT_FHIR_URL; // Added FHIR URL constant

// --- Cache Setup (Copied from index.ts) ---
const tokenCache = new NodeCache();
const ACCESS_TOKEN_CACHE_KEY = "satusehat_access_token"; // Give it a specific key
const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

// --- Environment Variable Validation (Minimal for test, adapt if needed) ---
// You might want less strict checks here, or mock values if testing auth
if (
    !SATUSEHAT_AUTH_URL ||
    !SATUSEHAT_CLIENT_ID ||
    !SATUSEHAT_CLIENT_SECRET ||
    !SATUSEHAT_FHIR_URL // Added check for FHIR URL
) {
    console.warn(
        "Warning: Missing SatuSehat environment variables (AUTH_URL, CLIENT_ID, CLIENT_SECRET, FHIR_URL). API calls will fail."
    );
    // Decide if this should be fatal for the test runner
    // process.exit(1); // Consider making this fatal if real sending is required
}

// --- Queue Setup (Aligned with index.ts) ---
const queue: Queue<JobData> = new Queue<JobData>(QUEUE_NAME, {
    redis: { url: REDIS_URL },
    isWorker: true,
});

// --- Redis Client Setup (for Pub/Sub) ---
const redisSubscriber = createClient({ url: REDIS_URL });

// --- Authentication Function (Copied from index.ts, potentially unused in test processor) ---
async function getAccessToken(): Promise<string> {
    const cachedToken = tokenCache.get<string>(ACCESS_TOKEN_CACHE_KEY);
    if (cachedToken) {
        console.log("(Test Runner) Using cached access token.");
        return cachedToken;
    }

    console.log(
        "(Test Runner) Requesting new access token (cache miss or expired)..."
    );
    if (
        !SATUSEHAT_AUTH_URL ||
        !SATUSEHAT_CLIENT_ID ||
        !SATUSEHAT_CLIENT_SECRET
    ) {
        throw new Error(
            "(Test Runner) Cannot get token: Missing SatuSehat environment variables."
        );
    }
    try {
        const response = await axios.post<TokenResponse>(
            `${SATUSEHAT_AUTH_URL}`,
            new URLSearchParams({
                client_id: SATUSEHAT_CLIENT_ID!,
                client_secret: SATUSEHAT_CLIENT_SECRET!,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        const accessToken = response.data.access_token;
        const expiresIn = response.data.expires_in;
        const ttlInSeconds = expiresIn - TOKEN_EXPIRY_BUFFER_SECONDS;

        if (ttlInSeconds > 0) {
            tokenCache.set(ACCESS_TOKEN_CACHE_KEY, accessToken, ttlInSeconds);
            console.log(
                `(Test Runner) Access token obtained and cached for ${ttlInSeconds} seconds.`
            );
        } else {
            console.warn(
                `(Test Runner) Token expiry (${expiresIn}s) too short to cache effectively. Token not cached.`
            );
        }
        return accessToken;
    } catch (error: any) {
        console.error(
            "(Test Runner) Error obtaining access token:",
            error.response?.data || error.message
        );
        throw new Error(
            "(Test Runner) Failed to obtain SatuSehat access token."
        );
    }
}

// --- Redis Event Handling ---
redisSubscriber.on("error", (err) =>
    console.error("(Test Runner) Redis Subscriber Error:", err)
);

// Handle incoming messages from Redis Pub/Sub (Aligned with index.ts)
const handleRedisMessage = async (
    message: string,
    channel: string
): Promise<void> => {
    console.log(`(Test Runner) Received message from channel "${channel}"`);
    let job_uuid: string | undefined;

    if (channel === JOB_CHANNEL) {
        try {
            if (!message || message.trim() === "" || message[0] !== "{") {
                console.warn(
                    `(Test Runner) Ignoring invalid non-JSON message: ${message}`
                );
                return;
            }

            const jobData: Partial<JobMessage> = JSON.parse(message);
            console.log("(Test Runner) Parsed job message:", jobData);

            job_uuid = jobData.job_uuid; // Extract UUID early for logging

            if (
                jobData.status === "new" &&
                // typeof jobData.filePath === "string" && // FilePath no longer needed for content
                // jobData.filePath &&                     // FilePath no longer needed for content
                typeof job_uuid === "string" &&
                job_uuid
            ) {
                // const jobFilePath = path.join(DATA_DIR, jobData.filePath); // No longer reading file
                console.log(
                    `[${job_uuid}] (Test Runner) Processing new job request (using dummy bundle).` // Updated log
                );

                const newEncounterUUID = randomUUID();
                const newCondition1UUID = randomUUID();
                const newCondition2UUID = randomUUID();

                const now = Date.now();
                const fiveYearsAgo = now - 5 * 365 * 24 * 60 * 60 * 1000;
                const randomTimestamp =
                    Math.random() * (now - fiveYearsAgo) + fiveYearsAgo;
                const randomDate = new Date(randomTimestamp);
                const randomISOString = randomDate.toISOString(); // Format: YYYY-MM-DDTHH:mm:ss.sss

                let bundle: FhirBundle;
                try {
                    bundle = {
                        type: "transaction",
                        entry: [
                            {
                                fullUrl: `urn:uuid:${newEncounterUUID}`,
                                request: {
                                    url: "Encounter",
                                    method: "POST",
                                },
                                resource: {
                                    class: {
                                        code: "IMP",
                                        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                                        display: "inpatient encounter",
                                    },
                                    period: {
                                        start: randomISOString,
                                    },
                                    status: "finished",
                                    subject: {
                                        display: "Ardianto Putra",
                                        reference: "Patient/P02478375538",
                                    },
                                    location: [
                                        {
                                            location: {
                                                display: "POLI UMUM",
                                                reference:
                                                    "Location/85df32eb-7b0a-4ab2-9867-5309d2b9d944",
                                            },
                                        },
                                    ],
                                    diagnosis: [
                                        {
                                            condition: {
                                                reference: `urn:uuid:${newCondition1UUID}`,
                                                display: "Abdominal rigidity",
                                            },
                                            use: {
                                                coding: [
                                                    {
                                                        system: "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                                        code: "DD",
                                                        display:
                                                            "Discharge diagnosis",
                                                    },
                                                ],
                                            },
                                            rank: 1,
                                        },
                                    ],
                                    identifier: [
                                        {
                                            value: "RJ12092022-00001",
                                            system: "http://sys-ids.kemkes.go.id/encounter/45f9b617-7bd7-4136-8803-5727aa0b890c",
                                        },
                                    ],
                                    participant: [
                                        {
                                            type: [
                                                {
                                                    coding: [
                                                        {
                                                            code: "ATND",
                                                            system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                                            display: "attender",
                                                        },
                                                    ],
                                                },
                                            ],
                                            individual: {
                                                display: "dr. Alexander",
                                                reference:
                                                    "Practitioner/10009880728",
                                            },
                                        },
                                    ],
                                    resourceType: "Encounter",
                                    statusHistory: [
                                        {
                                            period: {
                                                end: "2022-09-11T20:13:04.000Z",
                                                start: "2022-09-11T20:13:04.000Z",
                                            },
                                            status: "arrived",
                                        },
                                        {
                                            period: {
                                                end: "2022-09-11T20:13:31.000Z",
                                                start: "2022-09-11T20:13:31.000Z",
                                            },
                                            status: "in-progress",
                                        },
                                        {
                                            period: {
                                                end: "2022-09-11T20:41:00.000Z",
                                                start: "2022-09-11T20:41:00.000Z",
                                            },
                                            status: "finished",
                                        },
                                    ],
                                    serviceProvider: {
                                        reference:
                                            "Organization/45f9b617-7bd7-4136-8803-5727aa0b890c",
                                    },
                                },
                            },
                            {
                                fullUrl: `urn:uuid:${newCondition1UUID}`,
                                request: {
                                    url: "Condition",
                                    method: "POST",
                                },
                                resource: {
                                    code: {
                                        coding: [
                                            {
                                                code: "R19.3",
                                                system: "http://hl7.org/fhir/sid/icd-10",
                                                display: "Abdominal rigidity",
                                            },
                                        ],
                                    },
                                    subject: {
                                        display: "Ardianto Putra",
                                        reference: "Patient/P02478375538",
                                    },
                                    category: [
                                        {
                                            coding: [
                                                {
                                                    code: "chief-complaint",
                                                    system: "http://terminology.kemkes.go.id",
                                                    display: "Chief Complaint",
                                                },
                                            ],
                                        },
                                    ],
                                    recorder: {
                                        display: "TIARA PRAMAESYA",
                                        reference: "Practitioner/10009880728",
                                    },
                                    encounter: {
                                        display:
                                            "Kunjungan ANDHIKA MEGA KURNIAWAN di tanggal Mon Sep 12 2022 03:13:04 GMT+0700 (Western Indonesia Time)",
                                        reference: `Encounter/${newEncounterUUID}`,
                                    },
                                    recordedDate: "2025-04-25T08:25:44.790Z",
                                    resourceType: "Condition",
                                    onsetDateTime: "2025-04-25T08:25:44.790Z",
                                    clinicalStatus: {
                                        coding: [
                                            {
                                                code: "active",
                                                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                                display: "Active",
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                fullUrl: `urn:uuid:${newCondition2UUID}`,
                                request: {
                                    url: "Condition",
                                    method: "POST",
                                },
                                resource: {
                                    code: {
                                        coding: [
                                            {
                                                code: "R19.3",
                                                system: "http://hl7.org/fhir/sid/icd-10",
                                                display: "Abdominal rigidity",
                                            },
                                        ],
                                    },
                                    subject: {
                                        display: "Ardianto Putra",
                                        reference: "Patient/P02478375538",
                                    },
                                    category: [
                                        {
                                            coding: [
                                                {
                                                    code: "encounter-diagnosis",
                                                    system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                                    display:
                                                        "Encounter Diagnosis",
                                                },
                                            ],
                                        },
                                    ],
                                    recorder: {
                                        display: "TIARA PRAMAESYA",
                                        reference: "Practitioner/10009880728",
                                    },
                                    encounter: {
                                        display:
                                            "Kunjungan ANDHIKA MEGA KURNIAWAN di tanggal Mon Sep 12 2022 03:13:04 GMT+0700 (Western Indonesia Time)",
                                        reference: `Encounter/${newEncounterUUID}`,
                                    },
                                    recordedDate: "2025-04-25T08:25:44.792Z",
                                    resourceType: "Condition",
                                    onsetDateTime: "2025-04-25T08:25:44.792Z",
                                    clinicalStatus: {
                                        coding: [
                                            {
                                                code: "active",
                                                system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                                display: "Active",
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                        resourceType: "Bundle",
                    };
                    // ------------------------

                    // Basic validation of the dummy bundle structure (still useful)
                    if (
                        typeof bundle !== "object" ||
                        bundle === null ||
                        !bundle.resourceType // Check for a common FHIR property
                    ) {
                        throw new Error(
                            `Generated dummy bundle is not a valid JSON object or FHIR resource.`
                        );
                    }
                    console.log(
                        `[${job_uuid}] (Test Runner) Using dummy FHIR Bundle. ResourceType: ${bundle.resourceType}` // Updated log
                    );

                    // Create and save the job with bundle and job_uuid
                    const job: Job<JobData> = queue.createJob({
                        bundle: bundle,
                        job_uuid: job_uuid,
                    });
                    await job.save();
                    // Update log status to QUEUED *after* job save attempt (or before, depending on desired flow)
                    await updateLogStatusQueued({ job_uuid });
                    console.log(
                        `[${job_uuid}] (Test Runner) Job ${job.id} created and saved successfully with dummy bundle. Log status updated to QUEUED.` // Updated log
                    );

                    // No file to delete
                } catch (err: any) {
                    // Error handling adjusted - no file path involved
                    let errorMsg = `(Test Runner) Error processing job request for ${job_uuid}: ${
                        err.message || err
                    }`;
                    // Removed ENOENT check
                    if (err instanceof SyntaxError) {
                        // Keep this if JSON parsing could fail elsewhere
                        errorMsg = `(Test Runner) Error parsing JSON (potentially from message): ${err.message}`; // Removed jobFilePath reference
                    }
                    console.error(
                        `[${job_uuid || "UUID_MISSING"}] ${errorMsg}`
                    );

                    // Update log status to ERROR if UUID is available
                    if (job_uuid) {
                        await updateLogError({
                            job_uuid: job_uuid,
                            error_message: errorMsg,
                        });
                    } else {
                        console.error(
                            "(Test Runner) Cannot update log status to ERROR because job_uuid was not found in the message."
                        );
                    }
                }
            } else {
                console.warn(
                    `[${
                        job_uuid || "UUID_UNKNOWN"
                    }] (Test Runner) Ignoring message: Status not 'new' or filePath/job_uuid missing/invalid. Message:`,
                    jobData // filePath check removed from condition, but log still shows original message
                );
                // Log error if UUID was present but other fields were bad
                if (job_uuid) {
                    await updateLogError({
                        job_uuid: job_uuid,
                        error_message:
                            "(Test Runner) Received message with valid UUID but invalid status.", // Simplified error
                    });
                }
            }
        } catch (err: any) {
            console.error(
                "(Test Runner) Error parsing Redis message JSON or handling message:",
                err,
                "Raw message:",
                message
            );
            // Attempt to log error if UUID was parsed before the error
            if (job_uuid) {
                await updateLogError({
                    job_uuid: job_uuid,
                    error_message: `(Test Runner) Failed to handle Redis message: ${
                        err.message || err
                    }`,
                });
            }
        }
    }
};

// --- Queue Processing (Simplified Test Logic) ---
queue.process(async (job: Job<JobData>, done: DoneCallback<any>) => {
    const { bundle, job_uuid } = job.data;
    /*
    console.log(
        `[${job_uuid}] (Test Runner) Processing job ${job.id} - Simulating work.`
    );

    // Validate job data received by the worker
    if (
        !job_uuid ||
        typeof bundle !== "object" ||
        bundle === null ||
        !bundle.resourceType
    ) {
        const errorMsg = `(Test Runner) Job ${job.id}: Invalid job data received (missing UUID or invalid FHIR Bundle).`;
        console.error(`[${job_uuid || "UUID_MISSING"}] ${errorMsg}`);
        if (job_uuid) {
            // Log error status before failing the job
            await updateLogError({ job_uuid, error_message: errorMsg });
        }
        return done(new Error(errorMsg)); // Fail the job
    }

    console.log(
        `[${job_uuid}] (Test Runner) Job ${job.id}: Bundle ResourceType: ${
            bundle.resourceType
        }, ID: ${bundle.id || "N/A"}`
    );
    */
    console.log(
        `[${job_uuid}] (Test Runner) Processing job ${job.id} - Attempting real send.`
    );

    // Validate job data received by the worker
    if (
        !job_uuid ||
        typeof bundle !== "object" ||
        bundle === null ||
        !bundle.resourceType ||
        !SATUSEHAT_FHIR_URL // Also check if FHIR URL is configured
    ) {
        const errorMsg = `(Test Runner) Job ${job.id}: Invalid job data or missing FHIR URL configuration. Cannot send bundle.`;
        console.error(`[${job_uuid || "UUID_MISSING"}] ${errorMsg}`);
        if (job_uuid) {
            await updateLogError({ job_uuid, error_message: errorMsg });
        }
        return done(new Error(errorMsg)); // Fail the job
    }

    try {
        // Update log status to PROCESSING
        await updateLogStatusProcessing({ job_uuid });
        console.log(
            `[${job_uuid}] (Test Runner) Log status updated to PROCESSING.`
        );

        // --- Get Access Token ---
        const accessToken = await getAccessToken(); // Reuse the existing function

        // --- Make the actual API call ---
        console.log(
            `[${job_uuid}] (Test Runner) Job ${job.id}: Sending bundle to ${SATUSEHAT_FHIR_URL}`
        );

        const response = await axios.post(SATUSEHAT_FHIR_URL, bundle, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            // Consider adding a timeout
            // timeout: 30000, // e.g., 30 seconds
        });

        // --- Handle Success ---
        console.log(
            `[${job_uuid}] (Test Runner) Job ${job.id} sent successfully. Status: ${response.status}`
        );

        await updateLogStatusSuccess({
            job_uuid: job_uuid,
            response_json: response.data, // Log the actual response from SatuSehat
        });
        console.log(
            `[${job_uuid}] (Test Runner) Log status updated to SENT_SUCCESS.`
        );
        done(null, response.data); // Signal success with the actual result
    } catch (error: any) {
        // --- Handle errors during token fetch, API call, or logging ---
        let errorMessage = `(Test Runner) Error processing job ${job.id}: ${
            error.message || error
        }`;
        let responseData = null;

        if (axios.isAxiosError(error)) {
            errorMessage = `(Test Runner) API Error sending job ${job.id} to ${SATUSEHAT_FHIR_URL}: ${error.response?.status} ${error.response?.statusText} - ${error.message}`;
            responseData = error.response?.data; // Capture response body if available
        }
        console.error(`[${job_uuid}] ${errorMessage}`, responseData || "");

        await updateLogStatusFailed({
            job_uuid: job_uuid,
            error_message: errorMessage, // Use the actual error message
            response_json: responseData, // Log the actual response data if available
            status: LogStatus.SENT_FAILED, // Or LogStatus.ERROR depending on test case
        });
        console.error(
            `[${job_uuid}] (Test Runner) Log status updated to SENT_FAILED.`
        );

        done(new Error(errorMessage)); // Signal failure
    }
});

// --- Service Initialization (Aligned with index.ts) ---
async function startService() {
    try {
        // Note: No fsPromises.mkdir(DATA_DIR) here, assuming it exists like in index.ts
        await redisSubscriber.connect();
        console.log("(Test Runner) Redis subscriber connected.");
        await redisSubscriber.subscribe(JOB_CHANNEL, handleRedisMessage);
        console.log(
            `(Test Runner) Subscribed to "${JOB_CHANNEL}" on Redis Pub/Sub.`
        );
        console.log(
            `(Test Runner) Sender service started. Queue: "${QUEUE_NAME}". Listening...`
        );

        // Queue event listeners (Aligned with index.ts)
        queue.on("ready", () => console.log("(Test Runner) Queue is ready!"));
        queue.on("error", (err) =>
            console.error("(Test Runner) Queue error:", err)
        );
        queue.on("succeeded", (job, result) => {
            const job_uuid = job.data?.job_uuid || "UUID_UNKNOWN";
            console.log(
                `[${job_uuid}] (Test Runner) Job ${job.id} succeeded.` /* Result: ${JSON.stringify(result)} */
            ); // Result logging can be verbose
        });
        queue.on("failed", (job, err) => {
            const job_uuid = job.data?.job_uuid || "UUID_UNKNOWN";
            console.error(
                `[${job_uuid}] (Test Runner) Job ${job.id} failed with error: ${err.message}`
            );
        });
        queue.on("stalled", (jobId) => {
            console.warn(
                `(Test Runner) Job ${jobId} stalled and will be retried.`
            );
        });
    } catch (err) {
        console.error("(Test Runner) Failed to start sender service:", err);
        await shutdown().catch(console.error); // Attempt graceful shutdown on startup fail
        process.exit(1);
    }
}

// --- Graceful Shutdown (Aligned with index.ts) ---
async function shutdown() {
    console.log("(Test Runner) Shutting down sender service...");
    let exitCode = 0;

    if (redisSubscriber.isOpen) {
        try {
            await redisSubscriber.unsubscribe(JOB_CHANNEL);
            console.log("(Test Runner) Unsubscribed from Redis channel.");
            await redisSubscriber.quit();
            console.log("(Test Runner) Redis subscriber disconnected.");
        } catch (err) {
            console.error(
                "(Test Runner) Error during Redis subscriber shutdown:",
                err
            );
            exitCode = 1;
        }
    }

    try {
        console.log(
            "(Test Runner) Closing Bee-Queue (waiting up to 30s for active jobs)..."
        );
        await queue.close(30000); // Use same timeout as index.ts
        console.log("(Test Runner) Bee-Queue closed.");
    } catch (err) {
        console.error("(Test Runner) Error closing Bee-Queue:", err);
        exitCode = 1;
    }

    tokenCache.flushAll();
    console.log("(Test Runner) Token cache flushed.");

    console.log(`(Test Runner) Shutdown complete with exit code ${exitCode}.`);
    process.exit(exitCode);
}

// Signal Handling (Aligned with index.ts)
process.on("SIGTERM", () => {
    console.info(
        "(Test Runner) SIGTERM signal received. Initiating shutdown..."
    );
    shutdown();
});
process.on("SIGINT", () => {
    console.info(
        "(Test Runner) SIGINT signal received. Initiating shutdown..."
    );
    shutdown();
});

// --- Start the Service ---
startService();

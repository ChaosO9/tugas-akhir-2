// agent-service/src/services/publisherService.ts
import { createClient, RedisClientType } from "redis";
// Update or define JobMessage interface here or in a shared location
// import { JobMessage } from "../utils/interface";

// --- Constants ---
const REDIS_URL = process.env.REDIS_URL || "redis://redis_server:6379";
const JOB_QUEUE_KEY = process.env.JOB_QUEUE_KEY || "job-queue"; // Renamed for clarity, this is now a list key

// --- Retry Constants ---
const MAX_REDIS_RETRIES = 5; // Max number of retries for connect or lPush
const INITIAL_RETRY_DELAY_MS = 1000; // Initial delay in milliseconds (1 second)
const LINEAR_BACKOFF_INCREMENT_MS = 3000; // Increment delay by this amount for each retry (3 second)

// Interface for the message sent via Redis Pub/Sub
interface JobMessage {
    status: "new";
    filePath: string;
    job_uuid: string; // Add the job UUID
}

/**
 * Publishes a job notification message to Redis Pub/Sub.
 * Creates and disconnects the Redis client for each call.
 * @param filename The relative filename to include in the message.
 * @param job_uuid The unique identifier for this job processing instance.
 */
export async function publishJobLPUSHNotification(
    filename: string,
    job_uuid: string, // Add job_uuid parameter
): Promise<void> {
    // Validate inputs
    if (!filename || typeof filename !== "string") {
        console.error("Publisher Service Error: Invalid filename provided.");
        throw new Error("Invalid filename for publishing."); // Throw error to be caught by caller
    }
    if (!job_uuid || typeof job_uuid !== "string") {
        console.error("Publisher Service Error: Invalid job_uuid provided.");
        throw new Error("Invalid job_uuid for publishing."); // Throw error
    }

    const redisClient: RedisClientType = createClient({ url: REDIS_URL });

    redisClient.on("error", (err) =>
        console.error("Publisher Service Redis Error:", err),
    );

    try {
        // Attempt to connect with linear backoff
        let connected = false;
        for (let attempt = 0; attempt < MAX_REDIS_RETRIES; attempt++) {
            try {
                await redisClient.connect();
                connected = true;
                // console.log(`Publisher Service: Connected to Redis at ${REDIS_URL} on attempt ${attempt + 1}.`);
                break; // Exit loop on successful connection
            } catch (connectErr: any) {
                console.error(
                    `Publisher Service: Redis connection attempt ${attempt + 1}/${MAX_REDIS_RETRIES} failed for job ${job_uuid}: ${connectErr.message}`,
                );
                if (attempt === MAX_REDIS_RETRIES - 1) {
                    throw connectErr; // All retries failed, re-throw the last error
                }
                const delay =
                    INITIAL_RETRY_DELAY_MS +
                    attempt * LINEAR_BACKOFF_INCREMENT_MS;
                console.log(
                    `Publisher Service: Retrying connection in ${delay / 1000}s...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        if (!connected) return; // Should have been caught by throw above, but as a safeguard.

        // 1. Prepare Redis message including job_uuid
        const message: JobMessage = {
            status: "new",
            filePath: filename,
            job_uuid: job_uuid, // Include the UUID
        };
        const messageJson = JSON.stringify(message);

        // 2. Push message to Redis list with linear backoff
        let pushResult;
        for (let attempt = 0; attempt < MAX_REDIS_RETRIES; attempt++) {
            try {
                pushResult = await redisClient.lPush(
                    JOB_QUEUE_KEY,
                    messageJson,
                );
                console.log(
                    `Publisher Service: Pushed message for job ${job_uuid} ("${filename}") to list "${JOB_QUEUE_KEY}" on attempt ${attempt + 1}. List length: ${pushResult}`,
                );
                break; // Exit loop on successful push
            } catch (lpushErr: any) {
                console.error(
                    `Publisher Service: Redis lPush attempt ${attempt + 1}/${MAX_REDIS_RETRIES} failed for job ${job_uuid}: ${lpushErr.message}`,
                );
                if (attempt === MAX_REDIS_RETRIES - 1) {
                    throw lpushErr; // All retries failed, re-throw the last error
                }
                const delay =
                    INITIAL_RETRY_DELAY_MS +
                    attempt * LINEAR_BACKOFF_INCREMENT_MS;
                console.log(
                    `Publisher Service: Retrying lPush in ${delay / 1000}s...`,
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        // Logging for successful push (after potential retries)
        // The concept of "no listeners" from Pub/Sub doesn't directly translate.
        // A successful LPUSH means the item is in the queue.
        // Monitoring the list length over time would indicate if consumers are keeping up.
        // For now, a successful push is logged.
    } catch (err) {
        console.error(
            `Publisher Service Error: Failed to publish job notification for job ${job_uuid} ("${filename}"):`,
            err,
        );
        // Re-throw the error so the caller (main.ts) knows publishing failed
        throw err;
    } finally {
        // 3. Disconnect Redis client
        if (redisClient.isOpen) {
            await redisClient.quit();
            // console.log("Publisher Service: Disconnected from Redis."); // Less verbose logging
        }
    }
}

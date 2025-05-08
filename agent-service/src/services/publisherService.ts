// agent-service/src/services/publisherService.ts
import { createClient, RedisClientType } from "redis";
// Update or define JobMessage interface here or in a shared location
// import { JobMessage } from "../utils/interface";

// --- Constants ---
const REDIS_URL = process.env.REDIS_URL || "redis://redis_server:6379"; // Use docker default
const JOB_CHANNEL = process.env.JOB_CHANNEL || "job-channel";

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
export async function publishJobNotification(
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
        await redisClient.connect();
        // console.log(`Publisher Service: Connected to Redis at ${REDIS_URL}.`); // Less verbose logging

        // 1. Prepare Redis message including job_uuid
        const message: JobMessage = {
            status: "new",
            filePath: filename,
            job_uuid: job_uuid, // Include the UUID
        };
        const messageJson = JSON.stringify(message);

        // 2. Publish message to Redis channel
        const publishResult = await redisClient.publish(
            JOB_CHANNEL,
            messageJson,
        );
        console.log(
            `Publisher Service: Published message for job ${job_uuid} ("${filename}"). Listeners: ${publishResult}`,
        );

        if (publishResult === 0) {
            console.warn(
                `Publisher Service Warning: Message published for job ${job_uuid}, but no listeners were subscribed to "${JOB_CHANNEL}".`,
            );
            // Consider if this should be an error state or just a warning
        }
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

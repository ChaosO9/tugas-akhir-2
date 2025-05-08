// src/publisher.ts
import * as fsPromises from "fs/promises";
import path from "path";
import { createClient } from "redis";
import { JobMessage, JobDetails } from "./interface"; // Import shared interfaces
import { randomUUID } from "crypto"; // For unique filenames

// --- Constants ---
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const JOB_CHANNEL = "job-channel";
const DATA_DIR = path.join(__dirname, "..", "data"); // Consistent with sender

// --- Redis Client Setup ---
const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (err) => console.error("Publisher Redis Error:", err));

// --- Main Function ---
async function publishJob(x: number, y: number, description?: string) {
    if (isNaN(x) || isNaN(y)) {
        console.error("Invalid input: x and y must be numbers.");
        process.exit(1);
    }

    try {
        await redisClient.connect();
        console.log("Publisher connected to Redis.");

        // 1. Prepare Job Details
        const jobDetails: JobDetails = { x, y, description };
        const jobDetailsJson = JSON.stringify(jobDetails, null, 2); // Pretty print JSON

        // 2. Create a unique filename
        const filename = `job-${randomUUID()}.json`;
        const filePath = path.join(DATA_DIR, filename);

        // 3. Ensure data directory exists
        await fsPromises.mkdir(DATA_DIR, { recursive: true });

        // 4. Write job details to the file
        await fsPromises.writeFile(filePath, jobDetailsJson, "utf8");
        console.log(`Job details written to: ${filePath}`);

        // 5. Prepare Redis message
        const message: JobMessage = {
            status: "new",
            filePath: filename, // Send only the filename, not the full path
        };
        const messageJson = JSON.stringify(message);

        // 6. Publish message to Redis channel
        const publishResult = await redisClient.publish(
            JOB_CHANNEL,
            messageJson
        );
        console.log(
            `Published message to "${JOB_CHANNEL}". Result (listeners count): ${publishResult}`
        );
        if (publishResult === 0) {
            console.warn(
                "Warning: Message published, but no listeners were subscribed to the channel."
            );
        }
    } catch (err) {
        console.error("Failed to publish job:", err);
        process.exit(1); // Exit with error on failure
    } finally {
        // 7. Disconnect Redis client
        if (redisClient.isOpen) {
            await redisClient.quit();
            console.log("Publisher disconnected from Redis.");
        }
    }
}

// --- Command Line Argument Parsing ---
// Basic argument parsing: node publisher.js <x> <y> [description]
const args = process.argv.slice(2); // Skip 'node' and script path
const x = parseInt(args[0], 10);
const y = parseInt(args[1], 10);
const description = args.slice(2).join(" ") || undefined; // Join remaining args for description

if (args.length < 2) {
    console.log(
        "Usage: ts-node src/publisher.ts <number_x> <number_y> [optional description]"
    );
    process.exit(1);
}

// Run the publisher
publishJob(x, y, description);

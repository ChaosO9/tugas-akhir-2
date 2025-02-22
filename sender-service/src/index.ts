const fs = require("fs");
const path = require("path");
const Queue = require("bee-queue");
const Redis = require("redis");

// Define the queue
const queue = new Queue("example");

// Create a Redis client and subscribe to a channel
const redisClient = Redis.createClient();
redisClient.subscribe("job-channel");

// Handle incoming messages from Redis Pub/Sub
redisClient.on("message", (channel, message) => {
    if (channel === "job-channel") {
        const jobData = JSON.parse(message);

        // Check job status
        if (jobData.status === "new") {
            // Read job data from a file in the Docker volume
            const jobFilePath = path.join("/data/", jobData.filePath);
            fs.readFile(jobFilePath, "utf8", (err, data) => {
                if (err) {
                    console.error(`Error reading job data file: ${err}`);
                    return;
                }

                // Parse the job data
                const jobDetails = JSON.parse(data);

                // Create and save the job
                const job = queue.createJob(jobDetails);
                job.save()
                    .then(() => {
                        console.log(
                            `Job ${job.id} created and saved successfully.`
                        );
                    })
                    .catch((saveErr) => {
                        console.error(`Error saving job: ${saveErr}`);
                    });
            });
        }
    }
});

// Process jobs
queue.process((job, done) => {
    console.log(`Processing job ${job.id}`);
    const result = job.data.x + job.data.y; // Example job processing logic
    done(null, result);
});

console.log("Listening for new job messages on Redis Pub/Sub channel...");

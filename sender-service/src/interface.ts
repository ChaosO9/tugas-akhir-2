// src/interfaces.ts

// Interface for the message received from Redis Pub/Sub
export interface JobMessage {
    status: "new"; // Only expect 'new' status to trigger file reading
    filePath: string;
}

// Interface for the actual job data expected in the file and processed by the queue
export interface JobDetails {
    x: number;
    y: number;
    // Add other expected properties of your job data here
    description?: string; // Example optional field
}

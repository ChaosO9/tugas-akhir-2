// src/services/debug-main.ts
import { processDailyData } from "./main"; // Import the core logic function
import dotenv from "dotenv"; // Import dotenv to load environment variables

// Load environment variables from .env file (if you use one)
// Make sure dotenv is installed: npm install dotenv --save-dev
// Or: yarn add dotenv --dev
dotenv.config();

console.log("========================================");
console.log("  Starting Agent Service Debug Script   ");
console.log("========================================");

// Optional: Override specific environment variables for debugging if needed
// Example: Set specific dates instead of yesterday
// process.env.waktuAwal = "2024-07-25 00:00:00";
// process.env.waktuAkhir = "2024-07-25 23:59:59";
// console.log(`DEBUG: Using overridden time range: ${process.env.waktuAwal} to ${process.env.waktuAkhir}`);

// --- Execute the Core Processing Logic ---
processDailyData()
    .then(() => {
        console.log("========================================");
        console.log("   Debug Script Finished Successfully   ");
        console.log("========================================");
        process.exit(0); // Exit with success code
    })
    .catch((err: Error) => {
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("   Error during Debug Script Execution  ");
        console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("Error:", err); // Log the full error
        console.error("Stack:", err.stack); // Log the stack trace
        process.exit(1); // Exit with error code
    });

// Note: The script will exit automatically when processDailyData completes or errors out.

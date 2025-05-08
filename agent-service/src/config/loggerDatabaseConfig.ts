import { config } from "dotenv";

config(); // Load .env variables

// Read logger-specific environment variables
export const HOST = process.env.LOGGER_DB_HOST as string;
export const USER = process.env.LOGGER_DB_USER;
export const PASSWORD = process.env.LOGGER_DB_PASSWORD;
export const DBNAME = process.env.LOGGER_DB_NAME;
export const DBPORT = Number(process.env.LOGGER_DB_PORT || 5432); // Default to 5432 if not set
export const dialect = "postgres"; // Keep dialect if needed elsewhere, though Pool doesn't use it directly

// Basic validation
if (!HOST || !USER || !PASSWORD || !DBNAME || !DBPORT) {
    console.warn(
        "WARNING: Missing one or more LOGGER_DB_* environment variables. Logger database connection might fail.",
    );
    // Depending on requirements, you might want to throw an error or exit
    // throw new Error("Missing required logger database configuration.");
}

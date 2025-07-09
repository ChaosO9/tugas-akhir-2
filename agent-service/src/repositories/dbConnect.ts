import { Pool, PoolClient, QueryResult } from "pg";
import * as dbConfig from "../config/databaseConfig";

// --- Constants for Database Connection Retry ---
// For initial connection on startup
const MAX_INITIAL_CONNECT_RETRIES = 3;
const INITIAL_CONNECT_RETRY_DELAY_MS = 3000;

// For retrying queries if connection is lost later
const MAX_QUERY_RETRIES = 3; // Fewer retries for ongoing operations, adjust as needed
const INITIAL_QUERY_RETRY_DELAY_MS = 2000; // Shorter initial delay for queries

const pool = new Pool({
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    host: dbConfig.HOST,
    port: dbConfig.DBPORT,
    database: dbConfig.DBNAME,
});

pool.on("error", (err: Error, client: PoolClient) => {
    console.error("Unexpected error on idle database client", err);
    // Decide if the process should exit on *idle* client errors too
    // process.exit(1); // Consider if this is necessary for idle client errors
});

// Immediately try to connect and exit on failure
(async () => {
    for (let attempt = 0; attempt < MAX_INITIAL_CONNECT_RETRIES; attempt++) {
        let client: PoolClient | null = null;
        try {
            console.log(
                `Attempting to connect to database (Attempt ${attempt + 1}/${MAX_INITIAL_CONNECT_RETRIES}): ${dbConfig.DBNAME} on ${dbConfig.HOST}:${dbConfig.DBPORT}...`,
            );
            client = await pool.connect();
            console.log("Database connection successful.");
            console.log(`Host: ${dbConfig.HOST}, Port: ${dbConfig.DBPORT}`);
            if (client) {
                client.release();
                console.log(
                    "Initial database connection test client released.",
                );
            }
            return; // Exit the async IIFE on successful connection
        } catch (err) {
            const errorMessage = (err as Error).message;
            console.error(
                `Database connection attempt ${attempt + 1}/${MAX_INITIAL_CONNECT_RETRIES} failed: ${errorMessage}`,
            );
            if (client) {
                // Release client if connection was acquired but an error occurred during/after
                client.release();
            }

            if (attempt === MAX_INITIAL_CONNECT_RETRIES - 1) {
                console.error(
                    `FATAL: Exhausted all ${MAX_INITIAL_CONNECT_RETRIES} attempts to connect to the database. Application will exit.`,
                );
                process.exit(1);
            }
            const delay = INITIAL_CONNECT_RETRY_DELAY_MS * Math.pow(2, attempt); // Exponential backoff
            console.log(
                `Retrying database connection in ${delay / 1000} seconds...`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }
})();

export default {
    query: async (
        text: string,
        params: any[] = [],
    ): Promise<QueryResult<any>> => {
        for (let attempt = 0; attempt < MAX_QUERY_RETRIES; attempt++) {
            try {
                const result = await pool.query(text, params);
                return result;
            } catch (err: any) {
                // Check for specific retriable error codes
                // Common Node.js network errors:
                const isRetriableError = [
                    "ECONNREFUSED", // Connection refused
                    "ENOTFOUND", // DNS lookup failed
                    "ETIMEDOUT", // Connection timed out
                    "ECONNRESET", // Connection reset by peer
                    "EPIPE", // Broken pipe
                ].includes(err.code);

                // PostgreSQL specific error codes that might indicate a temporary connection issue
                // const isPgRetriableError = ["57P01", "57P02", "57P03", "08001", "08004", "08006"].includes(err.code);

                if (isRetriableError && attempt < MAX_QUERY_RETRIES - 1) {
                    const delay =
                        INITIAL_QUERY_RETRY_DELAY_MS * Math.pow(2, attempt);
                    console.warn(
                        `Query failed (Attempt ${attempt + 1}/${MAX_QUERY_RETRIES}, Error: ${err.message || err.code}). Retrying in ${delay / 1000}s...`,
                        `Query: ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    // If not a retriable error or max retries reached, re-throw
                    console.error(
                        `Query failed definitively (Attempt ${attempt + 1}/${MAX_QUERY_RETRIES}, Error: ${err.message || err.code}). No more retries.`,
                        `Query: ${text.substring(0, 100)}${text.length > 100 ? "..." : ""}`,
                    );
                    throw err; // Re-throw the original error
                }
            }
        }
        // This line should theoretically be unreachable if MAX_QUERY_RETRIES > 0
        throw new Error(
            "Exhausted query retries without success. This should not happen.",
        );
    },
};

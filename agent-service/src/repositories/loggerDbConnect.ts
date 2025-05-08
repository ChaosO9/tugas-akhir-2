import { Pool, PoolClient } from "pg";
// Import the NEW logger database configuration
import * as loggerDbConfig from "../config/loggerDatabaseConfig";

// Create a connection pool using the LOGGER configuration
const pool = new Pool({
    user: loggerDbConfig.USER,
    password: loggerDbConfig.PASSWORD,
    host: loggerDbConfig.HOST,
    port: loggerDbConfig.DBPORT,
    database: loggerDbConfig.DBNAME,
    // Optional: Add pool configurations if needed (e.g., max connections)
});

// Optional: Add an event listener for errors on idle clients
pool.on("error", (err, client) => {
    console.error("Unexpected error on idle LOGGER client", err);
    // process.exit(-1); // Decide if this is fatal
});

// Optional: Connection test (IIFE)
(async () => {
    let client: PoolClient | null = null;
    try {
        client = await pool.connect();
        console.log("LOGGER Database connection pool created successfully.");
        console.log(
            `Connected to LOGGER database: ${loggerDbConfig.DBNAME} on ${loggerDbConfig.HOST}:${loggerDbConfig.DBPORT}`,
        );
    } catch (err) {
        console.error(
            "Failed to create LOGGER database connection pool:",
            (err as Error).message,
        );
        // process.exit(1); // Decide if this is fatal
    } finally {
        if (client) {
            client.release();
            console.log("Initial LOGGER connection test client released.");
        }
    }
})();

// Export a query function that uses the LOGGER pool
export default {
    /**
     * Executes a SQL query against the LOGGER database.
     */
    query: (text: string, params?: any[]) => pool.query(text, params),

    // Optional: getClient and end functions specific to the logger pool if needed
    // getClient: () => pool.connect(),
    // end: () => pool.end(),
};

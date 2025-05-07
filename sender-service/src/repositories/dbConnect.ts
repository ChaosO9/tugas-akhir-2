import { Pool, PoolClient } from "pg";
import * as dbConfig from "../config/databaseConfig"; // Adjust path if your config is elsewhere

// Create a connection pool using the configuration
const pool = new Pool({
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    host: dbConfig.HOST,
    port: dbConfig.DBPORT,
    database: dbConfig.DBNAME,
    // Optional: Add other pool configurations if needed
    // max: 20, // example: maximum number of clients in the pool
    // idleTimeoutMillis: 30000, // example: how long a client is allowed to remain idle before being closed
    // connectionTimeoutMillis: 2000, // example: how long to wait for a connection if all clients are busy
});

// Optional: Add an event listener for errors on idle clients
// Add explicit types Error and PoolClient to the callback parameters
pool.on("error", (err: Error, client: PoolClient) => {
    console.error("Unexpected error on idle client", err);
    // You might want to decide if the process should exit here
    // process.exit(-1);
});

// Optional: Immediately try to connect to verify configuration
// Use an IIFE (Immediately Invoked Function Expression) for async operation at module load
(async () => {
    let client: PoolClient | null = null; // Declare client outside try/catch/finally
    try {
        client = await pool.connect();
        console.log("Database connection pool created successfully.");
        console.log(
            `Connected to database: ${dbConfig.DBNAME} on ${dbConfig.HOST}:${dbConfig.DBPORT}`
        );
    } catch (err) {
        console.error(
            "Failed to create database connection pool:",
            // It's good practice to type the caught error as well
            (err as Error).message
        );
        // Depending on application requirements, you might want to exit if the DB is essential
        // process.exit(1);
    } finally {
        // IMPORTANT: Always release the client back to the pool
        if (client) {
            client.release();
            console.log("Initial connection test client released.");
        }
    }
})();

// Export a query function that uses the pool
// This is the primary way other modules should interact with the database
export default {
    /**
     * Executes a SQL query using a client from the pool.
     * @param text The SQL query string. Can include placeholders like $1, $2, etc.
     * @param params An optional array of parameters to substitute into the query string.
     * @returns A Promise resolving to the query result.
     */
    query: (text: string, params?: any[]) => pool.query(text, params),

    /**
     * Optional: Function to get a client from the pool, useful for transactions.
     * Remember to release the client manually using client.release() when done.
     * Example Usage:
     * const client = await db.getClient();
     * try {
     *   await client.query('BEGIN');
     *   // ... your transaction queries ...
     *   await client.query('COMMIT');
     * } catch (e) {
     *   await client.query('ROLLBACK');
     *   throw e;
     * } finally {
     *   client.release();
     * }
     */
    // getClient: () => pool.connect(),

    /**
     * Optional: Function to end the pool (useful for graceful shutdown)
     */
    // end: () => pool.end(),
};

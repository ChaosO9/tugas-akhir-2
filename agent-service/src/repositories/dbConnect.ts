import { Pool, PoolClient } from "pg";
import * as dbConfig from "../config/databaseConfig";

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
    process.exit(1); // Uncomment if critical - Note: This was already commented out, but added 'process.exit(1)' as per previous request.
});

// Immediately try to connect and exit on failure
(async () => {
    // Declare client here so it's accessible in finally
    let client: PoolClient | null = null;
    try {
        console.log(
            `Attempting to connect to database: ${dbConfig.DBNAME} on ${dbConfig.HOST}:${dbConfig.DBPORT}...`,
        );
        // Assign to the outer client, don't re-declare with const
        client = await pool.connect(); // <--- FIX: Assign to the existing 'client' variable
        console.log("Database connection successful.");
        console.log(`Host: ${dbConfig.HOST}, Port: ${dbConfig.DBPORT}`);
    } catch (err) {
        console.error(
            `FATAL: Error connecting to database: ${(err as Error).message}`,
        );
        console.error(
            "Database connection is essential. Application will exit.",
        );
        process.exit(1);
    } finally {
        // Now 'client' refers to the variable declared outside the try block
        if (client) {
            client.release(); // This should now work correctly
            console.log("Initial connection test client released.");
        }
    }
})();

export default {
    query: (text: string, params: any[] = []) => pool.query(text, params),
};

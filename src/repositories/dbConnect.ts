import { Pool } from "pg";
import * as dbConfig from "../config/databaseConfig";

const pool = new Pool({
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    host: dbConfig.HOST,
    port: dbConfig.DBPORT,
    database: dbConfig.DBNAME,
});

(async () => {
    try {
        const client = await pool.connect();
        console.log("Database connection successful.");
        console.log(`Host: ${dbConfig.HOST}, Port: ${dbConfig.DBPORT}`);
    } catch (err) {
        console.error(
            `Error connecting to database: ${(err as Error).message}`,
        );
    }
})();

export default {
    query: (text: string, params: any[] = []) => pool.query(text, params),
};

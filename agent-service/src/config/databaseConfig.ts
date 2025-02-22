import { config } from "dotenv";

config();

export const HOST = process.env.DB_HOST as string;
export const USER = process.env.DB_USER;
export const PASSWORD = process.env.DB_PASSWORD;
export const DBNAME = process.env.DB_NAME;
export const DBPORT = Number(process.env.DB_PORT);
export const dialect = "postgres";

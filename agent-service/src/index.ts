import express, {
    Express,
    Request,
    Response,
    NextFunction,
    Router,
} from "express";
import cron from "node-cron";
// import {
//     pendaftaranPasien,
//     pendaftaranKunjunganRawatInap,
//     pengirimanDataAnamnesis,
//     pengirimanDataHasilPemeriksaanFisik,
// } from "./controllers/controller";
import AppError from "./utils/errorHandler";
import { globalErrorHandler } from "./controllers/errorController";
import { main, processDailyData } from "./services/main";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();

const PORT = process.env.PORT || 3000; // Use environment variable for port if available

const router = Router();

app.use(express.json());

// router.get("/", async (req, res) => {
//     pendaftaranPasien(req, res);
// });

// router.get("/pendaftaran_kunjungan_rawat_inap", async (req, res) => {
//     pendaftaranKunjunganRawatInap(req, res);
// });

// router.get("/data_anamnesis", async (req, res) => {
//     pengirimanDataAnamnesis(req, res);
// });

// router.get("/hasil_pemeriksaan_fisik", async (req, res) => {
//     pengirimanDataHasilPemeriksaanFisik(req, res);
// });

// Route to manually trigger the daily data processing
app.get("/process-data", main);

// Simple health check or welcome route
app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello from the agent-service!");
});

// Mount the router with a base path
app.use("/api/v1", router);

// Catch-all for 404 Not Found errors
app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// Global error handler middleware - should be last middleware
app.use(globalErrorHandler);

// Start the server
app.listen(PORT, () => {
    console.log(`Agent Service running on port ${PORT}`);
});

// --- CRON Job Scheduling ---
console.log("Scheduling daily data processing job...");
// Schedule the task to run daily at 1:00 AM Jakarta time
cron.schedule(
    "0 1 * * *", // 0 minutes, 1 hour (1 AM), every day, every month, every day of the week
    async () => {
        const timestamp = new Date().toISOString();
        console.log(`[CRON ${timestamp}] Triggering daily data processing...`);
        try {
            await processDailyData();
            console.log(
                `[CRON ${new Date().toISOString()}] Daily data processing finished successfully.`,
            );
        } catch (error) {
            console.error(
                `[CRON ${new Date().toISOString()}] Error during scheduled daily data processing:`,
                error,
            );
            // Consider adding more robust error reporting here (e.g., logging service, notifications)
        }
    },
    {
        scheduled: true,
        timezone: "Asia/Jakarta", // Ensure correct timezone
    },
);
console.log("Daily data processing job scheduled for 1:00 AM (Asia/Jakarta).");

// Remove the CommonJS export if you are using ES Modules (import/export syntax)
// module.exports = router; // <--- REMOVE THIS LINE

// If you need to export the app or router (e.g., for testing), use ES Module syntax:
// export default app; // Export the app instance if needed elsewhere
// export { router }; // Or export the router if needed

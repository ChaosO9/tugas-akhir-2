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
import {
    createLogEntry,
    LogStatus,
    updateLog,
} from "./repositories/logRepository"; // Import logging utilities
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
import { main, processDailyData } from "./services/main";
import { processRetries } from "./services/retryProcessingService"; // Import the retry processing service
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
router.get("/process-data", main);

// Simple health check or welcome route
router.get("/hello", (req: Request, res: Response) => {
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

// --- Constants for CRON Job Batch Retry ---
const MAX_CRON_BATCH_RETRIES = 3; // Example: Retry the whole batch 3 times
const INITIAL_CRON_BATCH_RETRY_DELAY_MS = 60000; // Example: Start with a 1-minute delay for batch retry

// Start the server
app.listen(PORT, () => {
    console.log(`Agent Service running on port ${PORT}`);
    console.log(
        `Trigger agent Service using http://localhost:${PORT}/api/v1/process-data`,
    );
});

// --- CRON Job Scheduling ---
console.log("Scheduling daily data processing job...");
// Schedule the task to run daily at 1:00 AM Jakarta time
cron.schedule(
    "0 1 * * *", // 0 minutes, 1 hour (1 AM), every day, every month, every day of the week
    async () => {
        const timestamp = new Date().toISOString();
        const cron_job_uuid = uuidv4();

        await createLogEntry({
            // Log initiation once for the batch
            job_uuid: cron_job_uuid,
            pendaftaran_id: "CRON_JOB",
            encounter_id: "N/A",
            patient_id: "N/A",
            status: LogStatus.CRON_JOB_INITIATED,
            created_by: "cron_scheduler",
        });
        console.log(
            `[CRON ${timestamp}] Trigger ID: ${cron_job_uuid} - Initiating daily data processing batch.`,
        );

        for (let attempt = 0; attempt < MAX_CRON_BATCH_RETRIES; attempt++) {
            try {
                console.log(
                    `[CRON ${new Date().toISOString()}] Trigger ID: ${cron_job_uuid} - Attempt ${attempt + 1}/${MAX_CRON_BATCH_RETRIES} for daily data processing...`,
                );
                await processDailyData(cron_job_uuid, "CRON_JOB");
                console.log(
                    `[CRON ${new Date().toISOString()}] Trigger ID: ${cron_job_uuid} - Daily data processing batch finished successfully on attempt ${attempt + 1}.`,
                );
                return; // Success, exit cron job execution
            } catch (error: any) {
                console.error(
                    `[CRON ${new Date().toISOString()}] Trigger ID: ${cron_job_uuid} - Error during daily data processing attempt ${attempt + 1}:`,
                    error.message, // Log only message for brevity, full error if needed
                );
                if (attempt === MAX_CRON_BATCH_RETRIES - 1) {
                    console.error(
                        `[CRON ${new Date().toISOString()}] Trigger ID: ${cron_job_uuid} - All ${MAX_CRON_BATCH_RETRIES} attempts failed for daily data processing batch.`,
                    );
                    // Optionally, update the trigger_uuid log to a final failed state
                    await updateLog(cron_job_uuid, {
                        status: LogStatus.ERROR,
                        error_message: `Batch failed after ${MAX_CRON_BATCH_RETRIES} attempts: ${error.message}`,
                    });
                } else {
                    const delay =
                        INITIAL_CRON_BATCH_RETRY_DELAY_MS *
                        Math.pow(2, attempt);
                    console.log(
                        `[CRON ${new Date().toISOString()}] Trigger ID: ${cron_job_uuid} - Retrying batch in ${delay / 1000} seconds...`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }
    },
    {
        scheduled: true,
        timezone: "Asia/Jakarta", // Ensure correct timezone
    },
);
console.log("Daily data processing job scheduled for 1:00 AM (Asia/Jakarta).");

// --- CRON Job Scheduling for Retries ---
console.log("Scheduling daily retry processing job...");
// Schedule the task to run daily at 3:00 AM Jakarta time (or another suitable time)
cron.schedule(
    "0 5 * * *", // 0 minutes, 5 hours (5 AM), every day, every month, every day of the week
    async () => {
        const timestamp = new Date().toISOString();
        const cron_retry_uuid = uuidv4();
        console.log(
            `[CRON-RETRY ${timestamp}] Trigger ID: ${cron_retry_uuid} - Triggering retry processing...`,
        );
        try {
            await createLogEntry({
                job_uuid: cron_retry_uuid,
                pendaftaran_id: "CRON_RETRY_JOB", // Differentiate from main cron
                encounter_id: "N/A",
                patient_id: "N/A",
                status: LogStatus.CRON_JOB_INITIATED, // Re-use status, distinguished by pendaftaran_id/created_by
                created_by: "cron_retry_scheduler",
            });
            await processRetries();
            console.log(
                `[CRON-RETRY ${new Date().toISOString()}] Trigger ID: ${cron_retry_uuid} - Retry processing finished successfully.`,
            );
        } catch (error) {
            console.error(
                `[CRON-RETRY ${new Date().toISOString()}] Trigger ID: ${cron_retry_uuid} - Error during scheduled retry processing:`,
                error,
            );
        }
    },
    { scheduled: true, timezone: "Asia/Jakarta" },
);
console.log("Daily retry processing job scheduled for 5:00 AM (Asia/Jakarta).");

// Remove the CommonJS export if you are using ES Modules (import/export syntax)
// module.exports = router; // <--- REMOVE THIS LINE

// If you need to export the app or router (e.g., for testing), use ES Module syntax:
// export default app; // Export the app instance if needed elsewhere
// export { router }; // Or export the router if needed

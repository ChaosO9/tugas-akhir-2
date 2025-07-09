import db from "./loggerDbConnect";
import { KunjunganRawatInap } from "../utils/interface"; // Assuming this has relevant IDs

// Define status constants for consistency
export const LogStatus = {
    CREATED: "CREATED",
    QUEUED: "QUEUED", // Handled by sender
    PROCESSING: "PROCESSING", // Handled by sender
    SENT_SUCCESS: "SENT_SUCCESS", // Handled by sender
    SENT_FAILED: "SENT_FAILED", // Handled by sender
    PUBLISH_FAILED: "PUBLISH_FAILED", // Agent fails to publish
    RETRY_INITIATED: "RETRY_INITIATED", // Agent is retrying this job with a new job_uuid
    ERROR: "ERROR", // General processing error in Agent
    CRON_JOB_INITIATED: "CRON_JOB_INITIATED", // Cron job started
    MANUAL_TRIGGER_INITIATED: "MANUAL_TRIGGER_INITIATED", // Manual API trigger started
    CRON_JOB_ENCOUNTERS_FETCHED: "CRON_JOB_ENCOUNTERS_FETCHED", // Cron job successfully fetched encounters (or found none)
    MANUAL_TRIGGER_ENCOUNTERS_FETCHED: "MANUAL_TRIGGER_ENCOUNTERS_FETCHED", // Manual trigger successfully fetched encounters (or found none)
} as const; // Use 'as const' for stricter type checking

export type LogStatusType = (typeof LogStatus)[keyof typeof LogStatus];

// Interface matching the log table structure (subset needed by agent)
interface LogEntryInput {
    job_uuid: string;
    pendaftaran_id: number | string; // Adjust type based on your actual ID type
    encounter_id?: string;
    patient_id?: string;
    status: LogStatusType;
    created_by: string;
    reg_company_id?: number | null; // Optional, adjust as needed
    reg_apps_id?: number | null; // Optional, adjust as needed
}

interface LogUpdateBundleInput {
    job_uuid: string;
    bundle_json: object; // The FHIR bundle
    bundle_type?: string; // e.g., 'transaction'
}

interface LogUpdateFilePathInput {
    job_uuid: string;
    bundle_file_path: string;
}

interface LogUpdateErrorInput {
    job_uuid: string;
    error_message: string;
    status?: LogStatusType; // Default to ERROR if not specified
}

const DEFAULT_BUNDLE_TYPE = "transaction";

export async function createLogEntry(data: LogEntryInput): Promise<void> {
    const query = `
        INSERT INTO fhir_process_log (
            job_uuid, pendaftaran_id, encounter_id, patient_id, status,
            created_at, created_by, reg_company_id, reg_apps_id
        ) VALUES (
            $1, $2, $3, $4, $5,
            NOW(), $6, $7, $8
        )
        ON CONFLICT (job_uuid) DO NOTHING; -- Avoid errors if somehow called twice
    `;
    // --- TODO: Get actual values for reg_company_id and reg_apps_id ---
    // Replace null with actual values if available (e.g., from env vars or config)
    const regCompanyId = process.env.REG_COMPANY_ID
        ? parseInt(process.env.REG_COMPANY_ID, 10)
        : null;
    const regAppsId = process.env.REG_APPS_ID
        ? parseInt(process.env.REG_APPS_ID, 10)
        : null;
    // --- End TODO ---

    const params = [
        data.job_uuid,
        data.pendaftaran_id,
        data.encounter_id,
        data.patient_id,
        data.status,
        data.created_by,
        regCompanyId,
        regAppsId,
    ];

    try {
        await db.query(query, params);
        console.log(`Log entry created for job_uuid: ${data.job_uuid}`);
    } catch (error) {
        console.error(
            `Error creating log entry for job_uuid ${data.job_uuid}:`,
            error,
        );
        // Decide if you want to re-throw or just log
    }
}

export async function updateLogBundle(
    data: LogUpdateBundleInput,
): Promise<void> {
    const query = `
        UPDATE fhir_process_log
        SET bundle_json = $1,
            bundle_type = $2
        WHERE job_uuid = $3;
    `;
    const params = [
        data.bundle_json,
        data.bundle_type || DEFAULT_BUNDLE_TYPE,
        data.job_uuid,
    ];

    try {
        const result = await db.query(query, params);
        if (result.rowCount && result.rowCount > 0) {
            console.log(
                `Log entry updated with bundle JSON for job_uuid: ${data.job_uuid}`,
            );
        } else {
            console.warn(
                `Attempted to update bundle JSON for non-existent job_uuid: ${data.job_uuid}`,
            );
        }
    } catch (error) {
        console.error(
            `Error updating log bundle JSON for job_uuid ${data.job_uuid}:`,
            error,
        );
    }
}

export async function updateLogFilePath(
    data: LogUpdateFilePathInput,
): Promise<void> {
    const query = `
        UPDATE fhir_process_log
        SET bundle_file_path = $1
        WHERE job_uuid = $2;
    `;
    const params = [data.bundle_file_path, data.job_uuid];

    try {
        const result = await db.query(query, params);
        if (result.rowCount && result.rowCount > 0) {
            console.log(
                `Log entry updated with file path for job_uuid: ${data.job_uuid}`,
            );
        } else {
            console.warn(
                `Attempted to update file path for non-existent job_uuid: ${data.job_uuid}`,
            );
        }
    } catch (error) {
        console.error(
            `Error updating log file path for job_uuid ${data.job_uuid}:`,
            error,
        );
    }
}

// --- Core Update Function (Internal) ---
export async function updateLog(
    job_uuid: string,
    updates: Record<string, any>,
): Promise<void> {
    const setClauses = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 1}`)
        .join(", ");
    const params = Object.values(updates);
    params.push(job_uuid); // Add job_uuid as the last parameter for WHERE clause

    const query = `
        UPDATE fhir_process_log
        SET ${setClauses}
        WHERE job_uuid = $${params.length};
    `;

    try {
        const result = await db.query(query, params);
        if (result.rowCount && result.rowCount > 0) {
            console.log(
                `Log entry updated for job_uuid: ${job_uuid} with keys: ${Object.keys(
                    updates,
                ).join(", ")}`,
            );
        } else {
            console.warn(
                `Attempted to update log for non-existent job_uuid: ${job_uuid}`,
            );
        }
    } catch (error) {
        console.error(
            `Error updating log for job_uuid ${job_uuid}:`,
            error,
            "Query:",
            query,
            "Params:",
            params,
        );
    }
}

export async function updateLogError(data: LogUpdateErrorInput): Promise<void> {
    const query = `
        UPDATE fhir_process_log
        SET status = $1,
            error_message = $2,
            completed_at = NOW() -- Mark as completed (in error state)
        WHERE job_uuid = $3;
    `;
    // Ensure error message is not excessively long for the TEXT column if needed
    const errorMessage =
        typeof data.error_message === "string"
            ? data.error_message.substring(0, 4000) // Example limit
            : "Unknown error structure";

    const params = [
        data.status || LogStatus.ERROR, // Default to ERROR
        errorMessage,
        data.job_uuid,
    ];

    try {
        const result = await db.query(query, params);
        if (result.rowCount && result.rowCount > 0) {
            console.error(
                `Log entry updated with ERROR status for job_uuid: ${data.job_uuid}`,
            );
        } else {
            console.warn(
                `Attempted to update error status for non-existent job_uuid: ${data.job_uuid}`,
            );
        }
    } catch (error) {
        console.error(
            `Error updating log error status for job_uuid ${data.job_uuid}:`,
            error,
        );
    }
}

// --- Function to get jobs for retry ---
interface RetryJobData {
    job_uuid: string;
    bundle_json: object; // Assuming the bundle is stored as JSON
    // Add other fields if needed for retry logic, e.g., current retry_count
}

export async function getJobsForRetry(
    maxAgeDays: number,
    limit: number = 100, // Default limit to prevent overwhelming the system
): Promise<RetryJobData[]> {
    const query = `
          SELECT job_uuid, bundle_json
          FROM fhir_process_log
          WHERE status NOT IN ($1, $2, $3)
            AND bundle_json IS NOT NULL
            AND created_at >= NOW() - INTERVAL '${maxAgeDays} days'
            -- Optional: Add a condition to avoid retrying too frequently if a job was just attempted
            -- AND (last_attempt_at IS NULL OR last_attempt_at < NOW() - INTERVAL '1 hour')
          ORDER BY created_at ASC -- Process older failed jobs first
          LIMIT $4;
      `;
    const params = [
        LogStatus.SENT_SUCCESS,
        LogStatus.QUEUED,
        LogStatus.PROCESSING,
        limit,
    ];
    try {
        const result = await db.query(query, params);
        return result.rows as RetryJobData[];
    } catch (error) {
        console.error(`Error fetching jobs for retry:`, error);
        return []; // Return empty array on error to prevent cron from failing catastrophically
    }
}

export async function updateLogStatusQueued(data: {
    job_uuid: string;
}): Promise<void> {
    await updateLog(data.job_uuid, {
        status: LogStatus.QUEUED,
        queued_at: new Date(),
    });
}

// Specific function for publish failure if needed, or use updateLogError
export async function updateLogPublishFailed(
    data: LogUpdateErrorInput,
): Promise<void> {
    await updateLogError({ ...data, status: LogStatus.PUBLISH_FAILED });
}

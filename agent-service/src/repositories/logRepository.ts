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
    ERROR: "ERROR", // General processing error in Agent
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

// Specific function for publish failure if needed, or use updateLogError
export async function updateLogPublishFailed(
    data: LogUpdateErrorInput,
): Promise<void> {
    await updateLogError({ ...data, status: LogStatus.PUBLISH_FAILED });
}

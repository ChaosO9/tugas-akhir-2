import db from "./dbConnect";

// Define status constants (should match agent-service)
export const LogStatus = {
    CREATED: "CREATED", // Handled by agent
    QUEUED: "QUEUED",
    PROCESSING: "PROCESSING",
    SENT_SUCCESS: "SENT_SUCCESS",
    SENT_FAILED: "SENT_FAILED",
    PUBLISH_FAILED: "PUBLISH_FAILED", // Handled by agent
    DUPLICATE: "DUPLICATE", // Specific FHIR validation error
    VALUE_ERROR: "VALUE_ERROR",
    ERROR: "ERROR", // General processing error
} as const;

export type LogStatusType = (typeof LogStatus)[keyof typeof LogStatus];

// --- Interfaces for Sender Updates ---
interface LogUpdateStatusInput {
    job_uuid: string;
    status: LogStatusType;
    timestampField?: string; // e.g., 'queued_at', 'processing_started_at'
}

interface LogUpdateSuccessInput {
    job_uuid: string;
    response_json: object | null;
}

interface LogUpdateFailedInput {
    job_uuid: string;
    error_message: string;
    response_json?: object | null; // Optional: API might return error details
    status?: LogStatusType; // Default to SENT_FAILED or ERROR
}

// --- Core Update Function (Internal) ---
async function updateLog(
    job_uuid: string,
    updates: Record<string, any>
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
                    updates
                ).join(", ")}`
            );
        } else {
            console.warn(
                `Attempted to update log for non-existent job_uuid: ${job_uuid}`
            );
        }
    } catch (error) {
        console.error(
            `Error updating log for job_uuid ${job_uuid}:`,
            error,
            "Query:",
            query,
            "Params:",
            params
        );
    }
}

// --- Specific Update Functions for Sender ---

export async function updateLogStatusQueued(data: {
    job_uuid: string;
}): Promise<void> {
    await updateLog(data.job_uuid, {
        status: LogStatus.QUEUED,
        queued_at: new Date(),
    });
}

export async function updateLogStatusProcessing(data: {
    job_uuid: string;
}): Promise<void> {
    await updateLog(data.job_uuid, {
        status: LogStatus.PROCESSING,
        processing_started_at: new Date(),
    });
}

export async function updateLogStatusSuccess(
    data: LogUpdateSuccessInput
): Promise<void> {
    await updateLog(data.job_uuid, {
        status: LogStatus.SENT_SUCCESS,
        response_json: data.response_json,
        completed_at: new Date(),
        last_attempt_at: new Date(),
        error_message: null, // Clear any previous error
    });
}

export async function updateLogStatusFailed(
    data: LogUpdateFailedInput
): Promise<void> {
    // Ensure error message is not excessively long
    const errorMessage =
        typeof data.error_message === "string"
            ? data.error_message.substring(0, 4000) // Example limit
            : "Unknown error structure";

    await updateLog(data.job_uuid, {
        status: data.status || LogStatus.SENT_FAILED, // Default to SENT_FAILED
        error_message: errorMessage,
        response_json: data.response_json || null,
        completed_at: new Date(),
        last_attempt_at: new Date(),
        // Optionally increment retry count if implementing retries
        // retry_count: `retry_count + 1` // Note: This needs raw SQL or fetching first
    });
    // If implementing retries, you might need a separate query or fetch the current count first
    // For now, we just mark it failed.
}

// Generic error update (can be used for file read errors etc.)
export async function updateLogError(
    data: LogUpdateFailedInput
): Promise<void> {
    await updateLogStatusFailed({ ...data, status: LogStatus.ERROR });
}

// --- Keep Agent functions if sender might ever need them (unlikely) ---
// export async function createLogEntry(...) { ... }
// export async function updateLogBundle(...) { ... }
// export async function updateLogFilePath(...) { ... }
// export async function updateLogPublishFailed(...) { ... }

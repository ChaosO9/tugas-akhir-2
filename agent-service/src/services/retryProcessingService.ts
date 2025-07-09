import { v4 as uuidv4 } from "uuid";
import { format, startOfDay, endOfDay, parse, subDays } from "date-fns";
import { getFailedEncountersForRetry } from "../repositories/retryManagementRepository";
import {
    createLogEntry,
    updateLogBundle,
    updateLogFilePath,
    updateLogError,
    LogStatus,
    updateLog, // Generic update function from logRepository
} from "../repositories/logRepository";
import { KunjunganRawatInap } from "../utils/interface";
import AppError from "../utils/errorHandler";
import { processSinglePatientEncounter } from "./main"; // Import the refactored function

export async function processRetries() {
    console.log("[RETRY_SERVICE] Starting retry processing...");
    const encountersToRetry = await getFailedEncountersForRetry(7); // Retry for last 7 days

    if (encountersToRetry instanceof AppError) {
        console.error(
            `[RETRY_SERVICE] Error fetching encounters for retry: ${encountersToRetry.message}. Stopping retry process.`,
        );
        return;
    }

    if (encountersToRetry.length === 0) {
        console.log("[RETRY_SERVICE] No encounters found eligible for retry.");
        return;
    }

    console.log(
        `[RETRY_SERVICE] Found ${encountersToRetry.length} encounters to retry.`,
    );

    for (const encounterData of encountersToRetry) {
        const new_job_uuid = uuidv4();
        const original_job_uuid = encounterData.original_job_uuid;

        // Create a KunjunganRawatInap object from the fetched data
        const dataMasterPasien: KunjunganRawatInap = {
            registration_id: encounterData.registration_id,
            org_id: encounterData.org_id,
            encounter_id: encounterData.encounter_id, // This might be updated by dataKunjunganRawatInapService
            arrived: encounterData.arrived,
            in_progress: encounterData.in_progress,
            finished: encounterData.finished,
            patient_id: encounterData.patient_id,
            patient_name: encounterData.patient_name,
            practitioner_id: encounterData.practitioner_id,
            practitioner_name: encounterData.practitioner_name,
            period_start: encounterData.period_start,
            period_end: encounterData.period_end,
            diagnosa: encounterData.diagnosa, // Assuming this is already in ConditionRow[] or Diagnosa[] format
            location_poli_id: encounterData.location_poli_id,
            unit_nama: encounterData.unit_nama,
            processed_resource: {}, // Initialize for this new processing attempt
        };

        console.log(
            `[RETRY_SERVICE] Retrying patient: ${dataMasterPasien.patient_name} (Original Job: ${original_job_uuid}, New Job: ${new_job_uuid}, Encounter: ${dataMasterPasien.encounter_id})`,
        );

        await createLogEntry({
            job_uuid: new_job_uuid,
            pendaftaran_id: dataMasterPasien.registration_id,
            encounter_id: dataMasterPasien.encounter_id,
            patient_id: dataMasterPasien.patient_id,
            status: LogStatus.CREATED,
            created_by: "agent-service-retry",
        });

        // Mark the old job log as RETRY_INITIATED
        await updateLog(original_job_uuid, {
            status: LogStatus.RETRY_INITIATED,
            retry_job_uuid: new_job_uuid,
            completed_at: new Date(),
        });

        // Determine the date range for fetching data.
        // This should ideally match the original processing window.
        // Using original_created_at from the log to determine the day it was first processed.
        const originalProcessingDate = parse(
            encounterData.original_created_at,
            "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX",
            new Date(),
        );
        const waktuAwalForRetry = format(
            startOfDay(originalProcessingDate),
            "dd-MM-yyyy HH:mm:ss",
        );
        const waktuAkhirForRetry = format(
            endOfDay(originalProcessingDate),
            "dd-MM-yyyy HH:mm:ss",
        );

        // The date to be used for filename generation for this retry attempt.
        // Using the current date for the retry makes sense.
        const processingDateForFilename = new Date();

        try {
            // Call the centralized processing function
            // processSinglePatientEncounter will handle its own logging for the new_job_uuid
            await processSinglePatientEncounter(
                dataMasterPasien,
                processingDateForFilename, // Use current date for retry filename
            );
            console.log(
                `[RETRY_SERVICE] Successfully re-processed encounter for new job: ${new_job_uuid}`,
            );
        } catch (patientRetryError: any) {
            console.error(
                `[${new_job_uuid}] Unhandled error during retry processing for patient ${dataMasterPasien.patient_name}:`,
                patientRetryError,
            );
            await updateLogError({
                job_uuid: new_job_uuid,
                error_message: `Unhandled patient retry processing error: ${patientRetryError.message || patientRetryError}`,
            });
        }
    } // End of loop for encountersToRetry
    console.log("[RETRY_SERVICE] Retry processing finished.");
}

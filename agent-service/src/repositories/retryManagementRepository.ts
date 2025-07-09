import patientDb from "./dbConnect"; // Connection to the main patient operational database
import loggerDb from "./loggerDbConnect"; // Connection to the separate logging database
import { LogStatus } from "./logRepository";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";

// Interface for the data returned, which should be sufficient to reconstruct KunjunganRawatInap
export interface EncounterDataForRetry extends KunjunganRawatInap {
    original_job_uuid: string;
    original_created_at: string;
}

export async function getFailedEncountersForRetry(
    maxAgeDays: number,
    limit: number = 10, // Limit the number of retries per cron run
): Promise<EncounterDataForRetry[] | AppError> {
    // Step 1: Query the log database to get pendaftaran_ids of failed jobs
    const logQueryText = `
        SELECT job_uuid as original_job_uuid, pendaftaran_id, created_at as original_created_at
        FROM fhir_process_log
        WHERE status NOT IN ($1, $2)
          AND created_at >= NOW() - MAKE_INTERVAL(days => $3)
        ORDER BY created_at ASC
        LIMIT $4;
    `;
    const logParams = [
        LogStatus.SENT_SUCCESS,
        LogStatus.RETRY_INITIATED,
        maxAgeDays,
        limit,
    ];

    let failedJobInfos: {
        original_job_uuid: string;
        pendaftaran_id: string;
        original_created_at: string;
    }[];
    try {
        const logResult = await loggerDb.query(logQueryText, logParams);
        failedJobInfos = logResult.rows;
    } catch (err) {
        console.error(
            "Error fetching failed job_uuids from log database:",
            err,
        );
        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching failed jobs from log DB: ${errorMessage}`,
            500,
        );
    }

    if (failedJobInfos.length === 0) {
        return [];
    }

    const encountersForRetry: EncounterDataForRetry[] = [];

    // Step 2: For each pendaftaran_id, query the patient operational database
    for (const jobInfo of failedJobInfos) {
        const patientDataQueryText = `
        SELECT
            (SELECT fhirsetup_organization_id FROM m_far_fhir_setup LIMIT 1) AS org_id,
            p.pendaftaran_no AS registration_id,
            p.pendaftaran_uuid AS encounter_id,
            p.pendaftaran_mrs AS arrived,
            CASE
                WHEN COALESCE(p.pendaftaran_lrs, '1970-01-01 00:00:00'::timestamp) < p.pendaftaran_mrs THEN p.pendaftaran_mrs
                WHEN COALESCE(p.pendaftaran_lrs, '1970-01-01 00:00:00'::timestamp) > p.pendaftaran_krs THEN p.pendaftaran_krs
                ELSE COALESCE(p.pendaftaran_lrs, '1970-01-01 00:00:00'::timestamp)
            END AS in_progress,
            p.pendaftaran_krs AS finished,
            ps.pasien_fhir_id AS patient_id,
            ps.pasien_nama AS patient_name,
            pg.pegawai_fhir_id AS practitioner_id,
            pg.pegawai_nama AS practitioner_name,
            p.pendaftaran_mrs AS period_start,
            p.pendaftaran_krs AS period_end,
            COALESCE(diag.diagnosapasien_data_json, '[]'::json) AS diagnosa,
            u.unit_fhir_id AS location_poli_id,
            u.unit_nama
        FROM t_pendaftaran p
        JOIN m_pasien ps ON p.m_pasien_id = ps.pasien_id
        JOIN m_pegawai pg ON p.pendaftaran_dokter = pg.pegawai_id
        JOIN m_unit u ON p.m_unit_id = u.unit_id
        LEFT JOIN (
            SELECT
                dp_sub.t_pendaftaran_id AS diagnosapasien_pendaftaran_id,
                json_agg(json_build_object('diagnosa_uuid', dp_sub.diagnosapasien_uuid, 'diagnosa_nama', mi.icd_nama, 'diagnosa_type', dp_sub.diagnosapasien_jenis)) AS diagnosapasien_data_json
            FROM t_diagnosa_pasien dp_sub
            JOIN m_icd mi ON mi.icd_id = dp_sub.m_icd_id
            WHERE dp_sub.diagnosapasien_aktif = 'y' AND COALESCE(dp_sub.diagnosapasien_uuid, '') <> ''
            GROUP BY dp_sub.t_pendaftaran_id
        ) diag ON diag.diagnosapasien_pendaftaran_id = p.pendaftaran_id
        WHERE p.pendaftaran_no = $1 -- Filter by the specific pendaftaran_id
          AND p.pendaftaran_aktif = 'y' AND p.pendaftaran_krs IS NOT NULL
          AND COALESCE(p.pendaftaran_uuid, '') <> '' AND COALESCE(ps.pasien_fhir_id, '') <> ''
          AND COALESCE(pg.pegawai_fhir_id, '') <> '' AND COALESCE(u.unit_fhir_id, '') <> ''
        LIMIT 1; -- Expecting one row per pendaftaran_no
    `;
        const patientDataParams = [jobInfo.pendaftaran_id];

        try {
            const patientDataResult = await patientDb.query(
                patientDataQueryText,
                patientDataParams,
            );
            if (patientDataResult.rows.length > 0) {
                const encounterDetail = patientDataResult.rows[0] as Omit<
                    EncounterDataForRetry,
                    "original_job_uuid" | "original_created_at"
                >;
                encountersForRetry.push({
                    ...encounterDetail,
                    original_job_uuid: jobInfo.original_job_uuid,
                    original_created_at: jobInfo.original_created_at,
                });
            } else {
                console.warn(
                    `No patient data found for pendaftaran_id: ${jobInfo.pendaftaran_id} during retry. Original job: ${jobInfo.original_job_uuid}`,
                );
            }
        } catch (err) {
            console.error(
                `Error fetching patient data for pendaftaran_id ${jobInfo.pendaftaran_id}:`,
                err,
            );
            // Decide if one failure should stop all retries or just skip this one.
            // For now, we'll log and continue.
        }
    }

    return encountersForRetry;
}

import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataKunjunganRawatInap(
    waktuAwal: string,
    waktuAkhir: string,
): Promise<KunjunganRawatInap[] | AppError> {
    // Define the SQL query with placeholders ($1, $2)
    const queryText = `
        SELECT
            ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
            t_pendaftaran.pendaftaran_no AS Registration_ID,
            t_pendaftaran.pendaftaran_uuid AS Encounter_id,
            t_pendaftaran.pendaftaran_mrs AS arrived,
        CASE
                
                WHEN COALESCE ( t_pendaftaran.pendaftaran_lrs, '1970-01-01 00:00:00' ) < t_pendaftaran.pendaftaran_mrs THEN
                t_pendaftaran.pendaftaran_mrs 
                WHEN COALESCE ( t_pendaftaran.pendaftaran_lrs, '1970-01-01 00:00:00' ) > t_pendaftaran.pendaftaran_krs THEN
                t_pendaftaran.pendaftaran_krs ELSE COALESCE ( t_pendaftaran.pendaftaran_lrs, '1970-01-01 00:00:00' ) 
            END AS in_progress,
            t_pendaftaran.pendaftaran_krs AS finished,
            m_pasien.pasien_fhir_id AS Patient_id,
            m_pasien.pasien_nama AS Patient_Name,
            m_pegawai.pegawai_fhir_id AS Practitioner_id,
            m_pegawai.pegawai_nama AS Practitioner_Name,
            t_pendaftaran.pendaftaran_mrs AS period_start,
            t_pendaftaran.pendaftaran_krs AS period_end,
            t_diagnosa_pasien.diagnosapasien_data_json AS diagnosa,
            m_unit.unit_fhir_id AS Location_Poli_id,
            m_unit.unit_nama 
        FROM
            t_pendaftaran
            JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            JOIN m_pegawai ON m_pegawai.pegawai_id = t_pendaftaran.pendaftaran_dokter
            JOIN m_unit ON m_unit.unit_id = t_pendaftaran.m_unit_id
            JOIN (
            SELECT
                t_diagnosa_pasien_1.t_pendaftaran_id AS diagnosapasien_pendaftaran_id,
                json_agg ( json_build_object ( 'diagnosa_uuid', t_diagnosa_pasien_1.diagnosapasien_uuid, 'diagnosa_nama', m_icd.icd_nama, 'diagnosa_type', t_diagnosa_pasien_1.diagnosapasien_jenis ) ) AS diagnosapasien_data_json 
            FROM
                t_diagnosa_pasien t_diagnosa_pasien_1
                JOIN m_icd ON m_icd.icd_id = t_diagnosa_pasien_1.m_icd_id 
            WHERE
                t_diagnosa_pasien_1.diagnosapasien_aktif = 'y' :: BPCHAR 
                AND COALESCE ( t_diagnosa_pasien_1.diagnosapasien_uuid, '' :: CHARACTER VARYING ) :: TEXT <> '' :: TEXT 
            GROUP BY
                t_diagnosa_pasien_1.t_pendaftaran_id 
            ) t_diagnosa_pasien ON t_diagnosa_pasien.diagnosapasien_pendaftaran_id = t_pendaftaran.pendaftaran_id 
        WHERE
            t_pendaftaran.pendaftaran_aktif = 'y' 
            AND t_pendaftaran.pendaftaran_krs IS NOT NULL 
            AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> '' 
            AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> '' 
            AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> '' 
            AND COALESCE ( m_unit.unit_fhir_id, '' ) <> '' 
            AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) >= $1 
            AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) <= $2
        ORDER BY
            t_pendaftaran.pendaftaran_id ASC;
    `;

    const values = [waktuAwal, waktuAkhir];

    try {
        const result = await db.query(queryText, values);
        return result.rows as KunjunganRawatInap[];
    } catch (err) {
        console.error("Error fetching kunjungan rawat inap data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching kunjungan rawat inap data: ${errorMessage}`,
            500,
        );
    }
}

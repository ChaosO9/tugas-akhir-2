import AppError from "../utils/errorHandler";
import { ConditionRow, KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataDiagnosis(
    dataMasterPasien: KunjunganRawatInap,
): Promise<ConditionRow[] | AppError> {
    try {
        const queryText = `
            SELECT
                t_diagnosa_pasien.diagnosapasien_data_json AS condition,
                m_pasien.pasien_fhir_id AS Patient_id,
                m_pasien.pasien_nama AS Patient_Name,
                t_pendaftaran.pendaftaran_uuid
            FROM
                t_pendaftaran
            JOIN (
                SELECT
                    t_diagnosa_pasien_1.t_pendaftaran_id AS diagnosapasien_pendaftaran_id,
                    json_agg(json_build_object('condition_uuid',
                    t_diagnosa_pasien_1.diagnosapasien_uuid,
                    'condition_nama',
                    m_icd.icd_nama,
                    'condition_kode',
                    m_icd.icd_kode)) AS diagnosapasien_data_json
                FROM
                    t_diagnosa_pasien t_diagnosa_pasien_1
                JOIN m_icd ON
                    m_icd.icd_id = t_diagnosa_pasien_1.m_icd_id
                WHERE
                    t_diagnosa_pasien_1.diagnosapasien_aktif = 'y'::bpchar
                    AND COALESCE(t_diagnosa_pasien_1.diagnosapasien_uuid,
                    ''::CHARACTER VARYING)::TEXT <> ''::TEXT
                GROUP BY
                    t_diagnosa_pasien_1.t_pendaftaran_id) t_diagnosa_pasien ON
                t_diagnosa_pasien.diagnosapasien_pendaftaran_id = t_pendaftaran.pendaftaran_id
            JOIN
            m_pasien ON
                m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            WHERE
                t_pendaftaran.pendaftaran_aktif = 'y'
                AND t_pendaftaran.pendaftaran_krs IS NOT NULL
                AND COALESCE(t_pendaftaran.pendaftaran_uuid,
                '') <> ''
                AND COALESCE(m_pasien.pasien_fhir_id,
                '') <> ''
                AND t_pendaftaran.pendaftaran_no = $1
                -- AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) >= $2
                -- AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) <= $3
            ORDER BY
                t_pendaftaran.pendaftaran_id DESC;
        `;
        const values = [dataMasterPasien.registration_id];
        const result = await db.query(queryText, values);
        return result.rows as ConditionRow[];
    } catch (err) {
        console.error("Error fetching diagnosis data:", err);
        return new AppError(
            `Error fetching diagnosis data for ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

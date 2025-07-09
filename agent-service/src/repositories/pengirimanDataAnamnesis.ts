import AppError from "../utils/errorHandler";
import { dataAnamnesis, KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataAnamnesis(
    dataMasterPasien: KunjunganRawatInap,
): Promise<dataAnamnesis | AppError> {
    try {
        const conditionQueryText = `
                    SELECT
                        t_diagnosa_pasien.diagnosapasien_data_json AS CONDITION,
                        m_pasien.pasien_fhir_id AS Patient_id,
                        m_pasien.pasien_nama AS Patient_Name,
                        t_pendaftaran.pendaftaran_uuid,
                        t_pendaftaran.pendaftaran_no
                    FROM
                        t_pendaftaran
                        JOIN (
                            SELECT
                                t_diagnosa_pasien_1.t_pendaftaran_id AS diagnosapasien_pendaftaran_id,
                                json_agg ( json_build_object ( 'condition_uuid', t_diagnosa_pasien_1.diagnosapasien_uuid, 'condition_nama', m_icd.icd_nama, 'condition_kode', m_icd.icd_kode, 'tanggal', t_diagnosa_pasien_1.diagnosapasien_created_date ) ) AS diagnosapasien_data_json 
                            FROM
                                t_diagnosa_pasien t_diagnosa_pasien_1
                                JOIN m_icd ON m_icd.icd_id = t_diagnosa_pasien_1.m_icd_id 
                            WHERE
                                t_diagnosa_pasien_1.diagnosapasien_aktif = 'y' :: BPCHAR 
                                AND COALESCE ( t_diagnosa_pasien_1.diagnosapasien_uuid, '' :: CHARACTER VARYING ) :: TEXT <> '' :: TEXT 
                            GROUP BY
                                t_diagnosa_pasien_1.t_pendaftaran_id 
                        ) t_diagnosa_pasien ON t_diagnosa_pasien.diagnosapasien_pendaftaran_id = t_pendaftaran.pendaftaran_id
                        JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id 
                    WHERE
                        t_pendaftaran.pendaftaran_aktif = 'y' 
                        AND t_pendaftaran.pendaftaran_krs IS NOT NULL 
                        AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> '' 
                        AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> '' 
                        AND t_pendaftaran.pendaftaran_no = $1
                        -- AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) >= $2
                        -- AND to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) <= $3
                    ORDER BY
                        t_pendaftaran.pendaftaran_id DESC;
            `;
        const conditionValues = [dataMasterPasien.registration_id];

        const allergyQueryText = `
                    SELECT
                        tra.alergi_uuid,
                        ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
                        m_pasien.pasien_fhir_id AS Pasien_id,
                        m_pasien.pasien_nama AS Pasien_nama,
                        mcaf.link AS clinical_status_system,
                        mcaf.code AS clinical_status_code,
                        mcaf.display AS clinicalStatus_display,
                        mvaf.link AS verifikasi_status_system,
                        mvaf.code AS verifikasi_status_code,
                        mvaf.display AS verificationStatus_display,
                        tra.alergi_jenis AS category,
                        tra.alergi_catatan,
                        mans.code_system AS alergi_snomedct_system,
                        mans.code AS alergi_snomedct_code,
                        mans.display AS alergi_nama,
                        tra.alergi_created_date 
                    FROM
                        t_riwayat_alergi tra
                        JOIN m_clinicalstatus_allergy_fhir mcaf ON mcaf.ID = tra.alergi_clinicalstatus_fhir_id
                        JOIN m_verificationstatus_allergy_fhir mvaf ON mvaf.ID = tra.alergi_verificationstatus_fhir_id
                        JOIN m_category_allergy_fhir ON m_category_allergy_fhir.ID = tra.alergi_category_fhir_id
                        JOIN m_allergy_name_snomedct mans ON mans.ID = tra.alergi_name_snomedct_id
                        JOIN m_pasien ON m_pasien.pasien_id = tra.alergi_pasien_id 
                    WHERE
                        COALESCE ( m_pasien.pasien_fhir_id, '' ) <> '' 
                        AND tra.alergi_aktif = 'y' 
                        AND m_pasien.pasien_fhir_id = $1;
                `;
        const allergyValues = [dataMasterPasien.patient_id];

        const [conditionResult, allergyIntoleranceResult] = await Promise.all([
            db.query(conditionQueryText, conditionValues),
            db.query(allergyQueryText, allergyValues),
        ]);

        const gabungData = {
            condition: conditionResult.rows,
            allergyIntolerance: allergyIntoleranceResult.rows,
        };

        return gabungData;
    } catch (err) {
        console.error("Error fetching anamnesis data:", err);
        return new AppError(
            `Error fetching anamnesis data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

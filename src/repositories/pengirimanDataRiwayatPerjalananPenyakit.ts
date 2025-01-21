import AppError from "../utils/errorHandler";
import {
    dataRiwayatPerjalananPenyakit,
    KunjunganRawatInap,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanRiwayatPerjalananPenyakit(
    dataMasterPasien: KunjunganRawatInap,
): Promise<dataRiwayatPerjalananPenyakit[] | AppError> {
    try {
        const result = await db.query(
            `
                SELECT
                    t_pendaftaran.pendaftaran_uuid AS encounter,
                    m_pasien.pasien_fhir_id AS Patient_id,
                    m_pasien.pasien_nama AS Patient_Name,
                    m_pegawai.pegawai_fhir_id AS Practitioner_id,
                    m_pegawai.pegawai_nama AS Practitioner_Name,
                    t_clinical_impression_fhir.no_uuid AS clinicalimpression_uuid,
                    t_clinical_impression_fhir.deskripsi,
                    t_clinical_impression_fhir.investigasi,
                    t_clinical_impression_fhir.kesimpulan,
                    json_agg ( json_build_object ( 'icd_nama', m_icd.icd_nama, 'icd_kode', m_icd.icd_kode, 'diagnosa_jenis', t_diagnosa_pasien.diagnosapasien_jenis, 'diagnosa_uuid', t_diagnosa_pasien.diagnosapasien_uuid ) ) AS diagnosa,
                    mcisf.status AS status_nama,
                    mcipf.NAME AS prognosis_nama,
                    mcipf.code_system AS prognosis_system,
                    mcipf.code AS prognosis_kode 
                FROM
                    t_clinical_impression_fhir
                    JOIN m_clinical_impression_status_fhir mcisf ON t_clinical_impression_fhir.status_fhir_id = mcisf.
                    ID JOIN m_clinical_impression_prognosis_fhir mcipf ON t_clinical_impression_fhir.prognosis_fhir_id = mcipf.
                    ID JOIN t_diagnosa_pasien ON t_clinical_impression_fhir.t_diagnosapasien_id= t_diagnosa_pasien.t_pendaftaran_id 
                    AND t_diagnosa_pasien.diagnosapasien_aktif = 'y'
                    JOIN m_icd ON t_diagnosa_pasien.m_icd_id = m_icd.icd_id
                    JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_clinical_impression_fhir.t_diagnosapasien_id
                    JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
                    JOIN m_pegawai ON m_pegawai.pegawai_id = t_pendaftaran.pendaftaran_dokter 
                WHERE
                    t_pendaftaran.pendaftaran_aktif = 'y' 
                    AND t_pendaftaran.pendaftaran_krs IS NOT NULL 
                    AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> '' 
                    AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> '' 
                    AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> '' 
                    AND pendaftaran_no = '${dataMasterPasien.registration_id}' 
                GROUP BY
                    t_clinical_impression_fhir.no_uuid,
                    t_clinical_impression_fhir.deskripsi,
                    t_clinical_impression_fhir.investigasi,
                    t_clinical_impression_fhir.kesimpulan,
                    mcisf.status,
                    mcipf.NAME,
                    mcipf.code_system,
                    mcipf.code,
                    t_pendaftaran.pendaftaran_uuid,
                    m_pasien.pasien_fhir_id,
                    m_pasien.pasien_nama,
                    m_pegawai.pegawai_fhir_id,
                    m_pegawai.pegawai_nama
            `,
        );
        return result.rows as dataRiwayatPerjalananPenyakit[];
    } catch (err) {
        console.error("Error fetching disease history data:", err);
        return new AppError(
            `Error fetching disease history data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

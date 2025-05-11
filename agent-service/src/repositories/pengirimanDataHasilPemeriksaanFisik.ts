import AppError from "../utils/errorHandler";
import {
    dataHasilPemeriksaanFisik,
    KunjunganRawatInap,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanHasilPemeriksaanFisik(
    dataMasterPasien: KunjunganRawatInap,
): Promise<dataHasilPemeriksaanFisik[] | AppError> {
    try {
        const queryText = `
                SELECT
                    periksa_id,
                    periksa_pendaftaran_id,
                    '8480-6' AS systolic_blood_pressure,
                    periksa_tensi AS systolic_blood_pressure,
                    '8310-5' AS body_temperature_code,
                    periksa_suhu AS body_temperature,
                    '8867-4' AS heart_rate,
                    periksa_jantung AS heart_rate,
                    '9279-1' AS respiratory_rate,
                    periksa_nafas AS respiratory_rate,
                    periksa_created_date,
                    pendaftaran_uuid AS encounter,
                    m_pasien.pasien_fhir_id AS Patient_id,
                    m_pasien.pasien_nama AS Patient_Name,
                    m_pegawai.pegawai_fhir_id AS Practitioner_id,
                    m_pegawai.pegawai_nama AS Practitioner_Name 
                FROM
                    (
                    SELECT ROW_NUMBER
                        ( ) OVER ( PARTITION BY periksa_pendaftaran_id ORDER BY periksa_id DESC ) AS periksa_rank,
                        periksa_id,
                        periksa_pendaftaran_id,
                        periksa_tensi,
                        periksa_suhu,
                        periksa_jantung,
                        periksa_nafas,
                        COALESCE ( periksa_created_date, periksa_tanggal, NOW( ) :: TIMESTAMP ) AS periksa_created_date 
                    FROM
                        t_riwayat_periksa 
                    WHERE
                        periksa_aktif = 'y' UNION ALL
                    SELECT ROW_NUMBER
                        ( ) OVER ( PARTITION BY periksahemodialisa_pendaftaran_id ORDER BY periksahemodialisa_id DESC ) AS periksa_rank,
                        periksahemodialisa_id AS periksa_id,
                        periksahemodialisa_pendaftaran_id AS periksa_pendaftaran_id,
                        periksahemodialisa_tensi AS periksa_tensi,
                        periksahemodialisa_suhu AS periksa_suhu,
                        periksahemodialisa_jantung AS periksa_jantung,
                        periksahemodialisa_nafas AS periksa_nafas,
                        periksahemodialisa_created_date AS periksa_created_date 
                    FROM
                        t_riwayat_periksa_hemodialisa 
                    WHERE
                        periksahemodialisa_aktif = 'y' 
                    ) t_periksa_terbaru
                    JOIN t_pendaftaran ON periksa_pendaftaran_id = pendaftaran_id
                    JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
                    JOIN m_pegawai ON m_pegawai.pegawai_id = t_pendaftaran.pendaftaran_dokter 
                WHERE
                    t_periksa_terbaru.periksa_rank = 1 
                    AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> '' 
                    AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> '' 
                    AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> '' 
                    AND t_pendaftaran.pendaftaran_no = $1;
        `;
        const values = [dataMasterPasien.registration_id];

        const result = await db.query(queryText, values);
        return result.rows as dataHasilPemeriksaanFisik[];
    } catch (err) {
        console.error("Error fetching physical examination data:", err);
        return new AppError(
            `Error fetching physical examination data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

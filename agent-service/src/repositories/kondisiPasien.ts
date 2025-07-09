import db from "./dbConnect";

export default async function dapatkanDataKondisiPasien(
    pendaftaranID: string,
): Promise<any[] | Error> {
    try {
        const result = await db.query(
            `
                SELECT
                    t_diagnosa_pasien.diagnosapasien_data_json AS CONDITION,
                    m_pasien.pasien_fhir_id AS Patient_id,
                    m_pasien.pasien_nama AS Patient_Name,
                    t_pendaftaran.pendaftaran_uuid 
                FROM
                    t_pendaftaran
                    JOIN (
                    SELECT
                        t_diagnosa_pasien_1.t_pendaftaran_id AS diagnosapasien_pendaftaran_id,
                        json_agg ( json_build_object ( 'condition_uuid', t_diagnosa_pasien_1.diagnosapasien_uuid, 'condition_nama', m_icd.icd_nama, 'condition_kode', M_icd.icd_kode, 'tanggal', t_diagnosa_pasien_1.diagnosapasien_created_date ) ) AS diagnosapasien_data_json 
                    FROM
                        t_diagnosa_pasien t_diagnosa_pasien_1
                        JOIN m_icd ON m_icd.icd_id = t_diagnosa_pasien_1.m_icd_id 
                    WHERE
                        t_diagnosa_pasien_1.diagnosapasien_aktif = 'y'
                        AND COALESCE ( t_diagnosa_pasien_1.diagnosapasien_uuid, '' ) <> ''
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
            `,
            [pendaftaranID],
        );
        return result.rows;
    } catch (err) {
        console.error("Error fetching patient's condition data:", err);
        return err as Error;
    }
}

import db from "./dbConnect";

export default async function dapatkanDataPasien() {
    try {
        const result = await db.query(
            `
                select
                    m_pasien.pasien_nama ,
                    m_pasien.pasien_nik,
                    m_pasien.pasien_fhir_id
                from
                    m_pasien
                where
                    m_pasien.pasien_nik is not null
                and length(m_pasien.pasien_nik) >= 16
                LIMIT 10 OFFSET 0;
        `,
        );
        return JSON.stringify(result.rows);
    } catch (err) {
        console.error("Error fetching patient data:", err);
        return err as Error;
    }
}

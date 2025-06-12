import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataCaraKeluardariRumahSakit(
    dataMasterPasien: KunjunganRawatInap,
): Promise<object[] | AppError> {
    const queryText = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Cara Keluar dari Rumah Sakit%'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const result = await db.query(queryText, values);
        return result.rows;
    } catch (err) {
        console.error("Error fetching CARA KELUAR DARI RUMAH SAKIT data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching CARA KELUAR DARI RUMAH SAKIT data: ${errorMessage}`,
            500,
        );
    }
}

import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataPemeriksaanFungsional(
    dataMasterPasien: KunjunganRawatInap,
): Promise<object[] | AppError> {
    const queryText = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemeriksaan Fungsional%'
            AND
                resource_type = 'Observation'
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
        console.error("Error fetching PEMERIKSAAN FUNGSIONAL data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching PEMERIKSAAN FUNGSIONAL data: ${errorMessage}`,
            500,
        );
    }
}

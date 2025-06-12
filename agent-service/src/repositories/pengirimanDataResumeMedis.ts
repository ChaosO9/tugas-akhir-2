import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataResumeMedis(
    dataMasterPasien: KunjunganRawatInap,
): Promise<object[] | AppError> {
    const queryText = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Resume Medis%'
            AND
                resource_type = 'Composition'
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
        console.error("Error fetching RESUME MEDIS data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching RESUME MEDIS data: ${errorMessage}`,
            500,
        );
    }
}

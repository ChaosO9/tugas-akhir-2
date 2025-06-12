import AppError from "../utils/errorHandler";
import { KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataKondisiSaatMeninggalkanRumahSakit(
    dataMasterPasien: KunjunganRawatInap,
): Promise<object[] | AppError> {
    const queryCodition = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Kondisi Saat Meninggalkan Rumah Sakit%'
            AND
                resource_type = 'Condition'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const result = await db.query(queryCodition, values);
        return result.rows;
    } catch (err) {
        console.error(
            "Error fetching KONDISI SAAT MENINGGALKAN RUMAH SAKIT data:",
            err,
        );

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching KONDISI SAAT MENINGGALKAN RUMAH SAKIT data: ${errorMessage}`,
            500,
        );
    }
}

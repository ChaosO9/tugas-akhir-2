import AppError from "../utils/errorHandler";
import {
    DataPemulanganPasienFromRepo,
    KunjunganRawatInap,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataPemulanganPasien(
    dataMasterPasien: KunjunganRawatInap,
): Promise<DataPemulanganPasienFromRepo | AppError> {
    const queryObservation = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemulangan Pasien%'
            AND
                resource_type = 'Observation'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const queryCarePlan = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemulangan Pasien%'
            AND
                resource_type = 'CarePlan'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const [observation, carePlan] = await Promise.all([
            db.query(queryObservation, values),
            db.query(queryCarePlan, values),
        ]);

        const result = {
            observation: observation.rows,
            carePlan: carePlan.rows,
        };

        return result;
    } catch (err) {
        console.error("Error fetching PEMULANGAN PASIEN data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching PEMULANGAN PASIEN data: ${errorMessage}`,
            500,
        );
    }
}

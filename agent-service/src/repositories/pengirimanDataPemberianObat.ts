import AppError from "../utils/errorHandler";
import {
    DataPemberianObatFromRepo,
    KunjunganRawatInap,
    MedicationAdministrationPemberianObatDbRow,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataPemberianObat(
    dataMasterPasien: KunjunganRawatInap,
): Promise<DataPemberianObatFromRepo | AppError> {
    const queryMedication = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemberian Obat%'
            AND
                resource_type = 'Medication'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const queryMedicationAdministration = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemberian Obat%'
            AND
                resource_type = 'MedicationAdministration'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const [medication, medicationAdministration] = await Promise.all([
            db.query(queryMedication, values),
            db.query(queryMedicationAdministration, values),
        ]);

        let result = {
            medication: medication.rows,
            medicationAdministration: medicationAdministration.rows,
        };

        return result;
    } catch (err) {
        console.error("Error fetching PEMBERIAN OBAT data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching PEMBERIAN OBAT data: ${errorMessage}`,
            500,
        );
    }
}

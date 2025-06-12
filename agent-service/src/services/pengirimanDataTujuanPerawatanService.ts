// import { dateTimeToUTC } from "../utils/dateTimeToUTC"; // Not strictly needed for 'date' type, but good for consistency if datetimes are used
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, TujuanPerawatanDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataTujuanPerawatanService(
    dataMasterPasien: KunjunganRawatInap,
    dataTujuanPerawatan: TujuanPerawatanDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataTujuanPerawatan) && dataTujuanPerawatan.length > 0) {
        dataTujuanPerawatan.forEach((item: TujuanPerawatanDbRow) => {
            const fhirGoal = item.data;

            // Ensure subject and expressedBy are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const expressedByReference = fhirGoal.expressedBy || {
                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                display: dataMasterPasien.practitioner_name,
            };

            // The 'statusDate' and 'target.dueDate' are 'date' types in FHIR Goal,
            // so direct UTC conversion might not be necessary unless your source data is dateTime.
            // If they are indeed just dates (YYYY-MM-DD), they can be used as is.
            // If they are dateTime, then dateTimeToUTC should be used.
            // For simplicity, assuming they are already in correct 'date' format or will be handled by FHIR server.

            const goalResource: object = {
                fullUrl: `urn:uuid:${item.fhir_id || uuidv4()}`,
                resource: {
                    ...fhirGoal, // Spread the original FHIR data
                    subject: subjectReference,
                    expressedBy: expressedByReference,
                    // If addresses need to be dynamic based on current encounter's conditions:
                    addresses:
                        fhirGoal.addresses?.map((addr) => {
                            // Potentially map placeholder references to actual condition UUIDs from this encounter
                            // This requires more complex logic to find and replace {{Condition_KeluhanUtama}}
                            // For now, we'll assume the references in item.data.addresses are either absolute or correctly pre-filled.
                            return addr;
                        }) || [],
                    // Ensure encounter is part of the Goal if it's relevant, though not standard in FHIR Goal
                },
                request: {
                    method: "POST",
                    url: "Goal",
                },
            };
            bundleEntries.push(goalResource);
        });
    }

    return bundleEntries;
}

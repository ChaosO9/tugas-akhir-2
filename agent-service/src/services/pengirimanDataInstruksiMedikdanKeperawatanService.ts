import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    InstruksiMedikKeperawatanDbRow,
    KunjunganRawatInap,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataInstruksiMedikdanKeperawatanService(
    dataMasterPasien: KunjunganRawatInap,
    dataInstruksi: InstruksiMedikKeperawatanDbRow[],
): Promise<object[] | AppError> {
    let jsonCarePlanArray: object[] = [];

    if (Array.isArray(dataInstruksi) && dataInstruksi.length > 0) {
        dataInstruksi.forEach((instruksiItem) => {
            const fhirCarePlan = instruksiItem.data; // Access the FHIR CarePlan from the data property

            const carePlanResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB or generate new
                resource: {
                    resourceType: "CarePlan",
                    status: fhirCarePlan.status,
                    intent: fhirCarePlan.intent,
                    ...(fhirCarePlan.category && {
                        category: fhirCarePlan.category,
                    }),
                    ...(fhirCarePlan.title && { title: fhirCarePlan.title }),
                    ...(fhirCarePlan.description && {
                        description: fhirCarePlan.description,
                    }),
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display:
                            fhirCarePlan.encounter?.display ||
                            `Instruksi terkait kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
                    },
                    created: dateTimeToUTC(
                        fhirCarePlan.created || new Date().toISOString(),
                    ),
                    author: {
                        reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display: dataMasterPasien.practitioner_name,
                    },
                    ...(fhirCarePlan.goal &&
                        fhirCarePlan.goal.length > 0 && {
                            goal: fhirCarePlan.goal.map((g) => ({
                                // Ensure goal is an array of references
                                reference: g.reference,
                                display: g.display,
                            })),
                        }),
                    // Spreading other properties from fhirCarePlan if they exist and are not explicitly handled above
                    // This is a safer approach if fhirCarePlan might have other valid properties.
                    // However, be cautious as it might overwrite properties you've explicitly set if names collide.
                    // For CarePlan, the explicitly handled ones are usually sufficient.
                    // Example of spreading remaining:
                    // ...Object.fromEntries(
                    //     Object.entries(fhirCarePlan).filter(([key]) =>
                    //         !['resourceType', 'status', 'intent', 'category', 'title', 'description', 'subject', 'encounter', 'created', 'author', 'goal'].includes(key)
                    //     )
                    // )
                },
                request: {
                    method: "POST",
                    url: "CarePlan",
                },
            };
            jsonCarePlanArray.push(carePlanResource);
        });
    }

    return jsonCarePlanArray;
}

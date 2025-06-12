import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, PengkajianResepDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPengkajianResepService(
    dataMasterPasien: KunjunganRawatInap,
    dataPengkajianResep: PengkajianResepDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataPengkajianResep) && dataPengkajianResep.length > 0) {
        dataPengkajianResep.forEach((item: PengkajianResepDbRow) => {
            const fhirQuestionnaireResponse = item.data;

            // Ensure subject and encounter are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
            };

            // Optionally, override author and authored if needed, or use from source
            const authorReference = fhirQuestionnaireResponse.author || {
                // Assuming author might be a pharmacist
                reference: `Practitioner/${dataMasterPasien.practitioner_id}`, // Default to main practitioner or a specific pharmacist ID if available
                display: dataMasterPasien.practitioner_name,
            };
            const authoredTime =
                fhirQuestionnaireResponse.authored || new Date().toISOString();

            const questionnaireResponseResource: object = {
                fullUrl: `urn:uuid:${item.fhir_id || uuidv4()}`,
                resource: {
                    ...fhirQuestionnaireResponse, // Spread the original FHIR data
                    subject: subjectReference,
                    encounter: encounterReference,
                    author: authorReference,
                    authored: dateTimeToUTC(authoredTime),
                    // Ensure source is also correctly set if it needs to be dynamic
                    source:
                        fhirQuestionnaireResponse.source || subjectReference,
                },
                request: {
                    method: "POST",
                    url: "QuestionnaireResponse",
                },
            };
            bundleEntries.push(questionnaireResponseResource);
        });
    }

    return bundleEntries;
}

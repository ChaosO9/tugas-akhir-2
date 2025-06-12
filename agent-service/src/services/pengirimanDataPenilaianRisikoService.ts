// import { dateTimeToUTC } from "../utils/dateTimeToUTC"; // If occurrenceDateTime needs UTC conversion
import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, PenilaianRisikoDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPenilaianRisikoService(
    dataMasterPasien: KunjunganRawatInap,
    dataPenilaianRisiko: PenilaianRisikoDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataPenilaianRisiko) && dataPenilaianRisiko.length > 0) {
        dataPenilaianRisiko.forEach((item: PenilaianRisikoDbRow) => {
            const fhirRiskAssessment = item.data;

            // Ensure subject, encounter, and performer are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
            };
            const performerReference = fhirRiskAssessment.performer || {
                // Use performer from source if available
                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                display: dataMasterPasien.practitioner_name,
            };

            // occurrenceDateTime might need UTC conversion if it's present and not already UTC
            let occurrenceDateTimeProcessed =
                fhirRiskAssessment.occurrenceDateTime;
            if (occurrenceDateTimeProcessed) {
                occurrenceDateTimeProcessed = dateTimeToUTC(
                    occurrenceDateTimeProcessed,
                );
            }

            const riskAssessmentResource: object = {
                fullUrl: `urn:uuid:${item.fhir_id || uuidv4()}`,
                resource: {
                    ...fhirRiskAssessment, // Spread the original FHIR data
                    subject: subjectReference,
                    encounter: encounterReference,
                    performer: performerReference,
                    // occurrenceDateTime: occurrenceDateTimeProcessed || undefined, // Use processed if available
                },
                request: {
                    method: "POST",
                    url: "RiskAssessment",
                },
            };
            bundleEntries.push(riskAssessmentResource);
        });
    }

    return bundleEntries;
}

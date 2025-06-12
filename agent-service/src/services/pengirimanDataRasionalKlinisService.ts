import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, RasionalKlinisDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataRasionalKlinisService(
    dataMasterPasien: KunjunganRawatInap,
    dataRasionalKlinis: RasionalKlinisDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataRasionalKlinis) && dataRasionalKlinis.length > 0) {
        dataRasionalKlinis.forEach((item: RasionalKlinisDbRow) => {
            const fhirClinicalImpression = item.data;

            // Ensure subject, encounter, and assessor are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
            };
            const assessorReference = fhirClinicalImpression.assessor || {
                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                display: dataMasterPasien.practitioner_name,
            };

            // Process date fields, ensuring they are in UTC if present
            const effectiveDateTimeProcessed =
                fhirClinicalImpression.effectiveDateTime
                    ? dateTimeToUTC(fhirClinicalImpression.effectiveDateTime)
                    : undefined;
            const dateProcessed = fhirClinicalImpression.date
                ? dateTimeToUTC(fhirClinicalImpression.date)
                : undefined;

            const clinicalImpressionResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    ...fhirClinicalImpression, // Spread the original FHIR data
                    subject: subjectReference,
                    encounter: [
                        // Ensure encounter has at least the reference
                        encounterReference, // Spread original encounter data if any
                    ],
                    assessor: assessorReference,
                    ...(effectiveDateTimeProcessed && {
                        effectiveDateTime: effectiveDateTimeProcessed,
                    }),
                    ...(dateProcessed && { date: dateProcessed }),
                    // If identifier needs to be dynamic based on Org_id:
                    identifier:
                        fhirClinicalImpression.identifier?.map((id) => ({
                            ...id,
                            system: `http://sys-ids.kemkes.go.id/clinicalimpression/${dataMasterPasien.org_id}`,
                        })) || [],
                },
                request: {
                    method: "POST",
                    url: "ClinicalImpression",
                },
            };
            bundleEntries.push(clinicalImpressionResource);
        });
    }

    return bundleEntries;
}

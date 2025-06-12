import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, PrognosisDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPrognosisService(
    dataMasterPasien: KunjunganRawatInap,
    dataPrognosis: PrognosisDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataPrognosis) && dataPrognosis.length > 0) {
        dataPrognosis.forEach((item: PrognosisDbRow) => {
            const fhirClinicalImpression = item.data;

            // Ensure subject, encounter, and assessor are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
                display: `Kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
            };
            const assessorReference = fhirClinicalImpression.assessor || {
                // Use assessor from source if available
                reference: `Practitioner/${item.data.assessor?.reference || dataMasterPasien.practitioner_id}`,
                display:
                    item.data.assessor?.display ||
                    dataMasterPasien.practitioner_name,
            };

            // Process date fields, ensuring they are in UTC if present
            const effectiveDateTimeProcessed =
                fhirClinicalImpression.effectiveDateTime
                    ? dateTimeToUTC(fhirClinicalImpression.effectiveDateTime)
                    : undefined; // Or a default like new Date().toISOString() if always required
            const dateProcessed = fhirClinicalImpression.date
                ? dateTimeToUTC(fhirClinicalImpression.date)
                : undefined; // Or a default

            const clinicalImpressionResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    ...fhirClinicalImpression, // Spread the original FHIR data
                    subject: subjectReference,
                    encounter: encounterReference,
                    assessor: assessorReference,
                    ...(effectiveDateTimeProcessed && {
                        effectiveDateTime: effectiveDateTimeProcessed,
                    }),
                    ...(dateProcessed && { date: dateProcessed }),
                    // Ensure other potentially overridden fields are handled if necessary
                    // For example, if identifier needs to be dynamic based on Org_id:
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

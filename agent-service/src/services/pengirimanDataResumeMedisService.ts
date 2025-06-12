import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { KunjunganRawatInap, ResumeMedisDbRow } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataResumeMedisService(
    dataMasterPasien: KunjunganRawatInap,
    dataResumeMedis: ResumeMedisDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (Array.isArray(dataResumeMedis) && dataResumeMedis.length > 0) {
        dataResumeMedis.forEach((item: ResumeMedisDbRow) => {
            const fhirComposition = item.data;

            // Ensure subject and encounter are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
            };

            // Author and Custodian might need to be set to the organization from dataMasterPasien
            // or taken from the source if more appropriate.
            const authorReference = fhirComposition.author.map((auth) => {
                // Example: if author is an organization and needs to be set to current org
                if (auth.reference?.startsWith("Organization/")) {
                    return {
                        reference: `Organization/${dataMasterPasien.org_id}`,
                    };
                }
                return auth;
            });

            const custodianReference =
                fhirComposition.custodian?.reference?.startsWith(
                    "Organization/",
                )
                    ? { reference: `Organization/${dataMasterPasien.org_id}` }
                    : fhirComposition.custodian;

            const dateProcessed = dateTimeToUTC(
                fhirComposition.date || new Date().toISOString(),
            );

            const compositionResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    ...fhirComposition, // Spread the original FHIR data
                    subject: subjectReference,
                    encounter: {
                        ...fhirComposition.encounter, // Spread original encounter data if any
                    },
                    author: authorReference,
                    custodian: custodianReference,
                    date: dateProcessed,
                },
                request: {
                    method: "POST",
                    url: "Composition",
                },
            };
            bundleEntries.push(compositionResource);
        });
    }

    return bundleEntries;
}

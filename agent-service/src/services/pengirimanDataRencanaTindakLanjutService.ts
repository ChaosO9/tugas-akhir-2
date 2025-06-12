import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    KunjunganRawatInap,
    RencanaTindakLanjutDbRow,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";
import { Identifier } from "../utils/interfaceFHIR";

export default async function pengirimanDataRencanaTindakLanjutService(
    dataMasterPasien: KunjunganRawatInap,
    dataRencanaTindakLanjut: RencanaTindakLanjutDbRow[],
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (
        Array.isArray(dataRencanaTindakLanjut) &&
        dataRencanaTindakLanjut.length > 0
    ) {
        dataRencanaTindakLanjut.forEach((item: RencanaTindakLanjutDbRow) => {
            const fhirServiceRequest = item.data;

            // Ensure subject, encounter, and requester are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };
            const encounterReference = {
                reference: `Encounter/${dataMasterPasien.encounter_id}`,
                display:
                    fhirServiceRequest.encounter?.display ||
                    `Kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
            };
            const requesterReference = fhirServiceRequest.requester || {
                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                display: dataMasterPasien.practitioner_name,
            };

            // Process date fields, ensuring they are in UTC if present
            const occurrenceDateTimeProcessed =
                fhirServiceRequest.occurrenceDateTime
                    ? dateTimeToUTC(fhirServiceRequest.occurrenceDateTime)
                    : new Date().toISOString(); // Or a default like new Date().toISOString() if always required

            const authoredOnProcessed = fhirServiceRequest.authoredOn
                ? dateTimeToUTC(fhirServiceRequest.authoredOn)
                : new Date().toISOString(); // Or a default

            const serviceRequestResource: object = {
                fullUrl: `urn:uuid:${item.fhir_id || uuidv4()}`,
                resource: {
                    ...fhirServiceRequest,
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/servicerequest/${dataMasterPasien.org_id}`,
                            value: item.data.identifier?.[0]?.value,
                        },
                    ],
                    subject: subjectReference,
                    encounter: encounterReference,
                    requester: requesterReference,
                    ...(occurrenceDateTimeProcessed && {
                        occurrenceDateTime: occurrenceDateTimeProcessed,
                    }),
                    ...(authoredOnProcessed && {
                        authoredOn: authoredOnProcessed,
                    }),
                    performer: [
                        {
                            reference: `Organization/${dataMasterPasien.org_id}`,
                        },
                    ],
                    // If identifier needs to be dynamic based on Org_id:
                    // identifier: fhirServiceRequest.identifier?.map(id => ({
                    //     ...id,
                    //     system: id.system?.replace("{{Org_id}}", dataMasterPasien.org_id)
                    // })) || [],
                },
                request: {
                    method: "POST",
                    url: "ServiceRequest",
                },
            };
            bundleEntries.push(serviceRequestResource);
        });
    }

    return bundleEntries;
}

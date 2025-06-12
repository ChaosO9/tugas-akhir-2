import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    KunjunganRawatInap,
    DataTindakanProsedurMedisFromRepo,
    ServiceRequestTindakanDbRow,
    ProcedureTindakanDbRow,
    ObservationTindakanDbRow,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataTindakanProsedurMedisService(
    dataMasterPasien: KunjunganRawatInap,
    dataTindakan: DataTindakanProsedurMedisFromRepo,
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (
        dataTindakan &&
        Array.isArray(dataTindakan.serviceRequest) &&
        dataTindakan.serviceRequest.length > 0
    ) {
        dataTindakan.serviceRequest.forEach(
            (srDbRow: ServiceRequestTindakanDbRow) => {
                const fhirServiceRequest = srDbRow.data;
                // const srFhirId = srDbRow.fhir_id; // srFhirId is not used if we process independently

                // --- ServiceRequest ---
                const serviceRequestResource = {
                    fullUrl: `urn:uuid:${uuidv4()}`,
                    resource: {
                        ...fhirServiceRequest,
                        identifier: [
                            {
                                system: `http://sys-ids.kemkes.go.id/servicerequest/${dataMasterPasien.org_id}`,
                                value: "SRSUTURE001",
                            },
                        ],
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        },
                        requester: fhirServiceRequest.requester || {
                            reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                            display: dataMasterPasien.practitioner_name,
                        },
                        occurrenceDateTime: dateTimeToUTC(
                            fhirServiceRequest.occurrenceDateTime,
                        ),
                        authoredOn: dateTimeToUTC(
                            fhirServiceRequest.authoredOn ||
                                new Date().toISOString(),
                        ),
                    },
                    request: {
                        method: "POST",
                        url: "ServiceRequest",
                    },
                };
                bundleEntries.push(serviceRequestResource);
            },
        );
    }

    // --- Process all Procedures ---
    if (
        dataTindakan &&
        Array.isArray(dataTindakan.procedure) &&
        dataTindakan.procedure.length > 0
    ) {
        dataTindakan.procedure.forEach((procDbRow: ProcedureTindakanDbRow) => {
            const fhirProcedure = procDbRow.data;
            const procedureResource = {
                fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB row
                resource: {
                    ...fhirProcedure, // Spread original data
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                    },
                    // Preserve original basedOn if it exists
                    basedOn: fhirProcedure.basedOn,
                    ...(fhirProcedure.performedPeriod && {
                        performedPeriod: {
                            start: dateTimeToUTC(
                                fhirProcedure.performedPeriod.start ||
                                    new Date().toISOString(),
                            ),
                            end: dateTimeToUTC(
                                fhirProcedure.performedPeriod.end ||
                                    new Date().toISOString(),
                            ),
                        },
                    }),
                    ...(fhirProcedure.performedDateTime && {
                        performedDateTime: dateTimeToUTC(
                            fhirProcedure.performedDateTime,
                        ),
                    }),
                    performer: fhirProcedure.performer?.map((p) => ({
                        ...p,
                        actor: p.actor.reference?.startsWith("Practitioner/")
                            ? p.actor
                            : {
                                  reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                                  display: dataMasterPasien.practitioner_name,
                              },
                    })) || [
                        {
                            // Default performer if none in source
                            actor: {
                                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                                display: dataMasterPasien.practitioner_name,
                            },
                        },
                    ],
                },
                request: {
                    method: "POST",
                    url: "Procedure",
                },
            };
            bundleEntries.push(procedureResource);
        });
    }

    // --- Process all Observations ---
    if (
        dataTindakan &&
        Array.isArray(dataTindakan.observation) &&
        dataTindakan.observation.length > 0
    ) {
        dataTindakan.observation.forEach(
            (obsDbRow: ObservationTindakanDbRow) => {
                const fhirObservation = obsDbRow.data;
                const observationResource = {
                    fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB row
                    resource: {
                        ...fhirObservation, // Spread original data
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        },
                        // Preserve original basedOn and partOf if they exist
                        basedOn: fhirObservation.basedOn,
                        partOf: fhirObservation.partOf,
                        effectiveDateTime: dateTimeToUTC(
                            fhirObservation.effectiveDateTime ||
                                new Date().toISOString(),
                        ),
                        issued: dateTimeToUTC(
                            fhirObservation.issued || new Date().toISOString(),
                        ),
                        performer: fhirObservation.performer?.map((p) => ({
                            reference: p.reference?.startsWith("Practitioner/")
                                ? p.reference
                                : `Practitioner/${dataMasterPasien.practitioner_id}`, // Default if not practitioner
                        })) || [
                            {
                                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                            },
                        ], // Default performer
                    },
                    request: { method: "POST", url: "Observation" },
                };
                bundleEntries.push(observationResource);
            },
        );
    }

    return bundleEntries;
}

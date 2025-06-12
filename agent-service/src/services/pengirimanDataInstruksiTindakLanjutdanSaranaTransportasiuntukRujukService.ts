import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    InstruksiTindakLanjutDbRow,
    KunjunganRawatInap,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService(
    dataMasterPasien: KunjunganRawatInap,
    dataInstruksiTindakLanjut: InstruksiTindakLanjutDbRow[],
): Promise<object[] | AppError> {
    let jsonServiceRequestArray: object[] = [];

    if (
        Array.isArray(dataInstruksiTindakLanjut) &&
        dataInstruksiTindakLanjut.length > 0
    ) {
        dataInstruksiTindakLanjut.forEach((instruksiItem) => {
            const fhirServiceRequest = instruksiItem.data; // Access the FHIR ServiceRequest from the data property

            const serviceRequestResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB or generate new
                resource: {
                    resourceType: "ServiceRequest",
                    identifier: fhirServiceRequest.identifier?.map((id) => ({
                        // Keep original identifiers, or adjust system if needed
                        ...id,
                        system:
                            id.system ||
                            `http://sys-ids.kemkes.go.id/servicerequest/${dataMasterPasien.org_id}`,
                    })) || [
                        {
                            system: `http://sys-ids.kemkes.go.id/servicerequest/${dataMasterPasien.org_id}`,
                            value: uuidv4(), // Fallback identifier value
                        },
                    ],
                    status: fhirServiceRequest.status,
                    intent: fhirServiceRequest.intent,
                    category: fhirServiceRequest.category,
                    priority: fhirServiceRequest.priority,
                    code: fhirServiceRequest.code,
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display:
                            fhirServiceRequest.encounter?.display ||
                            `Instruksi terkait kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
                    },
                    occurrenceDateTime: dateTimeToUTC(
                        fhirServiceRequest.occurrenceDateTime ||
                            new Date().toISOString(),
                    ),
                    authoredOn: dateTimeToUTC(
                        fhirServiceRequest.authoredOn ||
                            new Date().toISOString(),
                    ),
                    requester: {
                        reference:
                            fhirServiceRequest.requester?.reference ||
                            `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display:
                            fhirServiceRequest.requester?.display ||
                            dataMasterPasien.practitioner_name,
                    },
                    ...(fhirServiceRequest.performer &&
                        fhirServiceRequest.performer.length > 0 && {
                            performer: fhirServiceRequest.performer.map(
                                (p) => ({
                                    reference: p.reference,
                                    ...(p.display && { display: p.display }),
                                }),
                            ),
                        }),
                    ...(fhirServiceRequest.locationReference &&
                        fhirServiceRequest.locationReference.length > 0 && {
                            locationReference:
                                fhirServiceRequest.locationReference.map(
                                    (lr) => ({
                                        reference: lr.reference,
                                        ...(lr.display && {
                                            display: lr.display,
                                        }),
                                    }),
                                ),
                        }),
                    ...(fhirServiceRequest.locationCode && // Added locationCode from FHIR data
                        fhirServiceRequest.locationCode.length > 0 &&
                        fhirServiceRequest.locationCode[0]?.coding?.[0]
                            ?.code !== "AMB" && {
                            locationCode: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                                    code: "HOSP",
                                    display: "Hospital",
                                },
                            ],
                        }),
                    ...(fhirServiceRequest.reasonCode &&
                        fhirServiceRequest.reasonCode.length > 0 && {
                            reasonCode: fhirServiceRequest.reasonCode,
                        }),
                    ...(fhirServiceRequest.patientInstruction && {
                        patientInstruction:
                            fhirServiceRequest.patientInstruction,
                    }),
                },
                request: {
                    method: "POST",
                    url: "ServiceRequest",
                },
            };
            jsonServiceRequestArray.push(serviceRequestResource);
        });
    }

    return jsonServiceRequestArray;
}

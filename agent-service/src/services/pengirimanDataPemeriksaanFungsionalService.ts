import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    KunjunganRawatInap,
    PemeriksaanFungsionalDbRow,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPemeriksaanFungsional(
    dataMasterPasien: KunjunganRawatInap,
    dataPemeriksaanFungsional: PemeriksaanFungsionalDbRow[],
): Promise<object[] | AppError> {
    let jsonObservationArray: object[] = [];

    if (
        Array.isArray(dataPemeriksaanFungsional) &&
        dataPemeriksaanFungsional.length > 0
    ) {
        dataPemeriksaanFungsional.forEach((fungsionalItem) => {
            const fhirObservation = fungsionalItem.data; // Access the FHIR Observation from the data property

            const observationResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB or generate new
                resource: {
                    resourceType: "Observation",
                    status: fhirObservation.status,
                    category: fhirObservation.category,
                    code: fhirObservation.code,
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display:
                            fhirObservation.encounter?.display ||
                            `Pemeriksaan Fungsional ${dataMasterPasien.patient_name} pada ${new Date(fhirObservation.effectiveDateTime || Date.now()).toLocaleDateString("id-ID")}`,
                    },
                    effectiveDateTime: dateTimeToUTC(
                        fhirObservation.effectiveDateTime ||
                            new Date().toISOString(),
                    ),
                    issued: dateTimeToUTC(
                        fhirObservation.issued || new Date().toISOString(),
                    ),
                    performer: [
                        {
                            reference:
                                fhirObservation.performer?.[0]?.reference ||
                                `Practitioner/${dataMasterPasien.practitioner_id}`, // Use performer from FHIR data or default
                            display: dataMasterPasien.practitioner_name,
                        },
                    ],
                    valueCodeableConcept: fhirObservation.valueCodeableConcept,
                    // Include other fields from fhirObservation as needed
                    ...(fhirObservation.identifier && {
                        identifier: fhirObservation.identifier,
                    }),
                    ...(fhirObservation.basedOn && {
                        basedOn: fhirObservation.basedOn,
                    }),
                    ...(fhirObservation.partOf && {
                        partOf: fhirObservation.partOf,
                    }),
                    ...(fhirObservation.focus && {
                        focus: fhirObservation.focus,
                    }),
                    ...(fhirObservation.valueQuantity && {
                        valueQuantity: fhirObservation.valueQuantity,
                    }),
                    ...(fhirObservation.valueString && {
                        valueString: fhirObservation.valueString,
                    }),
                    ...(fhirObservation.dataAbsentReason && {
                        dataAbsentReason: fhirObservation.dataAbsentReason,
                    }),
                    ...(fhirObservation.interpretation && {
                        interpretation: fhirObservation.interpretation,
                    }),
                    ...(fhirObservation.note && { note: fhirObservation.note }),
                    ...(fhirObservation.bodySite && {
                        bodySite: fhirObservation.bodySite,
                    }),
                    ...(fhirObservation.method && {
                        method: fhirObservation.method,
                    }),
                    ...(fhirObservation.component && {
                        component: fhirObservation.component,
                    }),
                },
                request: {
                    method: "POST",
                    url: "Observation",
                },
            };
            jsonObservationArray.push(observationResource);
        });
    }

    return jsonObservationArray;
}

import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    KunjunganRawatInap,
    DataPemulanganPasienFromRepo,
    ObservationPemulanganDbRow,
    CarePlanPemulanganDbRow,
} from "../utils/interface"; // Removed Coding import as it's not directly used after this change
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPemulanganPasienService(
    dataMasterPasien: KunjunganRawatInap,
    dataPemulangan: DataPemulanganPasienFromRepo,
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    // Process Observations
    if (
        Array.isArray(dataPemulangan.observation) &&
        dataPemulangan.observation.length > 0
    ) {
        dataPemulangan.observation.forEach(
            (obsItem: ObservationPemulanganDbRow) => {
                // Access FHIR data directly from obsItem.data
                const fhirObservation = obsItem.data;

                const observationResource = {
                    fullUrl: `urn:uuid:${obsItem.fhir_id || uuidv4()}`, // Use fhir_id from DB row or generate new
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
                                fhirObservation.encounter?.display || // Use display from FHIR data if available
                                `${fhirObservation.code?.text || "Pemeriksaan terkait pemulangan"} ${dataMasterPasien.patient_name} pada ${new Date(fhirObservation.effectiveDateTime || Date.now()).toLocaleDateString("id-ID")}`,
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
                                // Use performer from FHIR data if available, else default
                                reference:
                                    fhirObservation.performer?.[0]?.reference ||
                                    `Practitioner/${dataMasterPasien.practitioner_id}`,
                                display: dataMasterPasien.practitioner_name,
                            },
                        ],
                        valueCodeableConcept:
                            fhirObservation.valueCodeableConcept,
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
                    },
                    request: {
                        method: "POST",
                        url: "Observation",
                    },
                };
                bundleEntries.push(observationResource);
            },
        );
    }

    // Process CarePlans
    if (
        Array.isArray(dataPemulangan.carePlan) &&
        dataPemulangan.carePlan.length > 0
    ) {
        dataPemulangan.carePlan.forEach((cpItem: CarePlanPemulanganDbRow) => {
            // Access FHIR data directly from cpItem.data
            const fhirCarePlan = cpItem.data;

            const carePlanResource = {
                fullUrl: `urn:uuid:${cpItem.fhir_id || uuidv4()}`, // Use fhir_id from DB row or generate new
                resource: {
                    resourceType: "CarePlan",
                    status: fhirCarePlan.status,
                    intent: fhirCarePlan.intent,
                    category: fhirCarePlan.category,
                    title: fhirCarePlan.title,
                    description: fhirCarePlan.description,
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display: fhirCarePlan.encounter?.display, // Use display from FHIR data if available
                    },
                    created: dateTimeToUTC(
                        fhirCarePlan.created || new Date().toISOString(),
                    ),
                    author: {
                        // Use author from FHIR data if available, else default
                        reference:
                            fhirCarePlan.author?.reference ||
                            `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display: dataMasterPasien.practitioner_name,
                    },
                    ...(fhirCarePlan.goal && { goal: fhirCarePlan.goal }),
                },
                request: {
                    method: "POST",
                    url: "CarePlan",
                },
            };
            bundleEntries.push(carePlanResource);
        });
    }

    return bundleEntries;
}

import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    KunjunganRawatInap,
    DataPemeriksaanRadiologiFromRepo,
    ServiceRequestRadiologiDbRow,
    ObservationRadiologiDbRow,
    DiagnosticReportRadiologiDbRow,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPemeriksaanPenunjangRadiologiService(
    dataMasterPasien: KunjunganRawatInap,
    dataPemeriksaanRadiologi: DataPemeriksaanRadiologiFromRepo,
): Promise<object[] | AppError> {
    let bundleEntries: object[] = [];

    if (
        dataPemeriksaanRadiologi &&
        Array.isArray(dataPemeriksaanRadiologi.serviceRequest) &&
        dataPemeriksaanRadiologi.serviceRequest.length > 0
    ) {
        dataPemeriksaanRadiologi.serviceRequest.forEach(
            (srDbRow: ServiceRequestRadiologiDbRow) => {
                // Find corresponding Observation and DiagnosticReport
                const fhirServiceRequest = srDbRow.data; // fhirServiceRequest from the current iteration

                // --- ServiceRequest (always processed) ---
                const serviceRequestResource = {
                    fullUrl: `urn:uuid:${uuidv4()}`,
                    resource: {
                        resourceType: "ServiceRequest",
                        // Conditionally add identifier array if fhirServiceRequest.identifier exists and is not empty
                        ...(fhirServiceRequest.identifier &&
                            fhirServiceRequest.identifier.length > 0 && {
                                identifier: fhirServiceRequest.identifier.map(
                                    (item) => ({
                                        ...(item.use && { use: item.use }),
                                        ...(item.system && {
                                            system: `http://sys-ids.kemkes.go.id/servicerequest/${dataMasterPasien.org_id}`,
                                        }),
                                        ...(item.value && {
                                            value: item.value,
                                        }),
                                    }),
                                ),
                            }),
                        status: fhirServiceRequest.status,
                        intent: fhirServiceRequest.intent,
                        category: fhirServiceRequest.category,
                        priority: fhirServiceRequest.priority,
                        code: fhirServiceRequest.code,
                        orderDetail: fhirServiceRequest.orderDetail,
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        },
                        occurrenceDateTime: dateTimeToUTC(
                            fhirServiceRequest.occurrenceDateTime,
                        ),
                        authoredOn: dateTimeToUTC(
                            fhirServiceRequest.authoredOn ||
                                new Date().toISOString(),
                        ),
                        requester: fhirServiceRequest.requester,
                        performer: fhirServiceRequest.performer,
                        reasonCode: fhirServiceRequest.reasonCode,
                        // supportingInfo:
                        //     fhirServiceRequest.supportingInfo?.forEach(() => {
                        //         return {
                        //             reference: `urn:uuid:${uuidv4()}`,
                        //         };
                        //     }),
                        bodySite: fhirServiceRequest.bodySite,
                        // Include other fields from fhirServiceRequest as needed
                        ...(fhirServiceRequest.instantiatesCanonical && {
                            instantiatesCanonical:
                                fhirServiceRequest.instantiatesCanonical,
                        }),
                        ...(fhirServiceRequest.instantiatesUri && {
                            instantiatesUri: fhirServiceRequest.instantiatesUri,
                        }),
                        ...(fhirServiceRequest.basedOn && {
                            basedOn: fhirServiceRequest.basedOn,
                        }),
                    },
                    request: { method: "POST", url: "ServiceRequest" },
                };
                bundleEntries.push(serviceRequestResource);
            },
        );
    }

    // --- Process all Observations ---
    if (
        dataPemeriksaanRadiologi &&
        Array.isArray(dataPemeriksaanRadiologi.observation) &&
        dataPemeriksaanRadiologi.observation.length > 0
    ) {
        dataPemeriksaanRadiologi.observation.forEach(
            (obsDbRow: ObservationRadiologiDbRow) => {
                const fhirObservation = obsDbRow.data;
                let imagingStudyReference = fhirObservation.derivedFrom; // Use existing if available
                if (
                    !imagingStudyReference ||
                    imagingStudyReference.length === 0
                ) {
                    // Generate a new ImagingStudy reference if one is conceptually needed but missing
                    // This is a placeholder; specific logic might be needed to determine when an IS is truly required.
                    // imagingStudyReference = [{ reference: `ImagingStudy/${uuidv4()}` }];
                }

                const observationResource = {
                    fullUrl: `urn:uuid:${obsDbRow.fhir_id}`, // Use fhir_id from DB row
                    resource: {
                        resourceType: "Observation",
                        ...(fhirObservation.identifier &&
                            fhirObservation.identifier.length > 0 && {
                                identifier: fhirObservation.identifier.map(
                                    (item) => ({
                                        ...(item.use && { use: item.use }),
                                        ...(item.system && {
                                            system: `http://sys-ids.kemkes.go.id/observation/${dataMasterPasien.org_id}`,
                                        }),
                                        ...(item.value && {
                                            value: item.value,
                                        }),
                                    }),
                                ),
                            }),
                        basedOn: fhirObservation.basedOn, // Preserve original basedOn
                        status: fhirObservation.status,
                        category: fhirObservation.category,
                        code: fhirObservation.code,
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                            display: fhirObservation.encounter?.display,
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
                                reference: `Organization/${dataMasterPasien.org_id}`,
                            },
                        ],
                        valueString: fhirObservation.valueString,
                        valueQuantity: fhirObservation.valueQuantity,
                        valueCodeableConcept:
                            fhirObservation.valueCodeableConcept,
                        bodySite: fhirObservation.bodySite,
                        // derivedFrom: imagingStudyReference, // Use determined/existing ImagingStudy reference
                        ...(fhirObservation.partOf && {
                            partOf: fhirObservation.partOf,
                        }),
                        ...(fhirObservation.interpretation && {
                            interpretation: fhirObservation.interpretation,
                        }),
                        ...(fhirObservation.note && {
                            note: fhirObservation.note,
                        }),
                        ...(fhirObservation.method && {
                            method: fhirObservation.method,
                        }),
                        ...(fhirObservation.specimen && {
                            specimen: fhirObservation.specimen,
                        }),
                        ...(fhirObservation.device && {
                            device: fhirObservation.device,
                        }),
                        ...(fhirObservation.referenceRange && {
                            referenceRange: fhirObservation.referenceRange,
                        }),
                        ...(fhirObservation.hasMember && {
                            hasMember: fhirObservation.hasMember,
                        }),
                        ...(fhirObservation.component && {
                            component: fhirObservation.component,
                        }),
                    },
                    request: { method: "POST", url: "Observation" },
                };
                bundleEntries.push(observationResource);
            },
        );
    }

    // --- Process all DiagnosticReports ---
    if (
        dataPemeriksaanRadiologi &&
        Array.isArray(dataPemeriksaanRadiologi.diagnosticReport) &&
        dataPemeriksaanRadiologi.diagnosticReport.length > 0
    ) {
        dataPemeriksaanRadiologi.diagnosticReport.forEach(
            (drDbRow: DiagnosticReportRadiologiDbRow) => {
                const fhirDiagnosticReport = drDbRow.data;
                let imagingStudyReference = fhirDiagnosticReport.imagingStudy; // Use existing if available
                if (
                    !imagingStudyReference ||
                    imagingStudyReference.length === 0
                ) {
                    // Generate a new ImagingStudy reference if one is conceptually needed but missing
                    // imagingStudyReference = [{ reference: `ImagingStudy/${uuidv4()}` }];
                }

                const diagnosticReportResource = {
                    fullUrl: `urn:uuid:${drDbRow.fhir_id}`, // Use fhir_id from DB row
                    resource: {
                        resourceType: "DiagnosticReport",
                        ...(fhirDiagnosticReport.identifier &&
                            fhirDiagnosticReport.identifier.length > 0 && {
                                identifier: fhirDiagnosticReport.identifier.map(
                                    (item) => ({
                                        ...(item.use && { use: item.use }),
                                        ...(item.system && {
                                            system: `http://sys-ids.kemkes.go.id/diagnostic/${dataMasterPasien.org_id}/lab`,
                                        }),
                                        ...(item.value && {
                                            value: item.value,
                                        }),
                                    }),
                                ),
                            }),
                        basedOn: fhirDiagnosticReport.basedOn, // Preserve original basedOn
                        status: fhirDiagnosticReport.status,
                        category: fhirDiagnosticReport.category,
                        code: fhirDiagnosticReport.code,
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        },
                        effectiveDateTime: dateTimeToUTC(
                            fhirDiagnosticReport.effectiveDateTime ||
                                new Date().toISOString(),
                        ),
                        issued: dateTimeToUTC(
                            fhirDiagnosticReport.issued ||
                                new Date().toISOString(),
                        ),
                        performer: [
                            {
                                reference: `Organization/${dataMasterPasien.org_id}`,
                            },
                        ],
                        resultInterpreter:
                            fhirDiagnosticReport.resultInterpreter,
                        specimen: fhirDiagnosticReport.specimen,
                        result: fhirDiagnosticReport.result, // Preserve original result links
                        // imagingStudy: imagingStudyReference, // Use determined/existing ImagingStudy reference
                        media: fhirDiagnosticReport.media,
                        conclusion: fhirDiagnosticReport.conclusion,
                        conclusionCode: fhirDiagnosticReport.conclusionCode,
                        presentedForm: fhirDiagnosticReport.presentedForm,
                    },
                    request: { method: "POST", url: "DiagnosticReport" },
                };
                bundleEntries.push(diagnosticReportResource);
            },
        );
    }

    return bundleEntries;
}

import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import {
    KunjunganRawatInap,
    dataPemeriksaanLab,
    diagnosticReport,
    observationLab,
    serviceRequestLab,
    specimenLab,
} from "../utils/interface";

export default async function pengirimanDataPemeriksaanPenunjangLaboratoriumService(
    dataPenunjuangLab: dataPemeriksaanLab,
): Promise<object[]> {
    let jsonClinicalImpression = [] as object[];

    if (
        Array.isArray(dataPenunjuangLab.serviceRequest) &&
        dataPenunjuangLab.serviceRequest.length > 0
    ) {
        dataPenunjuangLab.serviceRequest.forEach(
            (serviceRequestItem: serviceRequestLab) => {
                jsonClinicalImpression.push({
                    fullUrl: `urn:uuid:${serviceRequestItem.servicerequest_uuid}`,
                    resource: {
                        resourceType: "ServiceRequest",
                        identifier: [
                            {
                                system: `http://sys-ids.kemkes.go.id/servicerequest/${serviceRequestItem.org_id}`,
                                value: `${serviceRequestItem.servicerequest_uuid}`,
                            },
                        ],
                        status: "unknown",
                        intent: "original-order",
                        category: [
                            {
                                coding: [
                                    {
                                        system: "http://snomed.info/sct",
                                        code: "108252007",
                                        display: "Laboratory procedure",
                                    },
                                ],
                            },
                        ],
                        // priority: "routine",
                        code: {
                            coding: [
                                {
                                    system: `${serviceRequestItem.system}`,
                                    code: `${serviceRequestItem.code}`,
                                    display: `${serviceRequestItem.display}`,
                                },
                                // {
                                //     system: "http://terminology.kemkes.go.id/CodeSystem/kptl",
                                //     code: "30326",
                                //     display: "CHOLESTEROL TOTAL/KOLESTEROL TOTAL",
                                // },
                            ],
                            text: `${serviceRequestItem.text}`,
                        },
                        subject: {
                            reference: `Patient/${serviceRequestItem.patient_id}`,
                        },
                        encounter: {
                            reference: `Encounter/${serviceRequestItem.encounter}`,
                            display: `${serviceRequestItem.text}`,
                        },
                        // occurrenceDateTime: "2022-12-26T16:30:00+00:00",
                        authoredOn: `${dateTimeToUTC(serviceRequestItem.authoredon)}`,
                        requester: {
                            reference: `Practitioner/${serviceRequestItem.practitioner_id}`,
                            display: `${serviceRequestItem.practitioner_nama}`,
                        },
                        performer: [
                            {
                                reference: `Practitioner/${serviceRequestItem.practitioner_id}`,
                                display: `${serviceRequestItem.practitioner_nama}`,
                            },
                        ],
                        // reasonReference: [
                        //     {
                        //         reference:
                        //             "Condition/{{Condition_KeluhanUtama_id}}",
                        //     },
                        // ],
                        // supportingInfo: [
                        //     {
                        //         reference:
                        //             "Procedure/{{Procedure_StatusPuasa_Day1_id}}",
                        //     },
                        // ],
                        // note: [
                        //     {
                        //         text: "Pasien diminta untuk berpuasa terlebih dahulu",
                        //     },
                        // ],
                    },
                    request: {
                        method: "POST",
                        url: "ServiceRequest",
                    },
                });
            },
        );
    }

    if (
        Array.isArray(dataPenunjuangLab.specimen) &&
        dataPenunjuangLab.specimen.length > 0
    ) {
        dataPenunjuangLab.specimen.forEach((specimenItem: specimenLab) => {
            jsonClinicalImpression.push({
                fullUrl: `urn:uuid:${specimenItem.specimen_uuid}`,
                resource: {
                    resourceType: "Specimen",
                    // extension: [
                    //     {
                    //         url: "https://fhir.kemkes.go.id/r4/StructureDefinition/TransportedTime",
                    //         valueDateTime: "2022-12-26T15:15:00+00:00",
                    //     },
                    //     {
                    //         url: "https://fhir.kemkes.go.id/r4/StructureDefinition/TransportedPerson",
                    //         valueContactDetail: {
                    //             name: "Burhan",
                    //             telecom: [
                    //                 {
                    //                     system: "phone",
                    //                     value: "021-5375162",
                    //                 },
                    //             ],
                    //         },
                    //     },
                    //     {
                    //         url: "https://fhir.kemkes.go.id/r4/StructureDefinition/ReceivedPerson",
                    //         valueReference: {
                    //             reference:
                    //                 "Practitioner/{{Practitioner_Received_id}}",
                    //             display: "{{Practitioner_Received_Nama}}",
                    //         },
                    //     },
                    // ],
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/specimen/${specimenItem.org_id}`,
                            value: `${specimenItem.value}`,
                            assigner: {
                                reference: `Organization/${specimenItem.org_id}`,
                            },
                        },
                    ],
                    status: "available",
                    type: {
                        coding: [
                            {
                                system: specimenItem.spesimen_system,
                                code: specimenItem.spesimen_kode,
                                display: specimenItem.spesimen_nama,
                            },
                        ],
                    },
                    subject: {
                        reference: `Patient/${specimenItem.patient_id}`,
                        display: specimenItem.patient_name,
                    },
                    receivedTime: dateTimeToUTC(specimenItem.authoredon),
                    request: [
                        {
                            reference: `ServiceRequest/${specimenItem.servicerequest_uuid}`,
                        },
                    ],
                    collection: {
                        collector: {
                            reference: `Practitioner/${specimenItem.practitioner_id}`,
                            display: specimenItem.practitioner_nama,
                        },
                        // collectedDateTime: "2022-12-26T15:00:00+00:00",
                        // quantity: {
                        //     value: 6,
                        //     unit: "mL",
                        // },
                        method: {
                            coding: [
                                {
                                    system: specimenItem.metode_system,
                                    code: specimenItem.metode_kode,
                                    display: specimenItem.metode_nama,
                                },
                            ],
                        },
                        // fastingStatusCodeableConcept: {
                        //     coding: [
                        //         {
                        //             system: "http://terminology.hl7.org/CodeSystem/v2-0916",
                        //             code: "NF",
                        //             display:
                        //                 "The patient indicated they did not fast prior to the procedure.",
                        //         },
                        //     ],
                        // },
                    },
                    // processing: [
                    //     {
                    //         procedure: {
                    //             coding: [
                    //                 {
                    //                     system: "http://snomed.info/sct",
                    //                     code: "9265001",
                    //                     display: "Specimen processing",
                    //                 },
                    //             ],
                    //         },
                    //         timeDateTime: "2022-12-27T16:30:00+00:00",
                    //     },
                    // ],
                    // condition: [
                    //     {
                    //         text: "Kondisi Spesimen Baik",
                    //     },
                    // ],
                },
                request: {
                    method: "POST",
                    url: "Specimen",
                },
            });
        });
    }

    if (
        Array.isArray(dataPenunjuangLab.observation) &&
        dataPenunjuangLab.observation.length > 0
    ) {
        dataPenunjuangLab.observation.forEach(
            (observationItem: observationLab) => {
                let hasil_lab = observationItem.hasil_lab[0];
                jsonClinicalImpression.push({
                    fullUrl: `urn:uuid:${observationItem.observation_uuid}`,
                    resource: {
                        resourceType: "Observation",
                        identifier: [
                            {
                                system: `http://sys-ids.kemkes.go.id/observation/${observationItem.org_id}`,
                                value: observationItem.value,
                            },
                        ],
                        basedOn: [
                            {
                                reference: `ServiceRequest/${observationItem.servicerequest_uuid}`,
                            },
                        ],
                        status: "final",
                        category: [
                            {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                        code: "laboratory",
                                        display: "Laboratory",
                                    },
                                ],
                            },
                        ],
                        code: {
                            coding: [
                                {
                                    system: observationItem.loinc_system,
                                    code: observationItem.loinc_code,
                                    display: observationItem.loinc_display,
                                },
                            ],
                        },
                        subject: {
                            reference: `Patient/${observationItem.patient_id}`,
                        },
                        encounter: {
                            reference: `Encounter/${observationItem.encounter}`,
                        },
                        effectiveDateTime: dateTimeToUTC(
                            observationItem.authoredon,
                        ),
                        // issued: "2022-12-26T22:30:10+00:00",
                        performer: [
                            {
                                reference: `Practitioner/${observationItem.practitioner_id}`,
                            },
                            {
                                reference: `Organization/${observationItem.org_id}`,
                            },
                        ],
                        ...(hasil_lab.valueQuantity_value && {
                            valueQuantity: {
                                value: hasil_lab.valueQuantity_value,
                                unit: hasil_lab.valueQuantity_unit,
                                system: hasil_lab.valueQuantity_system,
                                code: hasil_lab.valueQuantity_code,
                            },
                        }),
                        // interpretation: [
                        //     {
                        //         coding: [
                        //             {
                        //                 system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                        //                 code: "H",
                        //                 display: "High",
                        //             },
                        //         ],
                        //     },
                        // ],
                        valueCodeableConcept: {
                            coding: [
                                {
                                    system: hasil_lab.valueCodeableConcept_coding_system,
                                    code: hasil_lab.valueCodeableConcept_coding_code,
                                    display:
                                        hasil_lab.valueCodeableConcept_coding_display,
                                },
                            ],
                        },
                        // specimen: {
                        //     reference: "Specimen/{{Specimen_Day1_id}}",
                        // },
                        ...(hasil_lab.referenceRange_low_value && {
                            referenceRange: [
                                // {
                                //     high: {
                                //         value: 200,
                                //         unit: "mg/dL",
                                //         system: "http://unitsofmeasure.org",
                                //         code: "mg/dL",
                                //     },
                                //     // text: "Normal",
                                // },
                                {
                                    // low: {
                                    //     value: 201,
                                    //     unit: "mg/dL",
                                    //     system: "http://unitsofmeasure.org",
                                    //     code: "mg/dL",
                                    // },
                                    high: {
                                        value: hasil_lab.referenceRange_high_value,
                                        unit: hasil_lab.referenceRange_high_unit,
                                        system: hasil_lab.referenceRange_high_sytem,
                                        code: hasil_lab.referenceRange_high_code,
                                    },
                                    // text: "Borderline high",
                                },
                                {
                                    low: {
                                        value: hasil_lab.referenceRange_low_value,
                                        unit: hasil_lab.referenceRange_low_unit,
                                        system: hasil_lab.referenceRange_low_sytem,
                                        code: hasil_lab.referenceRange_low_code,
                                    },
                                    // text: "High",
                                },
                            ],
                        }),
                    },
                    request: {
                        method: "POST",
                        url: "Observation",
                    },
                });
            },
        );
    }

    if (
        Array.isArray(dataPenunjuangLab.diagnosticReport) &&
        dataPenunjuangLab.diagnosticReport.length > 0
    ) {
        dataPenunjuangLab.diagnosticReport.forEach(
            (diagnosticItem: diagnosticReport) => {
                jsonClinicalImpression.push({
                    fullUrl: `urn:uuid:${diagnosticItem.medicationrequest_uuid}`,
                    resource: {
                        resourceType: "DiagnosticReport",
                        identifier: [
                            {
                                use: "official",
                                system: `http://sys-ids.kemkes.go.id/diagnostic/${diagnosticItem.org_id}/lab`,
                                value: diagnosticItem.value,
                            },
                        ],
                        basedOn: [
                            {
                                reference: `ServiceRequest/${diagnosticItem.servicerequest_uuid}`,
                            },
                        ],
                        status: "final",
                        category: [
                            {
                                coding: [
                                    {
                                        system: diagnosticItem.category_link,
                                        code: diagnosticItem.category_kode,
                                        display: diagnosticItem.category_nama,
                                    },
                                ],
                            },
                        ],
                        code: {
                            coding: [
                                {
                                    system: diagnosticItem.loinc_system,
                                    code: diagnosticItem.loinc_code,
                                    display: diagnosticItem.loinc_display,
                                },
                            ],
                            text: diagnosticItem.loinc_text,
                        },
                        subject: {
                            reference: `Patient/${diagnosticItem.patient_id}`,
                        },
                        encounter: {
                            reference: `Encounter/${diagnosticItem.encounter}`,
                        },
                        effectiveDateTime: "2022-12-26T22:30:10+00:00",
                        issued: diagnosticItem.pmedispasien_created_date_hasil,
                        performer: [
                            {
                                reference: `Practitioner/${diagnosticItem.practitioner_id}`,
                            },
                            {
                                reference: `Organization/${diagnosticItem.org_id}`,
                            },
                        ],
                        specimen: [
                            {
                                reference: `Specimen/${diagnosticItem.specimen_uuid}`,
                            },
                        ],
                        result: [
                            {
                                reference: `Observation/${diagnosticItem.observation_uuid}`,
                            },
                        ],
                        // conclusionCode: [
                        //     {
                        //         coding: [
                        //             {
                        //                 system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                        //                 code: "H",
                        //                 display: "High",
                        //             },
                        //         ],
                        //     },
                        // ],
                    },
                    request: {
                        method: "POST",
                        url: "DiagnosticReport",
                    },
                });
            },
        );
    }

    return jsonClinicalImpression;
}

// data penunjuang lab/service request: apakah kode KPTL wajib di masukkan karena dokumentasinya ada, kemudian performer masih menggunakan asumsi yaitu datanya sama dengan requester, reasonreference

// data penunjuang lab/observation: observation.specimen bisa saja diisi namun masih ragu apakah valid datanya

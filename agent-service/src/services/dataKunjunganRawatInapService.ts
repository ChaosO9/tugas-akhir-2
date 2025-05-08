import dapatkanDataKunjunganRawatInap from "../repositories/pendaftaranKunjunganRawatInap";
import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import { formatDateToISO } from "../utils/functions";
import { KunjunganRawatInap } from "../utils/interface";
import {
    EncounterResource,
    resourceTemplate,
} from "../utils/interfaceValidation";

export default async function dataKunjunganRawatInapService(
    dataMasterPasien: KunjunganRawatInap,
    OrganizationID: string,
    conditions: any[],
    LocationID: string,
    LocationName: string,
): Promise<resourceTemplate> {
    const jsonEncounter: resourceTemplate = {
        fullUrl: "urn:uuid:" + String(dataMasterPasien.encounter_id),
        resource: {
            resourceType: "Encounter",
            identifier: [
                {
                    system: `http://sys-ids.kemkes.go.id/encounter/${OrganizationID}`,
                    value: `${dataMasterPasien.registration_id}`,
                },
            ],
            status: "finished",
            class: {
                system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                code: "IMP",
                display: "inpatient encounter",
            },
            subject: {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            },
            participant: [
                {
                    type: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                    code: "ATND",
                                    display: "attender",
                                },
                            ],
                        },
                    ],
                    individual: {
                        reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display: `${dataMasterPasien.practitioner_name}`,
                    },
                },
            ],
            period: {
                start: `${dateTimeToUTC(dataMasterPasien.period_start)}`,
            },
            location: [
                {
                    location: {
                        reference: `Location/${LocationID}`,
                        display: String(LocationName),
                    },
                    // extension: [
                    //     {
                    //         url: "https://fhir.kemkes.go.id/r4/StructureDefinition/ServiceClass",
                    //         extension: [
                    //             {
                    //                 url: "value",
                    //                 valueCodeableConcept: {
                    //                     coding: [
                    //                         {
                    //                             system: "http://terminology.kemkes.go.id/CodeSystem/locationServiceClass-Inpatient",
                    //                             code: "1",
                    //                             display: "Kelas 1",
                    //                         },
                    //                     ],
                    //                 },
                    //             },
                    //             {
                    //                 url: "upgradeClassIndicator",
                    //                 valueCodeableConcept: {
                    //                     coding: [
                    //                         {
                    //                             system: "http://terminology.kemkes.go.id/CodeSystem/locationUpgradeClass",
                    //                             code: "kelas-tetap",
                    //                             display:
                    //                                 "Kelas Tetap Perawatan",
                    //                         },
                    //                     ],
                    //                 },
                    //             },
                    //         ],
                    //     },
                    // ],
                },
            ],
            statusHistory: [
                {
                    status: "arrived",
                    period: {
                        start: formatDateToISO(dataMasterPasien.arrived),
                        end: formatDateToISO(dataMasterPasien.arrived),
                    },
                },
                {
                    status: "in-progress",
                    period: {
                        start: formatDateToISO(dataMasterPasien.in_progress),
                        end: formatDateToISO(dataMasterPasien.in_progress),
                    },
                },
                {
                    status: "finished",
                    period: {
                        start: formatDateToISO(dataMasterPasien.finished),
                        end: formatDateToISO(dataMasterPasien.finished),
                    },
                },
            ],
            serviceProvider: {
                reference: `Organization/${OrganizationID}`,
            },
            // ,
            // "basedOn": [
            //     {
            //         "reference": "ServiceRequest/{{ServiceRequest_PraRanap}}"
            //     }
            // ]
        },
        request: {
            method: "POST",
            url: "Encounter",
        },
    };

    if (Array.isArray(conditions) && conditions.length > 0) {
        (jsonEncounter.resource as EncounterResource).diagnosis =
            conditions.map((conditionItem, index) => ({
                condition: {
                    reference:
                        "urn:uuid:" +
                        String(conditionItem.condition[index].condition_uuid),
                    display: String(
                        conditionItem.condition[index].condition_nama,
                    ),
                },
                use: {
                    coding: [
                        {
                            system: "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                            code: "DD",
                            display: "Discharge diagnosis",
                        },
                    ],
                },
                rank: index + 1,
            }));
    }

    return jsonEncounter;
}

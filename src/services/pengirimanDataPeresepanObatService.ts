import { dataPeresepanObat, KunjunganRawatInap } from "../utils/interface";

export default async function pengirimanDataPeresepanObat(
    dataMasterPasien: KunjunganRawatInap,
    dataPeresepanObat: dataPeresepanObat,
): Promise<object[]> {
    let jsonMedication = [] as object[];

    const medication = dataPeresepanObat.medication;
    const medicationRequest = dataPeresepanObat.medicationRequest;

    if (Array.isArray(medication) && medication.length > 0) {
        medication.forEach((medicationItem) => {
            const racikan =
                medicationItem.ingredient_racikan === null
                    ? null
                    : medicationItem.ingredient_racikan;

            let extension: { code: string | null; display: string | null } = {
                code: null,
                display: null,
            };

            if (medicationItem.racikan === "y") {
                extension.code = "NC";
                extension.display = "Non-compound";
            } else {
                extension.code = "SD";
                extension.display = "Gives of such doses";
            }

            jsonMedication.push({
                fullUrl: `urn:uuid:${medicationItem.medication_uuid}`,
                resource: {
                    resourceType: "Medication",
                    meta: {
                        profile: [
                            "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication",
                        ],
                    },
                    extension: [
                        {
                            url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                            valueCodeableConcept: {
                                coding: [
                                    {
                                        system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                        code: extension.code,
                                        display: extension.display,
                                    },
                                ],
                            },
                        },
                    ],
                    ...(medicationItem.racikan === "t" && {
                        identifier: [
                            {
                                use: "official",
                                system: `http://sys-ids.kemkes.go.id/medication/${dataMasterPasien.org_id}`,
                                value: medicationItem.identifier_value,
                            },
                        ],
                    }),
                    ...(medicationItem.racikan === "t" && {
                        code: {
                            coding: [
                                {
                                    system: "http://sys-ids.kemkes.go.id/kfa",
                                    code: medicationItem.code_coding_code,
                                    display: medicationItem.code_coding_display,
                                },
                            ],
                        },
                    }),
                    status: "active",
                    // manufacturer: {
                    //     reference: "Organization/90000001",
                    // },
                    ...(medicationItem.form_coding_code !== null && {
                        form: {
                            coding: [
                                {
                                    system: medicationItem.form_coding_system,
                                    code: medicationItem.form_coding_code,
                                    display: medicationItem.form_coding_display,
                                },
                            ],
                        },
                    }),
                    ...(medicationItem.racikan === "y" &&
                        medicationItem.ingredient_racikan && {
                            ingredient: [
                                {
                                    itemCodeableConcept: {
                                        coding: [
                                            {
                                                system: "http://sys-ids.kemkes.go.id/kfa",
                                                code: medicationItem.itemCodeableConcept_coding_code,
                                                display:
                                                    medicationItem.itemCodeableConcept_coding_display,
                                            },
                                        ],
                                    },
                                    isActive: true,
                                    strength: {
                                        ...(racikan !== null && {
                                            numerator: {
                                                value: racikan[0]
                                                    .ingredient_strength_value,
                                                system: racikan[0]
                                                    .ingredient_denominator_system,
                                                code: racikan[0]
                                                    .ingredient_denominator_kode,
                                            },
                                        }),
                                        denominator: {
                                            value: medicationItem.ingredient_strength_denominator_value,
                                            system: medicationItem.strength_denominator_system,
                                            code: medicationItem.strength_denominator_code,
                                        },
                                    },
                                },
                            ],
                        }),
                },
                request: {
                    method: "POST",
                    url: "Medication",
                },
            });
        });
    }

    if (Array.isArray(medicationRequest) && medicationRequest.length > 0) {
        medicationRequest.forEach((medRecItem) => {
            jsonMedication.push({
                fullUrl: `urn:uuid:${medRecItem.medication_uuid}`,
                resource: {
                    resourceType: "MedicationRequest",
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription/${medRecItem.org_id}`,
                            // ,
                            value: medRecItem.identifier_value_1,
                        },
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription-item/${medRecItem.org_id}`,
                            value: medRecItem.identifier_value_2,
                        },
                    ],
                    status: "completed",
                    intent: "order",
                    category: [
                        {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
                                    code: "inpatient",
                                    display: "Inpatient",
                                },
                            ],
                        },
                    ],
                    // priority: "routine",
                    medicationReference: {
                        reference: `Medication/${medRecItem.medication_uuid}`,
                        display: medRecItem.medicationReference_display,
                    },
                    subject: {
                        reference: `Patient/${medRecItem.patient_id}`,
                        display: medRecItem.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${medRecItem.encounter}`,
                    },
                    authoredOn: medRecItem.authoredon,
                    requester: {
                        reference: `Practitioner/${medRecItem.practitioner_id}`,
                        display: medRecItem.practitioner_name,
                    },
                    // reasonReference: [
                    //     {
                    //         reference:
                    //             "Condition/{{Condition_DiagnosisPrimer}}",
                    //         display: "Chronic kidney disease, stage 5",
                    //     },
                    // ],
                    dosageInstruction: [
                        {
                            sequence: medRecItem.dosageInstruction_sequence,
                            // additionalInstruction: [
                            //     {
                            //         coding: [
                            //             {
                            //                 system: "http://snomed.info/sct",
                            //                 code: "311504000",
                            //                 display: "With or after food",
                            //             },
                            //         ],
                            //     },
                            // ],
                            // patientInstruction: "1 tablet per hari",
                            timing: {
                                repeat: {
                                    frequency:
                                        medRecItem.dosageInstruction_sequence_timing_repeat_frequency,
                                    period: medRecItem.dosageInstruction_sequence_timing_repeat_period,
                                    periodUnit:
                                        medRecItem.dosageInstruction_sequence_timing_repeat_periodUnit,
                                },
                            },
                            ...(medRecItem.dosageInstruction_route_coding_code && {
                                route: {
                                    coding: [
                                        {
                                            system: medRecItem.route_coding_system,
                                            code: medRecItem.dosageInstruction_route_coding_code,
                                            display:
                                                medRecItem.dosageInstruction_route_coding_display,
                                        },
                                    ],
                                },
                            }),
                            doseAndRate: [
                                {
                                    type: {
                                        coding: [
                                            {
                                                system: medRecItem.dosageInstruction_doseAndRate_type_coding_system,
                                                code: medRecItem.dosageInstruction_doseAndRate_type_coding_code,
                                                display:
                                                    medRecItem.dosageInstruction_doseAndRate_type_coding_system,
                                            },
                                        ],
                                    },
                                    doseQuantity: {
                                        // value: medRecItem.dosageInstruction_doseAndRate_doseQuantity_value,
                                        unit: medRecItem.dosageInstruction_doseAndRate_doseQuantity_unit,
                                        system: medRecItem.dosageInstruction_doseAndRate_doseQuantity_system,
                                        code: medRecItem.dosageInstruction_doseAndRate_doseQuantity_code,
                                    },
                                },
                            ],
                            ...(medRecItem.dosageInstruction_text && {
                                text: medRecItem.dosageInstruction_text,
                            }),
                        },
                    ],
                    dispenseRequest: {
                        ...(medRecItem.dispenseRequest_dispenseInterval_value && {
                            dispenseInterval: {
                                value: medRecItem.dispenseRequest_dispenseInterval_value,
                                unit: medRecItem.dispenseRequest_dispenseInterval_unit,
                                system: medRecItem.dispenseRequest_dispenseInterval_system,
                                code: medRecItem.dispenseRequest_dispenseInterval_code,
                            },
                        }),
                        ...(medRecItem.dispenseRequest_validityPeriod_start &&
                            medRecItem.dispenseRequest_validityPeriod_end && {
                                validityPeriod: {
                                    start: medRecItem.dispenseRequest_validityPeriod_start,
                                    end: medRecItem.dispenseRequest_validityPeriod_end,
                                },
                            }),
                        // numberOfRepeatsAllowed: 0,
                        ...(medRecItem.dispenseRequest_quantity_value && {
                            quantity: {
                                value: medRecItem.dispenseRequest_quantity_value,
                                unit: medRecItem.dispenseRequest_quantity_unit,
                                system: medRecItem.dispenseRequest_quantity_system,
                                code: medRecItem.dispenseRequest_quantity_code,
                            },
                        }),
                        ...(medRecItem.dispenseRequest_expectedSupplyDuration_value && {
                            expectedSupplyDuration: {
                                value: medRecItem.dispenseRequest_expectedSupplyDuration_value,
                                unit: medRecItem.dispenseRequest_expectedSupplyDuration_unit,
                                system: medRecItem.dispenseRequest_expectedSupplyDuration_system,
                                code: medRecItem.dispenseRequest_expectedSupplyDuration_code,
                            },
                        }),
                        performer: {
                            reference: `Organization/${medRecItem.org_id}`,
                        },
                    },
                },
                request: {
                    method: "POST",
                    url: "MedicationRequest",
                },
            });
        });
    }

    return jsonMedication;
}

// Masih menerka nerka apakah data obat termasuk DTD atau Non DTD. Resepdet_id dan resepdet_resep_id tidak digunakan

// dose quantity value masih kosong, medication request uuid tidak terdefinisi

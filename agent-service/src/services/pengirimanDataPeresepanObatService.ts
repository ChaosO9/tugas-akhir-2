import { dataPeresepanObat, KunjunganRawatInap } from "../utils/interface";
import { Dosage } from "../utils/interfaceFHIR"; // For typing helper objects
import { MedicationRequestDispenseRequest } from "../utils/interfaceValidation";

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
                        medicationItem.ingredient_racikan &&
                        medicationItem.ingredient_racikan.length > 0 && {
                            ingredient: medicationItem.ingredient_racikan
                                .map((ing_detail) => {
                                    const ingredientEntry: any = {};

                                    // itemCodeableConcept for the ingredient substance
                                    // Assuming ing_detail.ingredient_strength_kode (KFA code of substance) is primary identifier
                                    if (
                                        ing_detail.ingredient_strength_kode !=
                                        null
                                    ) {
                                        ingredientEntry.itemCodeableConcept = {
                                            coding: [
                                                {
                                                    system: "http://sys-ids.kemkes.go.id/kfa",
                                                    code: ing_detail.ingredient_strength_kode,
                                                    // display: ing_detail.ingredient_strength_display // If available from SQL
                                                },
                                            ],
                                        };
                                    }

                                    ingredientEntry.isActive = true;

                                    const strength: any = {};
                                    // Numerator for strength - unit information is not available in IngredientRacikan
                                    if (
                                        ing_detail.ingredient_strength_value !=
                                        null
                                    ) {
                                        strength.numerator = {
                                            value: ing_detail.ingredient_strength_value,
                                        };
                                    }

                                    // Denominator for strength - requires value AND unit code
                                    if (
                                        ing_detail.ingredient_denominator_value !=
                                            null &&
                                        ing_detail.ingredient_denominator_kode !=
                                            null
                                    ) {
                                        strength.denominator = {
                                            value: ing_detail.ingredient_denominator_value,
                                            code: ing_detail.ingredient_denominator_kode,
                                        };
                                        if (
                                            ing_detail.ingredient_denominator_system !=
                                            null
                                        ) {
                                            strength.denominator.system =
                                                ing_detail.ingredient_denominator_system;
                                        }
                                    }

                                    if (Object.keys(strength).length > 0) {
                                        ingredientEntry.strength = strength;
                                    }
                                    return ingredientEntry;
                                })
                                .filter(
                                    (entry) =>
                                        entry.itemCodeableConcept &&
                                        (entry.strength?.numerator ||
                                            entry.strength?.denominator),
                                ), // Ensure ingredient has item and some strength
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
            const dosageInstructionObject: Partial<Dosage> = {};
            if (medRecItem.dosageinstruction_sequence != null) {
                dosageInstructionObject.sequence =
                    medRecItem.dosageinstruction_sequence;
            }
            if (medRecItem.dosageinstruction_text != null) {
                dosageInstructionObject.text =
                    medRecItem.dosageinstruction_text;
            }

            const timingRepeat: any = {};
            if (
                medRecItem.dosageinstruction_sequence_timing_repeat_frequency !=
                null
            ) {
                timingRepeat.frequency =
                    medRecItem.dosageinstruction_sequence_timing_repeat_frequency;
            }
            if (
                medRecItem.dosageinstruction_sequence_timing_repeat_period !=
                null
            ) {
                timingRepeat.period =
                    medRecItem.dosageinstruction_sequence_timing_repeat_period;
            }
            if (
                medRecItem.dosageinstruction_sequence_timing_repeat_periodunit !=
                null
            ) {
                timingRepeat.periodUnit =
                    medRecItem.dosageinstruction_sequence_timing_repeat_periodunit;
            }
            if (Object.keys(timingRepeat).length > 0) {
                dosageInstructionObject.timing = { repeat: timingRepeat };
            }

            if (medRecItem.dosageinstruction_route_coding_code != null) {
                const routeCoding: any = {};
                if (medRecItem.route_coding_system != null)
                    routeCoding.system = medRecItem.route_coding_system;
                if (medRecItem.dosageinstruction_route_coding_code != null)
                    routeCoding.code =
                        medRecItem.dosageinstruction_route_coding_code;
                if (medRecItem.dosageinstruction_route_coding_display != null)
                    routeCoding.display =
                        medRecItem.dosageinstruction_route_coding_display;
                if (Object.keys(routeCoding).length > 0) {
                    dosageInstructionObject.route = { coding: [routeCoding] };
                }
            }

            const doseAndRateEntry: any = {};
            const typeCoding: any = {};
            if (
                medRecItem.dosageinstruction_doseandrate_type_coding_system !=
                null
            )
                typeCoding.system =
                    medRecItem.dosageinstruction_doseandrate_type_coding_system;
            if (
                medRecItem.dosageinstruction_doseandrate_type_coding_code !=
                null
            )
                typeCoding.code =
                    medRecItem.dosageinstruction_doseandrate_type_coding_code;
            if (
                medRecItem.dosageinstruction_doseandrate_type_coding_display !=
                null
            )
                typeCoding.display =
                    medRecItem.dosageinstruction_doseandrate_type_coding_display; // Corrected typo here
            if (Object.keys(typeCoding).length > 0) {
                doseAndRateEntry.type = { coding: [typeCoding] };
            }

            const doseQuantity: any = {};
            // if (medRecItem.dosageInstruction_doseAndRate_doseQuantity_value != null) doseQuantity.value = medRecItem.dosageInstruction_doseAndRate_doseQuantity_value; // Value was commented out
            if (
                medRecItem.dosageinstruction_doseandrate_dosequantity_unit !=
                null
            )
                doseQuantity.unit =
                    medRecItem.dosageinstruction_doseandrate_dosequantity_unit;
            if (
                medRecItem.dosageinstruction_doseandrate_dosequantity_system !=
                null
            )
                doseQuantity.system =
                    medRecItem.dosageinstruction_doseandrate_dosequantity_system;
            if (
                medRecItem.dosageinstruction_doseandrate_dosequantity_code !=
                null
            )
                doseQuantity.code =
                    medRecItem.dosageinstruction_doseandrate_dosequantity_code;
            if (Object.keys(doseQuantity).length > 0) {
                doseAndRateEntry.doseQuantity = doseQuantity;
            }

            if (Object.keys(doseAndRateEntry).length > 0) {
                dosageInstructionObject.doseAndRate = [doseAndRateEntry];
            }

            const dispenseRequestObject: Partial<MedicationRequestDispenseRequest> =
                {};
            let hasDispenseRequestData = false;

            const dispenseInterval: any = {};
            // Add dispenseInterval only if value AND unit code are present
            if (
                medRecItem.dispenserequest_dispenseinterval_value != null &&
                medRecItem.dispenserequest_dispenseinterval_code != null
            ) {
                dispenseInterval.value =
                    medRecItem.dispenserequest_dispenseinterval_value;
                dispenseInterval.code =
                    medRecItem.dispenserequest_dispenseinterval_code; // Unit code
                if (medRecItem.dispenserequest_dispenseinterval_unit != null) {
                    dispenseInterval.unit =
                        medRecItem.dispenserequest_dispenseinterval_unit; // Unit display name
                }
                if (
                    medRecItem.dispenserequest_dispenseinterval_system != null
                ) {
                    dispenseInterval.system =
                        medRecItem.dispenserequest_dispenseinterval_system; // Unit system
                }
                dispenseRequestObject.dispenseInterval = dispenseInterval;
                hasDispenseRequestData = true;
            }

            const validityPeriod: any = {};
            if (medRecItem.dispenserequest_validityperiod_start != null)
                validityPeriod.start =
                    medRecItem.dispenserequest_validityperiod_start;
            if (medRecItem.dispenserequest_validityperiod_end != null)
                validityPeriod.end =
                    medRecItem.dispenserequest_validityperiod_end;
            if (validityPeriod.start && validityPeriod.end) {
                // Period is only valid if both start and end are present
                dispenseRequestObject.validityPeriod = validityPeriod;
                hasDispenseRequestData = true;
            }

            const quantity: any = {};
            // Add quantity only if value AND unit code are present
            if (
                medRecItem.dispenserequest_quantity_value != null &&
                medRecItem.dispenserequest_quantity_code != null
            ) {
                quantity.value = medRecItem.dispenserequest_quantity_value;
                quantity.code = medRecItem.dispenserequest_quantity_code; // Unit code
                if (medRecItem.dispenserequest_quantity_unit != null) {
                    quantity.unit = medRecItem.dispenserequest_quantity_unit; // Unit display name
                }
                if (medRecItem.dispenserequest_quantity_system != null) {
                    quantity.system =
                        medRecItem.dispenserequest_quantity_system; // Unit system
                }
                dispenseRequestObject.quantity = quantity;
                hasDispenseRequestData = true;
            }

            const expectedSupplyDuration: any = {};
            // Add expectedSupplyDuration only if value AND unit code are present
            if (
                medRecItem.dispenserequest_expectedsupplyduration_value !=
                    null &&
                medRecItem.dispenserequest_expectedsupplyduration_code != null
            ) {
                expectedSupplyDuration.value =
                    medRecItem.dispenserequest_expectedsupplyduration_value;
                expectedSupplyDuration.code =
                    medRecItem.dispenserequest_expectedsupplyduration_code; // Unit code
                if (
                    medRecItem.dispenserequest_expectedsupplyduration_unit !=
                    null
                ) {
                    expectedSupplyDuration.unit =
                        medRecItem.dispenserequest_expectedsupplyduration_unit; // Unit display name
                }
                if (
                    medRecItem.dispenserequest_expectedsupplyduration_system !=
                    null
                ) {
                    expectedSupplyDuration.system =
                        medRecItem.dispenserequest_expectedsupplyduration_system; // Unit system
                }
                dispenseRequestObject.expectedSupplyDuration =
                    expectedSupplyDuration;
                hasDispenseRequestData = true;
            }

            jsonMedication.push({
                fullUrl: `urn:uuid:${medRecItem.medicationrequest_uuid}`,
                resource: {
                    resourceType: "MedicationRequest",
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription/${medRecItem.org_id}`,
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
                    ...((medRecItem.medicationrequest_uuid ||
                        medRecItem.medicationreference_display) && {
                        medicationReference: {
                            ...(medRecItem.medicationrequest_uuid && {
                                reference: `Medication/${medRecItem.medicationrequest_uuid}`,
                            }),
                            ...(medRecItem.medicationreference_display && {
                                display: medRecItem.medicationreference_display,
                            }),
                        },
                    }),
                    subject: {
                        reference: `Patient/${medRecItem.patient_id}`,
                        display: medRecItem.patient_name,
                    },
                    ...(medRecItem.encounter && {
                        encounter: {
                            reference: `Encounter/${medRecItem.encounter}`,
                        },
                    }),
                    ...(medRecItem.authoredon && {
                        authoredOn: medRecItem.authoredon,
                    }),
                    ...((medRecItem.practitioner_id ||
                        medRecItem.practitioner_name) && {
                        requester: {
                            ...(medRecItem.practitioner_id && {
                                reference: `Practitioner/${medRecItem.practitioner_id}`,
                            }),
                            ...(medRecItem.practitioner_name && {
                                display: medRecItem.practitioner_name,
                            }),
                        },
                    }),
                    ...(medRecItem.org_id && {
                        performer: [
                            { reference: `Organization/${medRecItem.org_id}` },
                        ],
                    }),
                    ...(Object.keys(dosageInstructionObject).length > 0 && {
                        dosageInstruction: [dosageInstructionObject],
                    }),
                    ...(hasDispenseRequestData && {
                        dispenseRequest: dispenseRequestObject,
                    }),
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

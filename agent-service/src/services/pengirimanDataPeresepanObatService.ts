import { dataPeresepanObat, KunjunganRawatInap } from "../utils/interface";
import { Dosage } from "../utils/interfaceFHIR"; // For typing helper objects
import {
    MedicationRequestDispenseRequest,
    MedicationResource,
    resourceTemplate,
} from "../utils/interfaceValidation";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPeresepanObat(
    dataMasterPasien: KunjunganRawatInap,
    dataPeresepanObat: dataPeresepanObat,
): Promise<object[]> {
    let jsonBundleEntries: resourceTemplate[] = [];

    const medication = dataPeresepanObat.medication;
    const medicationRequest = dataPeresepanObat.medicationRequest;

    if (Array.isArray(medicationRequest) && medicationRequest.length > 0) {
        medicationRequest.forEach((medRecItem) => {
            // Find the corresponding Medication data to be contained
            const medicationItem = medication.find(
                (m) => m.medication_uuid === medRecItem.medicationrequest_uuid,
            );

            let containedMedicationResource: MedicationResource | undefined =
                undefined;
            let medicationRefDisplay = medRecItem.medicationreference_display; // Fallback display
            let medicationRefReference = medRecItem.medicationrequest_uuid
                ? `Medication/${medRecItem.medicationrequest_uuid}`
                : undefined; // Fallback reference

            if (medicationItem) {
                const racikan =
                    medicationItem.ingredient_racikan === null
                        ? null
                        : medicationItem.ingredient_racikan;

                let extensionType: {
                    code: string | null;
                    display: string | null;
                } = {
                    code: null,
                    display: null,
                };

                if (medicationItem.racikan === "y") {
                    extensionType.code = "NC";
                    extensionType.display = "Non-compound";
                } else if (medicationItem.racikan === "t") {
                    // Assuming 't' is for non-racikan/single component
                    extensionType.code = "SD";
                    extensionType.display = "Gives of such doses";
                }

                containedMedicationResource = {
                    resourceType: "Medication",
                    id: medicationItem.medication_uuid!, // Crucial for local reference
                    meta: {
                        profile: [
                            "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication",
                        ],
                    },
                    ...(extensionType.code !== null && {
                        extension: [
                            {
                                url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                                valueCodeableConcept: {
                                    coding: [
                                        {
                                            system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                            ...(extensionType.code !== null && {
                                                code: extensionType.code,
                                            }),
                                            ...(extensionType.display !==
                                                null && {
                                                display: extensionType.display,
                                            }),
                                        },
                                    ],
                                },
                            },
                        ],
                    }),
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/medication/${dataMasterPasien.org_id}`,
                            value:
                                medicationItem.identifier_value ||
                                "UNKNOWN_MED_ID",
                        },
                    ],
                    ...(medicationItem.racikan === "t" &&
                        medicationItem.code_coding_code && {
                            code: {
                                coding: [
                                    {
                                        system: "http://sys-ids.kemkes.go.id/kfa",
                                        code: medicationItem.code_coding_code,
                                        display:
                                            medicationItem.code_coding_display,
                                    },
                                ],
                            },
                        }),
                    status: "active",
                    ...(medicationItem.form_coding_code !== null && {
                        form: {
                            coding: [
                                {
                                    ...(medicationItem.form_coding_system !==
                                        null && {
                                        system: medicationItem.form_coding_system,
                                    }),
                                    code: medicationItem.form_coding_code,
                                    ...(medicationItem.form_coding_display !==
                                        null && {
                                        display:
                                            medicationItem.form_coding_display,
                                    }),
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
                                    if (
                                        ing_detail.ingredient_strength_kode !=
                                        null
                                    ) {
                                        ingredientEntry.itemCodeableConcept = {
                                            coding: [
                                                {
                                                    system: "http://sys-ids.kemkes.go.id/kfa",
                                                    code: ing_detail.ingredient_strength_kode,
                                                },
                                            ],
                                        };
                                    }
                                    ingredientEntry.isActive = true;
                                    const strength: any = {};
                                    if (
                                        ing_detail.ingredient_strength_value !=
                                        null
                                    ) {
                                        strength.numerator = {
                                            value: ing_detail.ingredient_strength_value,
                                        };
                                    }
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
                                ),
                        }),
                };

                if (containedMedicationResource.code?.coding?.[0]?.display) {
                    medicationRefDisplay =
                        containedMedicationResource.code.coding[0].display;
                }
                medicationRefReference = `#${containedMedicationResource.id}`;
            }

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

            const medicationRequestEntry: resourceTemplate = {
                // fullUrl: `urn:uuid:${medRecItem.medicationrequest_uuid}`,
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    resourceType: "MedicationRequest",
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription/${dataMasterPasien.org_id}`,
                            value: medRecItem.identifier_value_1,
                        },
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription-item/${dataMasterPasien.org_id}`,
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
                    ...(medicationRefReference && {
                        medicationReference: {
                            reference: medicationRefReference,
                            ...(medicationRefDisplay && {
                                display: medicationRefDisplay,
                            }),
                        },
                    }),
                    subject: {
                        reference: `Patient/${medRecItem.patient_id}`,
                        display: medRecItem.patient_name,
                    },
                    ...(medRecItem.encounter && {
                        encounter: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
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
                        performer: {
                            reference: `Organization/${medRecItem.org_id}`,
                        },
                    }),
                    ...(Object.keys(dosageInstructionObject).length > 0 && {
                        dosageInstruction: [dosageInstructionObject],
                    }),
                    ...(hasDispenseRequestData && {
                        dispenseRequest: dispenseRequestObject,
                    }),
                    ...(containedMedicationResource && {
                        contained: [containedMedicationResource],
                    }),
                },
                request: {
                    method: "POST",
                    url: "MedicationRequest",
                },
            };
            jsonBundleEntries.push(medicationRequestEntry);
        });
    }

    if (dataMasterPasien.processed_resource) {
        dataMasterPasien.processed_resource.peresepanObat = jsonBundleEntries;
    }
    return jsonBundleEntries;
}

// Masih menerka nerka apakah data obat termasuk DTD atau Non DTD. Resepdet_id dan resepdet_resep_id tidak digunakan

// dose quantity value masih kosong, medication request uuid tidak terdefinisi

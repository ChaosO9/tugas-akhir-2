import { v4 } from "uuid";
import { dataPengeluaranObat, KunjunganRawatInap } from "../utils/interface";
import {
    MedicationResource,
    MedicationRequestResource,
    resourceTemplate,
} from "../utils/interfaceValidation";

export default async function pengirimanDataPengeluaranObat(
    dataMasterPasien: KunjunganRawatInap,
    dataPengeluaranObat: dataPengeluaranObat,
    LocationName: string,
): Promise<object[]> {
    let jsonMedicationDispense = [] as object[];
    const medication = dataPengeluaranObat.medication;
    const medicationDispense = dataPengeluaranObat.medicationDispense;

    if (Array.isArray(medicationDispense) && medicationDispense.length > 0) {
        medicationDispense.forEach((medDisItem) => {
            // Find the corresponding Medication data
            const medicationDataItem = medication.find(
                (m) => m.medication_uuid === medDisItem.medicationrequest_uuid, // Assuming medicationrequest_uuid in medDisItem links to medication_uuid
            );

            let containedMedicationResource: MedicationResource | undefined =
                undefined;
            let medicationReferenceDisplay =
                medDisItem.medicationreference_display; // Default display

            if (medicationDataItem) {
                const racikan =
                    medicationDataItem.ingredient_racikan === null
                        ? null
                        : medicationDataItem.ingredient_racikan;

                let extensionType: {
                    code: string | null;
                    display: string | null;
                } = {
                    code: null,
                    display: null,
                };

                if (medicationDataItem.racikan === "y") {
                    extensionType.code = "NC";
                    extensionType.display = "Non-compound";
                } else if (medicationDataItem.racikan === "t") {
                    extensionType.code = "SD";
                    extensionType.display = "Gives of such doses";
                }

                // Construct the Medication resource to be contained
                containedMedicationResource = {
                    resourceType: "Medication",
                    id: medicationDataItem.medication_uuid || v4(), // Use existing UUID or generate new for local reference
                    meta: {
                        profile: [
                            "https://fhir.kemkes.go.id/r4/StructureDefinition/Medication",
                        ],
                    },
                    ...(extensionType.code && {
                        extension: [
                            {
                                url: "https://fhir.kemkes.go.id/r4/StructureDefinition/MedicationType",
                                valueCodeableConcept: {
                                    coding: [
                                        {
                                            system: "http://terminology.kemkes.go.id/CodeSystem/medication-type",
                                            code: extensionType.code,
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
                                medicationDataItem.identifier_value ||
                                "UNKNOWN_MED_ID", // Fallback if identifier_value is missing
                        },
                    ],
                    ...(medicationDataItem.racikan === "t" &&
                        medicationDataItem.code_coding_code && {
                            code: {
                                coding: [
                                    {
                                        system: "http://sys-ids.kemkes.go.id/kfa",
                                        code: medicationDataItem.code_coding_code,
                                        display:
                                            medicationDataItem.code_coding_display,
                                    },
                                ],
                            },
                        }),
                    status: "active", // Default status
                    // manufacturer: { reference: `Organization/${dataMasterPasien.org_id}` }, // Example, adjust if needed
                    ...(medicationDataItem.form_coding_code && {
                        form: {
                            coding: [
                                {
                                    ...(medicationDataItem.form_coding_system !==
                                        null && {
                                        system: medicationDataItem.form_coding_system,
                                    }),
                                    code: medicationDataItem.form_coding_code,
                                    ...(medicationDataItem.form_coding_display !==
                                        null && {
                                        display:
                                            medicationDataItem.form_coding_display,
                                    }),
                                },
                            ],
                        },
                    }),
                    ...((medicationDataItem.racikan === "y" ||
                        medicationDataItem.ingredient_racikan) &&
                        medicationDataItem.ingredient_racikan && {
                            ingredient: medicationDataItem.ingredient_racikan
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
                // Update display for medicationReference if code.coding[0].display is available
                if (containedMedicationResource?.code?.coding?.[0]?.display) {
                    medicationReferenceDisplay =
                        containedMedicationResource.code.coding[0].display;
                }
            }

            const authorizingPrescriptionRef = medDisItem.medicationrequest_uuid
                ? `MedicationRequest/${medDisItem.medicationrequest_uuid}`
                : null;

            const medicationDispenseUuid = v4();
            jsonMedicationDispense.push({
                fullUrl: `urn:uuid:${medicationDispenseUuid}`,
                resource: {
                    resourceType: "MedicationDispense",
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription/${medDisItem.org_id}`,
                            value: medDisItem.identifier_value_1,
                        },
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/prescription-item/${medDisItem.org_id}`,
                            value: medDisItem.identifier_value_2,
                        },
                    ],
                    status: "completed",
                    category: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/fhir/CodeSystem/medicationdispense-category",
                                code: "inpatient",
                                display: "Inpatient",
                            },
                        ],
                    },
                    medicationReference: {
                        // Point to the contained resource if it exists
                        reference: containedMedicationResource
                            ? `#${containedMedicationResource.id}`
                            : `#${medDisItem.medicationrequest_uuid}`, // Fallback to external reference
                        display: medicationReferenceDisplay,
                    },
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    context: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                    },
                    performer: [
                        {
                            actor: {
                                reference: `Practitioner/${medDisItem.practitioner_id}`,
                                display: medDisItem.practitioner_name,
                            },
                        },
                    ],
                    location: {
                        reference: `Location/${dataMasterPasien.location_poli_id}`,
                        display: LocationName,
                    },
                    // authorizingPrescription: [
                    //     {
                    //         reference:
                    //             "MedicationRequest/{{MedicationRequest_FurosemideDay1}}",
                    //     },
                    // ],
                    quantity: {
                        value: 1,
                        system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
                        code: "TAB",
                    },
                    daysSupply: {
                        value: 1,
                        unit: "Day",
                        system: "http://unitsofmeasure.org",
                        code: "d",
                    },
                    whenPrepared: "2022-12-25T14:00:00+00:00",
                    whenHandedOver: "2022-12-25T14:30:00+00:00",
                    dosageInstruction: [
                        {
                            sequence: medDisItem.dosageinstruction_sequence,
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
                            ...(medDisItem.dosageinstruction_sequence_timing_repeat_frequency && {
                                timing: {
                                    repeat: {
                                        frequency:
                                            medDisItem.dosageinstruction_sequence_timing_repeat_frequency,
                                        period: medDisItem.dosageinstruction_sequence_timing_repeat_period,
                                        periodUnit:
                                            medDisItem.dosageinstruction_sequence_timing_repeat_periodunit,
                                    },
                                },
                            }),
                            ...(medDisItem.dosageinstruction_route_coding_code && {
                                route: {
                                    coding: [
                                        {
                                            system: medDisItem.route_coding_system,
                                            code: medDisItem.dosageinstruction_route_coding_code,
                                            display:
                                                medDisItem.dosageinstruction_route_coding_display,
                                        },
                                    ],
                                },
                            }),
                            ...(() => {
                                const drArray = [];
                                const drEntry: any = {};

                                // Build 'type' for drEntry
                                const typeCoding: any = {};
                                if (
                                    medDisItem.dosageinstruction_doseandrate_type_coding_code
                                ) {
                                    if (
                                        medDisItem.dosageinstruction_doseandrate_type_coding_system &&
                                        medDisItem.dosageinstruction_doseandrate_type_coding_system.trim() !==
                                            ""
                                    ) {
                                        typeCoding.system =
                                            medDisItem.dosageinstruction_doseandrate_type_coding_system;
                                    }
                                    typeCoding.code =
                                        medDisItem.dosageinstruction_doseandrate_type_coding_code;
                                    if (
                                        medDisItem.dosageinstruction_doseandrate_type_coding_display
                                    ) {
                                        typeCoding.display =
                                            medDisItem.dosageinstruction_doseandrate_type_coding_display;
                                    }
                                    // Add type only if code is present
                                    if (typeCoding.code) {
                                        drEntry.type = { coding: [typeCoding] };
                                    }
                                }

                                // Build 'doseQuantity' for drEntry
                                const dq: any = {};
                                // value is currently commented out in the interface/source data
                                // if (medDisItem.dosageInstruction_doseQuantity_value) { dq.value = medDisItem.dosageInstruction_doseQuantity_value; }
                                if (
                                    medDisItem.dosageinstruction_doseandrate_dosequantity_unit
                                ) {
                                    dq.unit =
                                        medDisItem.dosageinstruction_doseandrate_dosequantity_unit;
                                }
                                if (
                                    medDisItem.dosageinstruction_doseandrate_dosequantity_system &&
                                    medDisItem.dosageinstruction_doseandrate_dosequantity_system.trim() !==
                                        ""
                                ) {
                                    dq.system =
                                        medDisItem.dosageinstruction_doseandrate_dosequantity_system;
                                }
                                if (
                                    medDisItem.dosageinstruction_doseandrate_dosequantity_code
                                ) {
                                    dq.code =
                                        medDisItem.dosageinstruction_doseandrate_dosequantity_code;
                                }
                                if (Object.keys(dq).length > 0) {
                                    drEntry.doseQuantity = dq;
                                }

                                if (Object.keys(drEntry).length > 0) {
                                    drArray.push(drEntry);
                                }
                                return drArray.length > 0
                                    ? { doseAndRate: drArray }
                                    : {};
                            })(),
                            text: medDisItem.dosageinstruction_text,
                        },
                    ],
                    // dispenseRequest: {
                    //     ...(medDisItem.dispenserequest_dispenseinterval_value && {
                    //         dispenseInterval: {
                    //             value: medDisItem.dispenserequest_dispenseinterval_value,
                    //             unit: medDisItem.dispenserequest_dispenseinterval_unit,
                    //             system: medDisItem.dispenserequest_dispenseinterval_system,
                    //             code: medDisItem.dispenserequest_dispenseinterval_code,
                    //         },
                    //     }),
                    //     ...(medDisItem.dispenserequest_quantity_unit && {
                    //         quantity: {
                    //             value: medDisItem.dispenserequest_quantity_value,
                    //             unit: medDisItem.dispenserequest_quantity_unit,
                    //             system: medDisItem.dispenserequest_quantity_system,
                    //             code: medDisItem.dispenserequest_quantity_code,
                    //         },
                    //     }),
                    //     expectedSupplyDuration: {
                    //         value: medDisItem.dispenserequest_expectedsupplyduration_value,
                    //         unit: medDisItem.dispenserequest_expectedsupplyduration_unit,
                    //         system: medDisItem.dispenserequest_expectedsupplyduration_system,
                    //         code: medDisItem.dispenserequest_expectedsupplyduration_code,
                    //     },
                    //     ...(medDisItem.dispenserequest_validityperiod_start &&
                    //         medDisItem.dispenserequest_validityperiod_end && {
                    //             validityPeriod: {
                    //                 start: medDisItem.dispenserequest_validityperiod_start,
                    //                 end: medDisItem.dispenserequest_validityperiod_end,
                    //             },
                    //         }),
                    // }, // Add authorizingPrescription if a reference was found
                    ...(authorizingPrescriptionRef && {
                        authorizingPrescription: [
                            { reference: authorizingPrescriptionRef },
                        ],
                    }), // Add the contained Medication resource if it was constructed
                    ...(containedMedicationResource && {
                        contained: [containedMedicationResource],
                    }),
                },
                request: {
                    method: "POST",
                    url: "MedicationDispense",
                },
            });
        });
    }

    return jsonMedicationDispense;
}

//Harusnya data pengeluaran obat hanya mereferensikan data medication yang sudah ada, bukan membuat data baru

// UUID medication dispense belum ada, doseQuantity belum ada valuenya

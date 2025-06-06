import { v4 } from "uuid";
import { dataPengeluaranObat, KunjunganRawatInap } from "../utils/interface";

export default async function pengirimanDataPengeluaranObat(
    dataMasterPasien: KunjunganRawatInap,
    dataPengeluaranObat: dataPengeluaranObat,
    LocationName: string,
): Promise<object[]> {
    let jsonMedicationDispense = [] as object[];

    const medication = dataPengeluaranObat.medication;
    const medicationDispense = dataPengeluaranObat.medicationDispense;

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

            jsonMedicationDispense.push({
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
                    ...((medicationItem.racikan === "y" ||
                        medicationItem.ingredient_racikan) && {
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

    if (Array.isArray(medicationDispense) && medicationDispense.length > 0) {
        medicationDispense.forEach((medDisItem) => {
            jsonMedicationDispense.push({
                fullUrl: `urn:uuid:${v4()}`,
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
                        reference: `Medication/${medDisItem.medicationrequest_uuid}`,
                        display: medDisItem.medicationreference_display,
                    },
                    subject: {
                        reference: `Patient/${medDisItem.patient_id}`,
                        display: medDisItem.patient_name,
                    },
                    context: {
                        reference: `Encounter/${medDisItem.encounter}`,
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
                            doseAndRate: [
                                {
                                    ...(medDisItem.dosageinstruction_doseandrate_type_coding_code && {
                                        type: {
                                            coding: [
                                                {
                                                    system: medDisItem.dosageinstruction_doseandrate_type_coding_system,
                                                    code: medDisItem.dosageinstruction_doseandrate_type_coding_code,
                                                    display:
                                                        medDisItem.dosageinstruction_doseandrate_type_coding_display,
                                                },
                                            ],
                                        },
                                    }),
                                    doseQuantity: {
                                        // value: medDisItem.dosageInstruction_doseQuantity_value,
                                        unit: medDisItem.dosageinstruction_doseandrate_dosequantity_unit,
                                        system: medDisItem.dosageinstruction_doseandrate_dosequantity_system,
                                        code: medDisItem.dosageinstruction_doseandrate_dosequantity_code,
                                    },
                                },
                            ],
                            text: medDisItem.dosageinstruction_text,
                        },
                    ],
                    dispenseRequest: {
                        ...(medDisItem.dispenserequest_dispenseinterval_value && {
                            dispenseInterval: {
                                value: medDisItem.dispenserequest_dispenseinterval_value,
                                unit: medDisItem.dispenserequest_dispenseinterval_unit,
                                system: medDisItem.dispenserequest_dispenseinterval_system,
                                code: medDisItem.dispenserequest_dispenseinterval_code,
                            },
                        }),
                        ...(medDisItem.dispenserequest_quantity_unit && {
                            quantity: {
                                value: medDisItem.dispenserequest_quantity_value,
                                unit: medDisItem.dispenserequest_quantity_unit,
                                system: medDisItem.dispenserequest_quantity_system,
                                code: medDisItem.dispenserequest_quantity_code,
                            },
                        }),
                        expectedSupplyDuration: {
                            value: medDisItem.dispenserequest_expectedsupplyduration_value,
                            unit: medDisItem.dispenserequest_expectedsupplyduration_unit,
                            system: medDisItem.dispenserequest_expectedsupplyduration_system,
                            code: medDisItem.dispenserequest_expectedsupplyduration_code,
                        },
                        ...(medDisItem.dispenserequest_validityperiod_start &&
                            medDisItem.dispenserequest_validityperiod_end && {
                                validityPeriod: {
                                    start: medDisItem.dispenserequest_validityperiod_start,
                                    end: medDisItem.dispenserequest_validityperiod_end,
                                },
                            }),
                    },
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

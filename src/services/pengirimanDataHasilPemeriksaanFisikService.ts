import { classifyBloodPressure, splitBloodPressure } from "../utils/functions";
import {
    dataHasilPemeriksaanFisik,
    KunjunganRawatInap,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataHasilPemeriksaanFisikService(
    dataMasterPasien: KunjunganRawatInap,
    dataHasilPemeriksaanFisik: dataHasilPemeriksaanFisik[],
): Promise<object[]> {
    let jsonPhysicsExamination = [] as object[];

    if (
        Array.isArray(dataHasilPemeriksaanFisik) &&
        dataHasilPemeriksaanFisik.length > 0
    ) {
        dataHasilPemeriksaanFisik.forEach((hasilPemeriksaanItem) => {
            const createObservation = (
                code: string,
                display: string,
                value: number | null,
                unit: string | null,
                system: string | null,
                codeUnit: string | null,
                interpretationCode: string | null,
                interpretationDisplay: string | null,
                bodySiteCode: string | null,
                bodySiteDisplay: string | null,
            ) => {
                if (value === null) return null;

                const observationUuid = uuidv4();
                return {
                    fullUrl: `urn:uuid:${observationUuid}`,
                    resource: {
                        resourceType: "Observation",
                        status: "final",
                        category: [
                            {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/observation-category",
                                        code: "vital-signs",
                                        display: "Vital Signs",
                                    },
                                ],
                            },
                        ],
                        code: {
                            coding: [
                                {
                                    system: "http://loinc.org",
                                    code: code,
                                    display: display,
                                },
                            ],
                        },
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                        },
                        encounter: {
                            reference: `Encounter/${hasilPemeriksaanItem.encounter}`,
                            display: `${display} ${dataMasterPasien.patient_name} di hari ${new Date(hasilPemeriksaanItem.periksa_created_date).toLocaleString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`,
                        },
                        effectiveDateTime:
                            hasilPemeriksaanItem.periksa_created_date.toISOString(),
                        issued: hasilPemeriksaanItem.periksa_created_date.toISOString(),
                        performer: [
                            {
                                reference: `Practitioner/${hasilPemeriksaanItem.practitioner_id}`,
                            },
                        ],
                        valueQuantity: {
                            value: value,
                            unit: unit,
                            system: system,
                            code: codeUnit,
                        },
                        ...(interpretationCode && {
                            interpretation: [
                                {
                                    coding: [
                                        {
                                            system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
                                            code: interpretationCode,
                                            display: interpretationDisplay,
                                        },
                                    ],
                                    // Add text based on logic or values
                                },
                            ],
                        }),

                        ...(bodySiteCode && {
                            bodySite: {
                                coding: [
                                    {
                                        system: "http://snomed.info/sct",
                                        code: bodySiteCode,
                                        display: bodySiteDisplay,
                                    },
                                ],
                            },
                        }),
                    },
                    request: {
                        method: "POST",
                        url: "Observation",
                    },
                };
            };

            const bloodPressure =
                hasilPemeriksaanItem.systolic_blood_pressure_value;
            const { systolic, diastolic } = splitBloodPressure(bloodPressure);
            const systolicClassification = classifyBloodPressure(
                systolic,
                "systolic",
            );
            const diastolicClassification = classifyBloodPressure(
                diastolic,
                "diastolic",
            );

            const jsonSistolic = createObservation(
                "8480-6",
                "Systolic blood pressure",
                Number(systolic?.toFixed(2)) || null,
                "mm[Hg]",
                "http://unitsofmeasure.org",
                "mm[Hg]",
                systolicClassification.code,
                systolicClassification.display,
                null, // Example body site - needs logic
                null, // Example body site
            );

            const jsonDiastolic = createObservation(
                "8462-4",
                "Diastolic blood pressure",
                Number(diastolic?.toFixed(2)) || null,
                "mm[Hg]",
                "http://unitsofmeasure.org",
                "mm[Hg]",
                diastolicClassification.code,
                diastolicClassification.display,
                null, // Example body site - needs logic
                null, // Example body site
            );

            const jsonBodyTemp = createObservation(
                "8310-5",
                "Body temperature",
                hasilPemeriksaanItem.body_temperature_value,
                "C",
                "http://unitsofmeasure.org",
                "Cel",
                null, // Example - replace with logic
                null,
                null,
                null,
            );

            const jsonHeartRate = createObservation(
                "8867-4",
                "Heart rate",
                hasilPemeriksaanItem.heart_rate_value,
                "beats/minute",
                "http://unitsofmeasure.org",
                "/min",
                null,
                null,
                null,
                null,
            );

            const jsonRespiratoryRate = createObservation(
                "9279-1",
                "Respiratory rate",
                hasilPemeriksaanItem.respiratory_rate_value,
                "breaths/minute",
                "http://unitsofmeasure.org",
                "/min",
                null,
                null,
                null,
                null,
            );

            [
                jsonSistolic,
                jsonDiastolic,
                jsonBodyTemp,
                jsonHeartRate,
                jsonRespiratoryRate,
            ].forEach((observation) => {
                if (observation) {
                    jsonPhysicsExamination.push(observation);
                }
            });
        });
    }

    return jsonPhysicsExamination;
}

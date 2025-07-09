import AppError from "../utils/errorHandler";
import {
    ConditionRow,
    dataAnamnesis,
    KunjunganRawatInap,
} from "../utils/interface";

export default async function pengirimanDataDiagnosisService(
    dataMasterPasien: KunjunganRawatInap,
    dataDiagnosis: ConditionRow[],
): Promise<object[] | AppError> {
    const conditions = dataDiagnosis;

    let jsonCondition = [] as object[];
    if (Array.isArray(conditions) && conditions.length > 0) {
        conditions.forEach((conditionItem) => {
            conditionItem.condition.forEach((conditionObj) => {
                jsonCondition.push({
                    fullUrl: `urn:uuid:${conditionObj.condition_uuid}`,
                    resource: {
                        resourceType: "Condition",
                        clinicalStatus: {
                            coding: [
                                {
                                    system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
                                    code: "active",
                                    display: "Active",
                                },
                            ],
                        },
                        category: [
                            {
                                coding: [
                                    {
                                        system: "http://terminology.hl7.org/CodeSystem/condition-category",
                                        code: "encounter-diagnosis",
                                        display: "Encounter Diagnosis",
                                    },
                                ],
                            },
                        ],
                        code: {
                            coding: [
                                {
                                    system: "http://hl7.org/fhir/sid/icd-10",
                                    code: conditionObj.condition_kode,
                                    display: conditionObj.condition_nama,
                                },
                            ],
                        },
                        subject: {
                            reference: `Patient/${conditionItem.patient_id}`,
                            display: conditionItem.patient_name,
                        },
                        encounter: {
                            // reference: `Encounter/${conditionItem.pendaftaran_uuid}`,
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                            display: `Kunjungan ${conditionItem.patient_name} di tanggal ${dataMasterPasien.arrived}`,
                        },
                        onsetDateTime: new Date().toISOString(),
                        recordedDate: new Date().toISOString(),
                        recorder: {
                            reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                            display: `${dataMasterPasien.practitioner_name}`,
                        },
                        // note: [
                        //     {
                        //         text: "Wajah membengkak sejak sehari yang lalu",
                        //     },
                        // ],
                    },
                    request: {
                        method: "POST",
                        url: "Condition",
                    },
                });
            });
        });
    }

    return jsonCondition;
}

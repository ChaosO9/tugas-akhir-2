import AppError from "../utils/errorHandler";
import { dataAnamnesis, KunjunganRawatInap } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

const AllergyCategory = {
    obat: "medication",
    makanan: "food",
    lingkungan: "environment",
    biologis: "biologic",
};

export default async function pengirimanDataAnamnesisService(
    dataMasterPasien: KunjunganRawatInap,
    dataAnamnesis: dataAnamnesis,
): Promise<dataAnamnesis[] | AppError> {
    const conditions = dataAnamnesis.condition;
    const allergyIntolerance = dataAnamnesis.allergyIntolerance;

    let jsonCondition = [] as object[];
    if (Array.isArray(conditions) && conditions.length > 0) {
        conditions.forEach((conditionItem) => {
            conditionItem.condition.forEach((conditionObj) => {
                if (conditionObj.condition_kode !== "-") {
                    jsonCondition.push({
                        // fullUrl: `urn:uuid:${conditionObj.condition_uuid}`,
                        fullUrl: `urn:uuid:${uuidv4()}`,
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
                                            system: "http://terminology.kemkes.go.id",
                                            code: "chief-complaint",
                                            display: "Chief Complaint",
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
                }
            });
        });
    }

    let jsonAllergyIntolerance = [] as object[];
    if (Array.isArray(allergyIntolerance) && allergyIntolerance.length > 0) {
        allergyIntolerance.forEach((allergyItem) => {
            jsonAllergyIntolerance.push({
                fullUrl: `urn:uuid:${allergyItem.alergi_uuid}`,
                resource: {
                    resourceType: "AllergyIntolerance",
                    identifier: [
                        {
                            use: "official",
                            system: `http://sys-ids.kemkes.go.id/allergy/${allergyItem.org_id}`,
                            value: allergyItem.pasien_id,
                        },
                    ],
                    clinicalStatus: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                                code: allergyItem.clinical_status_code,
                                display: allergyItem.clinicalstatus_display,
                            },
                        ],
                    },
                    verificationStatus: {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
                                code: allergyItem.verifikasi_status_code,
                                display: allergyItem.verificationstatus_display,
                            },
                        ],
                    },
                    category: [
                        AllergyCategory[
                            allergyItem.category.toLowerCase() as keyof typeof AllergyCategory
                        ],
                    ],
                    code: {
                        coding: [
                            {
                                system: allergyItem.alergi_snomedct_system,
                                code: allergyItem.alergi_snomedct_code,
                                display: allergyItem.alergi_nama,
                            },
                        ],
                        text: allergyItem.alergi_catatan,
                    },
                    patient: {
                        reference: `Patient/${allergyItem.pasien_id}`,
                        display: allergyItem.pasien_nama,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display: `Kunjungan ${dataMasterPasien.patient_name} di hari ${dataMasterPasien.arrived}`,
                    },
                    recordedDate: allergyItem.alergi_created_date,
                    recorder: {
                        reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display: `${dataMasterPasien.practitioner_name}`,
                    },
                },
                request: {
                    method: "POST",
                    url: "AllergyIntolerance",
                },
            });
        });
    }
    const jsonAnamnesis = [...jsonCondition, ...jsonAllergyIntolerance];
    return jsonAnamnesis as dataAnamnesis[];
}

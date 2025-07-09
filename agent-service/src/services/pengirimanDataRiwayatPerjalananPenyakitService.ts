import {
    dataHasilPemeriksaanFisik,
    dataRiwayatPerjalananPenyakit,
    KunjunganRawatInap,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataRiwayatPerjalananPenyakitService(
    dataMasterPasien: KunjunganRawatInap,
    dataRiwayatPerjalananPenyakit: dataRiwayatPerjalananPenyakit[],
): Promise<object[]> {
    let jsonClinicalImpression = [] as object[];

    if (
        Array.isArray(dataRiwayatPerjalananPenyakit) &&
        dataRiwayatPerjalananPenyakit.length > 0
    ) {
        dataRiwayatPerjalananPenyakit.forEach(
            (riwayatPerjalananPenyakitItem) => {
                jsonClinicalImpression.push({
                    fullUrl: `urn:uuid:${riwayatPerjalananPenyakitItem.clinicalimpression_uuid}`,
                    resource: {
                        resourceType: "ClinicalImpression",
                        status: "completed",
                        code: {
                            coding: [
                                {
                                    system: "http://snomed.info/sct",
                                    code: "312850006",
                                    display: "History of disorder",
                                },
                            ],
                        },
                        subject: {
                            reference: `Patient/${riwayatPerjalananPenyakitItem.patient_id}`,
                            display: `${riwayatPerjalananPenyakitItem.patient_name}`,
                        },
                        encounter: {
                            // reference: `Encounter/${riwayatPerjalananPenyakitItem.encounter}`,
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        },
                        effectiveDateTime: new Date().toISOString,
                        date: new Date().toISOString,
                        assessor: {
                            reference: `Practitioner/${riwayatPerjalananPenyakitItem.practitioner_id}`,
                        },
                        summary: `${riwayatPerjalananPenyakitItem.kesimpulan}`,
                        prognosisCodeableConcept: [
                            {
                                coding: [
                                    {
                                        system: `${riwayatPerjalananPenyakitItem.prognosis_system}`,
                                        code: `${riwayatPerjalananPenyakitItem.prognosis_kode}`,
                                        display: `${riwayatPerjalananPenyakitItem.prognosis_nama}`,
                                    },
                                ],
                                text: `
                                    status: ${riwayatPerjalananPenyakitItem.status_nama},
                                    description: ${riwayatPerjalananPenyakitItem.deskripsi},
                                `,
                            },
                        ],
                        // investigation: [
                        //     `${}`
                        // ]
                    },
                    request: {
                        method: "POST",
                        url: "ClinicalImpression",
                    },
                });
            },
        );
    }

    return jsonClinicalImpression;
}

// Investigation masih tanda tanya karena tidak tahu detail pemetaannya, apakah berisi data yang belum dimasukkan seperti diagnosa, investigasi, deskripsi, status_nama

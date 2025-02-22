// main.ts
import { Request, Response, NextFunction } from "express";
import { OrganizationID } from "../config/satusehatConfig";
import dapatkanDataKondisiPasien from "../repositories/kondisiPasien";
import AppError from "../utils/errorHandler";
import dataKunjunganRawatInapService from "./dataKunjunganRawatInapService";
import dapatkanDataAnamnesis from "../repositories/pengirimanDataAnamnesis";
import pengirimanDataAnamnesisService from "./pengirimanDataAnamnesisService";
import dapatkanHasilPemeriksaanFisik from "../repositories/pengirimanDataHasilPemeriksaanFisik";
import pengirimanDataHasilPemeriksaanFisikService from "./pengirimanDataHasilPemeriksaanFisikService";
import dapatkanRiwayatPerjalananPenyakit from "../repositories/pengirimanDataRiwayatPerjalananPenyakit";
import pengirimanDataRiwayatPerjalananPenyakitService from "./pengirimanDataRiwayatPerjalananPenyakitService";
import dapatkanPemeriksaanLab from "../repositories/pengirimanDataPemeriksaanPenunjangLaboratorium";
import pengirimanDataPemeriksaanPenunjangLaboratoriumService from "./pengirimanDataPemeriksaanPenunjangLaboratoriumService";
import dapatkanPeresepanObat from "../repositories/pengirimanDataPeresepanObat";
import pengirimanDataPeresepanObat from "./pengirimanDataPeresepanObatService";
import { KunjunganRawatInap } from "../utils/interface";
import dapatkanDataKunjunganRawatInap from "../repositories/pendaftaranKunjunganRawatInap";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import pengirimanDataPengeluaranObat from "./pengirimanDataPengeluaranObatService";
import { writeJSONBundlePasien } from "../utils/fsJson";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";
import pengirimanDataDiagnosisService from "./pengirimanDataDiagnosisService";

const waktuAwal = "2022-09-12 00:01:00";
const waktuAkhir = "2022-09-13 23:59:00";

async function getEncounter(): Promise<KunjunganRawatInap[] | AppError> {
    try {
        const dataEncounter = await dapatkanDataKunjunganRawatInap();
        if (dataEncounter == null) {
            console.error("Error fetching encounters");
            return [];
        }
        return dataEncounter;
    } catch (error) {
        console.error("Error fetching encounters:", (error as Error).message);
        return [];
    }
}

export async function main(req: Request, res: Response, next: NextFunction) {
    try {
        let arrayJSONBundlePasien = [];
        const encounterData = await getEncounter();

        if (encounterData instanceof Error) {
            new AppError(`Can't get encounter data. App Stopped.`, 500);
        } else {
            for (let i = 0; i < encounterData.length; i++) {
                const dataMasterPasien = encounterData[i];
                let pendaftaranId = dataMasterPasien.registration_id;

                const LocationID = dataMasterPasien.location_poli_id;
                const LocationName = dataMasterPasien.unit_nama;
                // const No_Rujukan_Pasien = "A001";

                const conditions = await dapatkanDataKondisiPasien(
                    pendaftaranId,
                    waktuAwal,
                    waktuAkhir,
                );
                const anamnesis = await dapatkanDataAnamnesis(
                    dataMasterPasien,
                    waktuAwal,
                    waktuAkhir,
                );
                const physicalExamination =
                    await dapatkanHasilPemeriksaanFisik(dataMasterPasien);
                const clinicalImpression =
                    await dapatkanRiwayatPerjalananPenyakit(dataMasterPasien);
                const labTest = await dapatkanPemeriksaanLab(dataMasterPasien);
                const medication =
                    await dapatkanPeresepanObat(dataMasterPasien);
                const medicationDispense =
                    await dapatkanPengeluaranObat(dataMasterPasien);
                const diagnosis = await dapatkanDataDiagnosis(
                    dataMasterPasien,
                    waktuAwal,
                    waktuAkhir,
                );

                if (conditions instanceof Error) {
                    const err = new AppError(
                        `Can't find conditions for ${dataMasterPasien.patient_name}'s patient!`,
                        500,
                    );
                } else if (conditions.length === 0) {
                    console.log(
                        `No conditions found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataKunjunganRawatInap =
                        await dataKunjunganRawatInapService(
                            dataMasterPasien,
                            OrganizationID as string,
                            conditions,
                            LocationID,
                            LocationName,
                        );
                    arrayJSONBundlePasien.push(dataKunjunganRawatInap);
                }

                if (anamnesis instanceof Error) {
                    const err = new AppError(
                        `Can't find anamnesis for ${dataMasterPasien.patient_name}'s patient!`,
                        500,
                    );
                } else if (!anamnesis || Object.keys(anamnesis).length === 0) {
                    console.log(
                        `No anamnesis data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataAnamnesis = await pengirimanDataAnamnesisService(
                        dataMasterPasien,
                        anamnesis,
                    );
                    arrayJSONBundlePasien.push(dataAnamnesis);
                }

                if (physicalExamination instanceof Error) {
                    console.log(
                        `Can't find physical examination for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (
                    !physicalExamination ||
                    physicalExamination.length === 0
                ) {
                    console.log(
                        `No physical examination data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataPemeriksaanFisik =
                        await pengirimanDataHasilPemeriksaanFisikService(
                            dataMasterPasien,
                            physicalExamination,
                        );
                    arrayJSONBundlePasien.push(dataPemeriksaanFisik);
                }

                if (clinicalImpression instanceof Error) {
                    console.log(
                        `Can't find clnical impression for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (
                    !clinicalImpression ||
                    clinicalImpression.length === 0
                ) {
                    console.log(
                        `No clinical impression data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataRiwayatPerjalananPenyakit =
                        await pengirimanDataRiwayatPerjalananPenyakitService(
                            dataMasterPasien,
                            clinicalImpression,
                        );
                    arrayJSONBundlePasien.push(dataRiwayatPerjalananPenyakit);
                }

                if (labTest instanceof Error) {
                    console.log(
                        `Can't find lab test data for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (!labTest || Object.keys(labTest).length === 0) {
                    console.log(
                        `No lab test data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataPemeriksaanLab =
                        await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                            labTest,
                        );
                    arrayJSONBundlePasien.push(dataPemeriksaanLab);
                }

                if (medication instanceof Error) {
                    console.log(
                        `Can't find medication data for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (
                    !medication ||
                    (medication.medication.length === 0 &&
                        medication.medicationRequest.length === 0)
                ) {
                    console.log(
                        `No medication data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataPeresepanObat = await pengirimanDataPeresepanObat(
                        dataMasterPasien,
                        medication,
                    );
                    arrayJSONBundlePasien.push(dataPeresepanObat);
                }

                if (medicationDispense instanceof Error) {
                    console.log(
                        `Can't find medication dispense data for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (
                    !medicationDispense ||
                    (medicationDispense.medication.length === 0 &&
                        medicationDispense.medicationDispense.length === 0)
                ) {
                    console.log(
                        `No medication dispense data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataPeresepanObat =
                        await pengirimanDataPengeluaranObat(
                            dataMasterPasien,
                            medicationDispense,
                            LocationName,
                        );
                    arrayJSONBundlePasien.push(dataPeresepanObat);
                }

                if (diagnosis instanceof Error) {
                    console.log(
                        `Can't find diagnosis data for ${dataMasterPasien.patient_name}'s patient!`,
                    );
                } else if (!diagnosis || diagnosis.length === 0) {
                    console.log(
                        `No diagnosis data found for ${dataMasterPasien.patient_name}`,
                    );
                } else {
                    const dataDiagnosis = await pengirimanDataDiagnosisService(
                        dataMasterPasien,
                        diagnosis,
                    );
                    arrayJSONBundlePasien.push(dataDiagnosis);
                }

                const jsonBundlePasien = {
                    resourceType: "Bundle",
                    type: "transaction",
                    entry: arrayJSONBundlePasien,
                };

                writeJSONBundlePasien(jsonBundlePasien, dataMasterPasien);

                console.log("Writing JSON file...");
            }
        }

        console.log("Done process");

        res.status(200).send({ message: "Data processing completed." });
    } catch (error) {
        next(error);
    }
}

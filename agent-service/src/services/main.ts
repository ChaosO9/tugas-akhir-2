import { Request, Response, NextFunction } from "express";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
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
import dapatkanDataKunjunganRawatInap from "../repositories/pendaftaranKunjunganRawatInap";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import pengirimanDataPengeluaranObat from "./pengirimanDataPengeluaranObatService";
import { writeJSONBundlePasien } from "../utils/fsJson";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";
import pengirimanDataDietService from "./pengirimanDataDietService";
import pengirimanDataEdukasiService from "./pengirimanDataEdukasiService";
import pengirimanDataInstruksiMedikdanKeperawatanService from "./pengirimanDataInstruksiMedikdanKeperawatanService";
import pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService from "./pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService";
import pengirimanDataKondisiSaatMeninggalkanRumahSakitService from "./pengirimanDataKondisiSaatMeninggalkanRumahSakitService";
import pengirimanDataPemberianObatService from "./pengirimanDataPemberianObatService";
import pengirimanDataPemeriksaanFungsional from "./pengirimanDataPemeriksaanFungsionalService";
import pengirimanDataPemeriksaanPenunjangRadiologiService from "./pengirimanDataPemeriksaanPenunjangRadiologiService";
import pengirimanDataPemulanganPasienService from "./pengirimanDataPemulanganPasienService";
import pengirimanDataPengkajianResepService from "./pengirimanDataPengkajianResepService";
import pengirimanDataPenilaianRisikoService from "./pengirimanDataPenilaianRisikoService";
import pengirimanDataPrognosisService from "./pengirimanDataPrognosisService";
import pengirimanDataRasionalKlinisService from "./pengirimanDataRasionalKlinisService";
import pengirimanDataRencanaTindakLanjutService from "./pengirimanDataRencanaTindakLanjutService";
import pengirimanDataResumeMedisService from "./pengirimanDataResumeMedisService";
import pengirimanDataTindakanProsedurMedisService from "./pengirimanDataTindakanProsedurMedisService";
import pengirimanDataTujuanPerawatanService from "./pengirimanDataTujuanPerawatanService";
import pengirimanDataCaraKeluardariRumahSakitService from "./pengirimanDataCaraKeluardariRumahSakitService"; // Import the new service
import pengirimanDataDiagnosisService from "./pengirimanDataDiagnosisService";
import dapatkanDataDiet from "../repositories/pengirimanDataDiet";
import dapatkanDataEdukasi from "../repositories/pengirimanDataEdukasi";
import dapatkanDataInstruksiMedikdanKeperawatan from "../repositories/pengirimanDataInstruksiMedikdanKeperawatan";
import dapatkanDataInstruksiTindakLanjut from "../repositories/pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujuk";
import dapatkanDataKondisiSaatMeninggalkanRumahSakit from "../repositories/pengirimanDataKondisiSaatMeninggalkanRumahSakit";
import dapatkanDataPemberianObat from "../repositories/pengirimanDataPemberianObat";
import dapatkanDataPemeriksaanFungsional from "../repositories/pengirimanDataPemeriksaanFungsional";
import dapatkanDataPemeriksaanPenunjangRadiologi from "../repositories/pengirimanDataPemeriksaanPenunjangRadiologi";
import dapatkanDataPemulanganPasien from "../repositories/pengirimanDataPemulanganPasien";
import dapatkanDataPengkajianResep from "../repositories/pengirimanDataPengkajianResep";
import dapatkanDataPenilaianRisiko from "../repositories/pengirimanDataPenilaianRisiko";
import dapatkanDataPrognosis from "../repositories/pengirimanDataPrognosis";
import dapatkanDataRasionalKlinis from "../repositories/pengirimanDataRasionalKlinis";
import dapatkanDataRencanaTindakLanjut from "../repositories/pengirimanDataRencanaTindakLanjut";
import dapatkanDataResumeMedis from "../repositories/pengirimanDataResumeMedis";
import dapatkanDataTindakanProsedurMedis from "../repositories/pengirimanDataTindakanProsedurMedis";
import dapatkanDataTujuanPerawatan from "../repositories/pengirimanDataTujuanPerawatan";
import dapatkanDataCaraKeluarDariRumahSakit from "../repositories/pengirimanDataCaraKeluardariRumahSakit"; // Import the repository
import { publishJobNotification } from "./publisherService";
import { publishJobLPUSHNotification } from "./publisherLPUSHService";
import { DataPemberianObatFromRepo, medication } from "../utils/interface";
import { Identifier } from "../utils/interfaceFHIR";
import {
    KunjunganRawatInap,
    dataPemeriksaanLab,
    DataPemulanganPasienFromRepo,
    DataPemeriksaanRadiologiFromRepo,
    DataTindakanProsedurMedisFromRepo,
    DietDbRow,
    EdukasiDbRow,
    InstruksiMedikKeperawatanDbRow,
    InstruksiTindakLanjutDbRow,
    KondisiSaatPulangDbRow,
    MedicationAdministrationPemberianObatDbRow,
    PemeriksaanFungsionalDbRow,
    PengkajianResepDbRow,
    PenilaianRisikoDbRow,
    PrognosisDbRow,
    RasionalKlinisDbRow,
    RencanaTindakLanjutDbRow,
    ResumeMedisDbRow,
    TujuanPerawatanDbRow,
    CaraKeluarDbRow, // Import the DbRow interface
} from "../utils/interface";
import {
    createLogEntry,
    updateLogBundle,
    updateLogFilePath,
    updateLogError,
    updateLogPublishFailed,
    updateLog, // Import the generic updateLog function
    // updateLogStatus, // Not directly used, but createLogEntry is
    LogStatus,
} from "../repositories/logRepository";
import { EncounterResource } from "../utils/interfaceValidation";

async function getEncounter(
    waktuAwal: string,
    waktuAkhir: string,
): Promise<KunjunganRawatInap[] | AppError> {
    try {
        const dataEncounter = await dapatkanDataKunjunganRawatInap(
            waktuAwal,
            waktuAkhir,
        );
        if (!dataEncounter || dataEncounter instanceof AppError) {
            console.error(
                "Error fetching encounters or no encounters found.",
                dataEncounter,
            );
            return dataEncounter instanceof AppError ? dataEncounter : [];
        }
        return dataEncounter;
    } catch (error) {
        console.error("Error fetching encounters:", (error as Error).message);
        return new AppError(
            `Failed to fetch encounters: ${(error as Error).message}`,
            500,
        );
    }
}

export async function processSinglePatientEncounter(
    dataMasterPasien: KunjunganRawatInap,
    processingDate: Date, // Used for filename generation (e.g., yesterday)
) {
    const job_uuid = uuidv4();
    dataMasterPasien.processed_resource = {};

    console.log(
        `Processing patient: ${dataMasterPasien.patient_name} (Encounter ID: ${dataMasterPasien.encounter_id}, Job UUID: ${job_uuid})`,
    );

    await createLogEntry({
        job_uuid: job_uuid,
        pendaftaran_id: dataMasterPasien.registration_id,
        encounter_id: dataMasterPasien.encounter_id,
        patient_id: dataMasterPasien.patient_id,
        status: LogStatus.CREATED,
        created_by: "agent-service",
    });

    let arrayJSONBundlePasien: any[] = [];
    const pendaftaranId = dataMasterPasien.registration_id;
    const LocationID = dataMasterPasien.location_poli_id;
    const LocationName = dataMasterPasien.unit_nama;
    let processingErrorOccurred = false;

    try {
        console.log(
            `[${job_uuid}] Fetching conditions for ${dataMasterPasien.patient_name}...`,
        );
        // --- Fetch all data ---
        const conditions = await dapatkanDataKondisiPasien(pendaftaranId);
        console.log(
            `[${job_uuid}] Fetching anamnesis for ${dataMasterPasien.patient_name}...`,
        );
        const anamnesis = await dapatkanDataAnamnesis(dataMasterPasien);
        const physicalExamination =
            await dapatkanHasilPemeriksaanFisik(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching clinical impression (riwayat perjalanan penyakit) for ${dataMasterPasien.patient_name}...`,
        );
        const clinicalImpression =
            await dapatkanRiwayatPerjalananPenyakit(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching lab tests for ${dataMasterPasien.patient_name}...`,
        );
        const labTest = await dapatkanPemeriksaanLab(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching medication prescriptions for ${dataMasterPasien.patient_name}...`,
        );
        const medication = await dapatkanPeresepanObat(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching medication dispense for ${dataMasterPasien.patient_name}...`,
        );
        const medicationDispense =
            await dapatkanPengeluaranObat(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching diagnosis for ${dataMasterPasien.patient_name}...`,
        );
        const diagnosis = await dapatkanDataDiagnosis(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching diet for ${dataMasterPasien.patient_name}...`,
        );
        const diet = await dapatkanDataDiet(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching edukasi for ${dataMasterPasien.patient_name}...`,
        );
        const edukasi = await dapatkanDataEdukasi(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching instruksi medik for ${dataMasterPasien.patient_name}...`,
        );
        const instruksiMedik =
            await dapatkanDataInstruksiMedikdanKeperawatan(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching instruksi tindak lanjut for ${dataMasterPasien.patient_name}...`,
        );
        const instruksiTindakLanjut =
            await dapatkanDataInstruksiTindakLanjut(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching kondisi pulang for ${dataMasterPasien.patient_name}...`,
        );
        const kondisiPulang =
            await dapatkanDataKondisiSaatMeninggalkanRumahSakit(
                dataMasterPasien,
            );
        console.log(
            `[${job_uuid}] Fetching pemberian obat for ${dataMasterPasien.patient_name}...`,
        );
        const pemberianObat = await dapatkanDataPemberianObat(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching pemeriksaan fungsional for ${dataMasterPasien.patient_name}...`,
        );
        const pemeriksaanFungsional =
            await dapatkanDataPemeriksaanFungsional(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching radiologi for ${dataMasterPasien.patient_name}...`,
        );
        const radiologi =
            await dapatkanDataPemeriksaanPenunjangRadiologi(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching pemulangan pasien for ${dataMasterPasien.patient_name}...`,
        );
        const pemulanganPasien =
            await dapatkanDataPemulanganPasien(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching pengkajian resep for ${dataMasterPasien.patient_name}...`,
        );
        const pengkajianResep =
            await dapatkanDataPengkajianResep(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching penilaian risiko for ${dataMasterPasien.patient_name}...`,
        );
        const penilaianRisiko =
            await dapatkanDataPenilaianRisiko(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching prognosis for ${dataMasterPasien.patient_name}...`,
        );
        const prognosis = await dapatkanDataPrognosis(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching rasional klinis for ${dataMasterPasien.patient_name}...`,
        );
        const rasionalKlinis =
            await dapatkanDataRasionalKlinis(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching rencana tindak lanjut for ${dataMasterPasien.patient_name}...`,
        );
        const rencanaTindakLanjut =
            await dapatkanDataRencanaTindakLanjut(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching resume medis for ${dataMasterPasien.patient_name}...`,
        );
        const resumeMedis = await dapatkanDataResumeMedis(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching tindakan medis for ${dataMasterPasien.patient_name}...`,
        );
        const tindakanMedis =
            await dapatkanDataTindakanProsedurMedis(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching tujuan perawatan for ${dataMasterPasien.patient_name}...`,
        );
        const tujuanPerawatan =
            await dapatkanDataTujuanPerawatan(dataMasterPasien);
        console.log(
            `[${job_uuid}] Fetching cara keluar for ${dataMasterPasien.patient_name}...`,
        );
        const caraKeluar =
            await dapatkanDataCaraKeluarDariRumahSakit(dataMasterPasien);

        // --- Process Conditions ---
        if (conditions instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching conditions for ${dataMasterPasien.patient_name}: ${conditions.message}`,
            );
            await updateLogError({
                job_uuid,
                error_message: `Error fetching conditions: ${conditions.message}`,
            });
            processingErrorOccurred = true; // Consider if this is fatal
        } else if (conditions.length > 0) {
            console.log(
                `[${job_uuid}] Processing Kunjungan Rawat Inap (Encounter) for ${dataMasterPasien.patient_name}...`,
            );
            const dataKunjunganRawatInap = await dataKunjunganRawatInapService(
                dataMasterPasien,
                OrganizationID as string,
                conditions,
                LocationID,
                LocationName,
            );

            const fullUrlParts = dataKunjunganRawatInap.fullUrl.split(":");
            dataMasterPasien.encounter_id =
                fullUrlParts[fullUrlParts.length - 1];
            dataMasterPasien.registration_id = (
                dataKunjunganRawatInap.resource as EncounterResource
            ).identifier![0].value!;

            // Assuming dataKunjunganRawatInapService doesn't return AppError directly but throws or returns data
            arrayJSONBundlePasien.push(dataKunjunganRawatInap);
        } else {
            console.log(
                `[${job_uuid}] No conditions found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Anamnesis ---
        if (anamnesis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching anamnesis for ${dataMasterPasien.patient_name}: ${anamnesis.message}`,
            );
            // Log error but might continue if partial bundle is okay
            // await updateLogError({ job_uuid, error_message: `Error fetching anamnesis: ${anamnesis.message}` });
        } else if (anamnesis && Object.keys(anamnesis).length > 0) {
            // Check if anamnesis object is not empty
            console.log(
                `[${job_uuid}] Processing Anamnesis for ${dataMasterPasien.patient_name}...`,
            );
            const dataAnamnesis = await pengirimanDataAnamnesisService(
                dataMasterPasien,
                anamnesis,
            );
            if (!(dataAnamnesis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataAnamnesis);
            } else {
                console.warn(
                    `[${job_uuid}] Error processing anamnesis: ${dataAnamnesis.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No anamnesis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Physical Examination ---
        if (physicalExamination instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching physical exam for ${dataMasterPasien.patient_name}: ${physicalExamination.message}`,
            );
        } else if (physicalExamination && physicalExamination.length > 0) {
            console.log(
                `[${job_uuid}] Processing Physical Examination for ${dataMasterPasien.patient_name}...`,
            );
            const dataPemeriksaanFisik =
                await pengirimanDataHasilPemeriksaanFisikService(
                    dataMasterPasien,
                    physicalExamination,
                );
            if (!(dataPemeriksaanFisik instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPemeriksaanFisik);
            } else {
                console.warn(
                    `[${job_uuid}] Error processing physical exam: ${dataPemeriksaanFisik.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No physical examination data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Clinical Impression (Riwayat Perjalanan Penyakit) ---
        if (clinicalImpression instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching clinical impression for ${dataMasterPasien.patient_name}: ${clinicalImpression.message}`,
            );
        } else if (
            clinicalImpression &&
            Object.keys(clinicalImpression).length > 0
        ) {
            // Check if clinicalImpression object is not empty
            console.log(
                `[${job_uuid}] Processing Clinical Impression (Riwayat Perjalanan Penyakit) for ${dataMasterPasien.patient_name}...`,
            );
            const dataClinicalImpression =
                await pengirimanDataRiwayatPerjalananPenyakitService(
                    dataMasterPasien,
                    clinicalImpression,
                );
            if (!(dataClinicalImpression instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataClinicalImpression); // Assuming service returns an array
            } else {
                console.warn(
                    `[${job_uuid}] Error processing clinical impression: ${dataClinicalImpression.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No clinical impression data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Lab Test (Pemeriksaan Lab) ---
        if (labTest instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching lab tests for ${dataMasterPasien.patient_name}: ${labTest.message}`,
            );
        } else if (
            labTest &&
            (labTest.serviceRequest?.length > 0 ||
                labTest.specimen?.length > 0 ||
                labTest.observation?.length > 0 ||
                labTest.diagnosticReport?.length > 0)
        ) {
            // Check if any part of the lab data exists
            console.log(
                `[${job_uuid}] Processing Lab Tests for ${dataMasterPasien.patient_name}...`,
            );
            const dataLabTest =
                await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                    labTest as dataPemeriksaanLab,
                    dataMasterPasien,
                );
            if (!(dataLabTest instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataLabTest); // Assuming service returns an array
            } else {
                console.warn(
                    `[${job_uuid}] Error processing lab tests: ${dataLabTest.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No lab test data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Medication (Peresepan Obat) ---
        if (medication instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching medication prescriptions for ${dataMasterPasien.patient_name}: ${medication.message}`,
            );
        } else if (
            medication &&
            (medication.medication?.length > 0 ||
                medication.medicationRequest?.length > 0)
        ) {
            console.log(
                `[${job_uuid}] Processing Medication Prescriptions for ${dataMasterPasien.patient_name}...`,
            );
            const dataMedication = await pengirimanDataPeresepanObat(
                dataMasterPasien,
                medication,
            );
            if (!(dataMedication instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataMedication);
            } else {
                console.warn(
                    `[${job_uuid}] Error processing medication prescriptions: ${dataMedication.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No medication prescription data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Medication Dispense (Pengeluaran Obat) ---
        if (medicationDispense instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching medication dispense for ${dataMasterPasien.patient_name}: ${medicationDispense.message}`,
            );
        } else if (
            medicationDispense &&
            (medicationDispense.medication?.length > 0 ||
                medicationDispense.medicationDispense?.length > 0)
        ) {
            console.log(
                `[${job_uuid}] Processing Medication Dispense for ${dataMasterPasien.patient_name}...`,
            );
            const dataMedicationDispense = await pengirimanDataPengeluaranObat(
                dataMasterPasien,
                medicationDispense,
                LocationName,
            );
            if (!(dataMedicationDispense instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataMedicationDispense);
            } else {
                console.warn(
                    `[${job_uuid}] Error processing medication dispense: ${dataMedicationDispense.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No medication dispense data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Diagnosis ---
        if (diagnosis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching diagnosis for ${dataMasterPasien.patient_name}: ${diagnosis.message}`,
            );
        } else if (diagnosis && diagnosis.length > 0) {
            console.log(
                `[${job_uuid}] Processing Diagnosis for ${dataMasterPasien.patient_name}...`,
            );
            const dataDiagnosis = await pengirimanDataDiagnosisService(
                dataMasterPasien,
                diagnosis,
            );
            if (!(dataDiagnosis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataDiagnosis); // Assuming service returns an array
            } else {
                console.warn(
                    `[${job_uuid}] Error processing diagnosis: ${dataDiagnosis.message}`,
                );
            }
        } else {
            console.log(
                `[${job_uuid}] No diagnosis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Diet ---
        if (diet instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching diet for ${dataMasterPasien.patient_name}: ${diet.message}`,
            );
        } else if (diet && diet.length > 0) {
            console.log(
                `[${job_uuid}] Processing Diet for ${dataMasterPasien.patient_name}...`,
            );
            const dataDiet = await pengirimanDataDietService(
                dataMasterPasien,
                diet as DietDbRow[],
            );
            if (!(dataDiet instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataDiet);
            }
        } else {
            console.log(
                `[${job_uuid}] No diet data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Edukasi ---
        if (edukasi instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching edukasi for ${dataMasterPasien.patient_name}: ${edukasi.message}`,
            );
        } else if (edukasi && edukasi.length > 0) {
            console.log(
                `[${job_uuid}] Processing Edukasi for ${dataMasterPasien.patient_name}...`,
            );
            const dataEdukasi = await pengirimanDataEdukasiService(
                dataMasterPasien,
                edukasi as EdukasiDbRow[],
            );
            if (!(dataEdukasi instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataEdukasi);
            }
        } else {
            console.log(
                `[${job_uuid}] No edukasi data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Instruksi Medik dan Keperawatan ---
        if (instruksiMedik instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching instruksi medik for ${dataMasterPasien.patient_name}: ${instruksiMedik.message}`,
            );
        } else if (instruksiMedik && instruksiMedik.length > 0) {
            console.log(
                `[${job_uuid}] Processing Instruksi Medik dan Keperawatan for ${dataMasterPasien.patient_name}...`,
            );
            const dataInstruksiMedik =
                await pengirimanDataInstruksiMedikdanKeperawatanService(
                    dataMasterPasien,
                    instruksiMedik as InstruksiMedikKeperawatanDbRow[],
                );
            if (!(dataInstruksiMedik instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataInstruksiMedik);
            }
        } else {
            console.log(
                `[${job_uuid}] No instruksi medik data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Instruksi Tindak Lanjut ---
        if (instruksiTindakLanjut instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching instruksi tindak lanjut for ${dataMasterPasien.patient_name}: ${instruksiTindakLanjut.message}`,
            );
        } else if (instruksiTindakLanjut && instruksiTindakLanjut.length > 0) {
            console.log(
                `[${job_uuid}] Processing Instruksi Tindak Lanjut for ${dataMasterPasien.patient_name}...`,
            );
            const dataInstruksiTindakLanjut =
                await pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService(
                    dataMasterPasien,
                    instruksiTindakLanjut as InstruksiTindakLanjutDbRow[],
                );
            if (!(dataInstruksiTindakLanjut instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataInstruksiTindakLanjut);
            }
        } else {
            console.log(
                `[${job_uuid}] No instruksi tindak lanjut data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Kondisi Saat Pulang ---
        if (kondisiPulang instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching kondisi pulang for ${dataMasterPasien.patient_name}: ${kondisiPulang.message}`,
            );
        } else if (kondisiPulang && kondisiPulang.length > 0) {
            console.log(
                `[${job_uuid}] Processing Kondisi Saat Pulang for ${dataMasterPasien.patient_name}...`,
            );
            const dataKondisiPulang =
                await pengirimanDataKondisiSaatMeninggalkanRumahSakitService(
                    dataMasterPasien,
                    kondisiPulang as KondisiSaatPulangDbRow[],
                );
            if (!(dataKondisiPulang instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataKondisiPulang);
            }
        } else {
            console.log(
                `[${job_uuid}] No kondisi pulang data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Pemberian Obat ---
        if (pemberianObat instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching pemberian obat for ${dataMasterPasien.patient_name}: ${pemberianObat.message}`,
            );
        } else if (
            pemberianObat &&
            (pemberianObat.medication || pemberianObat.medicationAdministration)
        ) {
            console.log(
                `[${job_uuid}] Processing Pemberian Obat for ${dataMasterPasien.patient_name}...`,
            );
            const dataPemberianObat = await pengirimanDataPemberianObatService(
                dataMasterPasien,
                pemberianObat as DataPemberianObatFromRepo,
            );
            if (!(dataPemberianObat instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPemberianObat);
            }
        } else {
            console.log(
                `[${job_uuid}] No pemberian obat data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Pemeriksaan Fungsional ---
        if (pemeriksaanFungsional instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching pemeriksaan fungsional for ${dataMasterPasien.patient_name}: ${pemeriksaanFungsional.message}`,
            );
        } else if (pemeriksaanFungsional && pemeriksaanFungsional.length > 0) {
            console.log(
                `[${job_uuid}] Processing Pemeriksaan Fungsional for ${dataMasterPasien.patient_name}...`,
            );
            const dataPemeriksaanFungsional =
                await pengirimanDataPemeriksaanFungsional(
                    dataMasterPasien,
                    pemeriksaanFungsional as PemeriksaanFungsionalDbRow[],
                );
            if (!(dataPemeriksaanFungsional instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPemeriksaanFungsional);
            }
        } else {
            console.log(
                `[${job_uuid}] No pemeriksaan fungsional data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Radiologi ---
        if (radiologi instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching radiologi for ${dataMasterPasien.patient_name}: ${radiologi.message}`,
            );
        } else if (radiologi && radiologi.serviceRequest?.length > 0) {
            console.log(
                `[${job_uuid}] Processing Radiologi for ${dataMasterPasien.patient_name}...`,
            );
            const dataRadiologi =
                await pengirimanDataPemeriksaanPenunjangRadiologiService(
                    dataMasterPasien,
                    radiologi as DataPemeriksaanRadiologiFromRepo,
                );
            if (!(dataRadiologi instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataRadiologi);
            }
        } else {
            console.log(
                `[${job_uuid}] No radiologi data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Pemulangan Pasien ---
        if (pemulanganPasien instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching pemulangan pasien for ${dataMasterPasien.patient_name}: ${pemulanganPasien.message}`,
            );
        } else if (
            pemulanganPasien &&
            (pemulanganPasien.observation?.length > 0 ||
                pemulanganPasien.carePlan?.length > 0)
        ) {
            console.log(
                `[${job_uuid}] Processing Pemulangan Pasien for ${dataMasterPasien.patient_name}...`,
            );
            const dataPemulangan = await pengirimanDataPemulanganPasienService(
                dataMasterPasien,
                pemulanganPasien as DataPemulanganPasienFromRepo,
            );
            if (!(dataPemulangan instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPemulangan);
            }
        } else {
            console.log(
                `[${job_uuid}] No pemulangan pasien data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Pengkajian Resep ---
        if (pengkajianResep instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching pengkajian resep for ${dataMasterPasien.patient_name}: ${pengkajianResep.message}`,
            );
        } else if (pengkajianResep && pengkajianResep.length > 0) {
            console.log(
                `[${job_uuid}] Processing Pengkajian Resep for ${dataMasterPasien.patient_name}...`,
            );
            const dataPengkajianResep =
                await pengirimanDataPengkajianResepService(
                    dataMasterPasien,
                    pengkajianResep as PengkajianResepDbRow[],
                );
            if (!(dataPengkajianResep instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPengkajianResep);
            }
        } else {
            console.log(
                `[${job_uuid}] No pengkajian resep data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Penilaian Risiko ---
        if (penilaianRisiko instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching penilaian risiko for ${dataMasterPasien.patient_name}: ${penilaianRisiko.message}`,
            );
        } else if (penilaianRisiko && penilaianRisiko.length > 0) {
            console.log(
                `[${job_uuid}] Processing Penilaian Risiko for ${dataMasterPasien.patient_name}...`,
            );
            const dataPenilaianRisiko =
                await pengirimanDataPenilaianRisikoService(
                    dataMasterPasien,
                    penilaianRisiko as PenilaianRisikoDbRow[],
                );
            if (!(dataPenilaianRisiko instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPenilaianRisiko);
            }
        } else {
            console.log(
                `[${job_uuid}] No penilaian risiko data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Prognosis ---
        if (prognosis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching prognosis for ${dataMasterPasien.patient_name}: ${prognosis.message}`,
            );
        } else if (prognosis && prognosis.length > 0) {
            console.log(
                `[${job_uuid}] Processing Prognosis for ${dataMasterPasien.patient_name}...`,
            );
            const dataPrognosis = await pengirimanDataPrognosisService(
                dataMasterPasien,
                prognosis as PrognosisDbRow[],
            );
            if (!(dataPrognosis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataPrognosis);
            }
        } else {
            console.log(
                `[${job_uuid}] No prognosis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Rasional Klinis ---
        if (rasionalKlinis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching rasional klinis for ${dataMasterPasien.patient_name}: ${rasionalKlinis.message}`,
            );
        } else if (rasionalKlinis && rasionalKlinis.length > 0) {
            console.log(
                `[${job_uuid}] Processing Rasional Klinis for ${dataMasterPasien.patient_name}...`,
            );
            const dataRasionalKlinis =
                await pengirimanDataRasionalKlinisService(
                    dataMasterPasien,
                    rasionalKlinis as RasionalKlinisDbRow[],
                );
            if (!(dataRasionalKlinis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataRasionalKlinis);
            }
        } else {
            console.log(
                `[${job_uuid}] No rasional klinis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Rencana Tindak Lanjut ---
        if (rencanaTindakLanjut instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching rencana tindak lanjut for ${dataMasterPasien.patient_name}: ${rencanaTindakLanjut.message}`,
            );
        } else if (rencanaTindakLanjut && rencanaTindakLanjut.length > 0) {
            console.log(
                `[${job_uuid}] Processing Rencana Tindak Lanjut for ${dataMasterPasien.patient_name}...`,
            );
            const dataRencanaTindakLanjut =
                await pengirimanDataRencanaTindakLanjutService(
                    dataMasterPasien,
                    rencanaTindakLanjut as RencanaTindakLanjutDbRow[],
                );
            if (!(dataRencanaTindakLanjut instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataRencanaTindakLanjut);
            }
        } else {
            console.log(
                `[${job_uuid}] No rencana tindak lanjut data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Resume Medis ---
        if (resumeMedis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching resume medis for ${dataMasterPasien.patient_name}: ${resumeMedis.message}`,
            );
        } else if (resumeMedis && resumeMedis.length > 0) {
            console.log(
                `[${job_uuid}] Processing Resume Medis for ${dataMasterPasien.patient_name}...`,
            );
            const dataResumeMedis = await pengirimanDataResumeMedisService(
                dataMasterPasien,
                resumeMedis as ResumeMedisDbRow[],
            );
            if (!(dataResumeMedis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataResumeMedis);
            }
        } else {
            console.log(
                `[${job_uuid}] No resume medis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Tindakan Medis ---
        if (tindakanMedis instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching tindakan medis for ${dataMasterPasien.patient_name}: ${tindakanMedis.message}`,
            );
        } else if (tindakanMedis && tindakanMedis.serviceRequest?.length > 0) {
            console.log(
                `[${job_uuid}] Processing Tindakan Medis for ${dataMasterPasien.patient_name}...`,
            );
            const dataTindakanMedis =
                await pengirimanDataTindakanProsedurMedisService(
                    dataMasterPasien,
                    tindakanMedis as DataTindakanProsedurMedisFromRepo,
                );
            if (!(dataTindakanMedis instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataTindakanMedis);
            }
        } else {
            console.log(
                `[${job_uuid}] No tindakan medis data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Tujuan Perawatan ---
        if (tujuanPerawatan instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching tujuan perawatan for ${dataMasterPasien.patient_name}: ${tujuanPerawatan.message}`,
            );
        } else if (tujuanPerawatan && tujuanPerawatan.length > 0) {
            console.log(
                `[${job_uuid}] Processing Tujuan Perawatan for ${dataMasterPasien.patient_name}...`,
            );
            const dataTujuanPerawatan =
                await pengirimanDataTujuanPerawatanService(
                    dataMasterPasien,
                    tujuanPerawatan as TujuanPerawatanDbRow[],
                );
            if (!(dataTujuanPerawatan instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataTujuanPerawatan);
            }
        } else {
            console.log(
                `[${job_uuid}] No tujuan perawatan data found for ${dataMasterPasien.patient_name}`,
            );
        }

        // --- Process Cara Keluar dari Rumah Sakit ---
        if (caraKeluar instanceof Error) {
            console.warn(
                `[${job_uuid}] Error fetching cara keluar for ${dataMasterPasien.patient_name}: ${caraKeluar.message}`,
            );
        } else if (caraKeluar && caraKeluar.length > 0) {
            console.log(
                `[${job_uuid}] Processing Cara Keluar dari Rumah Sakit for ${dataMasterPasien.patient_name}...`,
            );
            const dataCaraKeluar =
                await pengirimanDataCaraKeluardariRumahSakitService(
                    dataMasterPasien,
                    caraKeluar as CaraKeluarDbRow[],
                );
            if (!(dataCaraKeluar instanceof AppError)) {
                arrayJSONBundlePasien.push(...dataCaraKeluar);
            }
        } else {
            console.log(
                `[${job_uuid}] No cara keluar data found for ${dataMasterPasien.patient_name}`,
            );
        }
        // --- Final Bundle Assembly, Write, and Publish ---
        if (processingErrorOccurred) {
            console.error(
                `[${job_uuid}] Skipping bundle write and publish due to critical data fetching errors.`,
            );
            // Log already updated with ERROR status via updateLogError
        } else if (arrayJSONBundlePasien.length > 0) {
            const jsonBundlePasien = {
                resourceType: "Bundle",
                type: "transaction",
                entry: arrayJSONBundlePasien.flat(), // Flatten in case services return nested arrays (though push(...) should handle it)
            };

            await updateLogBundle({
                job_uuid: job_uuid,
                bundle_json: jsonBundlePasien,
            });

            const bundleFilename = `${job_uuid}_${dataMasterPasien.patient_id}_${dataMasterPasien.encounter_id}_${format(processingDate, "yyyyMMdd")}_NEW.json`;

            try {
                await writeJSONBundlePasien(
                    jsonBundlePasien,
                    dataMasterPasien, // Still passing this, might be used internally by writeJSONBundlePasien
                    bundleFilename,
                );
                console.log(
                    `[${job_uuid}] Successfully wrote bundle file: ${bundleFilename}`,
                );

                await updateLogFilePath({
                    job_uuid: job_uuid,
                    bundle_file_path: bundleFilename,
                });

                console.log(
                    `[${job_uuid}] Attempting to publish notification for ${bundleFilename}...`,
                );
                try {
                    await publishJobNotification(bundleFilename, job_uuid);
                    await publishJobLPUSHNotification(bundleFilename, job_uuid);
                    console.log(
                        `[${job_uuid}] Successfully published notification for ${bundleFilename}.`,
                    );
                    // Status remains CREATED, sender updates later
                } catch (publishError: any) {
                    console.error(
                        `[${job_uuid}] Failed initial publish notification for ${bundleFilename}:`,
                        publishError,
                    );
                    await updateLogPublishFailed({
                        job_uuid: job_uuid,
                        error_message: `Failed to publish notification: ${publishError.message || publishError}`,
                    });
                }
            } catch (writeError: any) {
                console.error(
                    `[${job_uuid}] Failed to write bundle file ${bundleFilename}. Skipping notification. Error:`,
                    writeError,
                );
                await updateLogError({
                    job_uuid: job_uuid,
                    error_message: `Failed to write bundle file: ${writeError.message || writeError}`,
                });
            }
        } else {
            console.log(
                `[${job_uuid}] No data elements found to bundle for patient ${dataMasterPasien.patient_name}. Skipping file write and notification.`,
            );
            await updateLogError({
                job_uuid: job_uuid,
                error_message: "No data elements found to bundle.",
                status: LogStatus.ERROR, // Mark as error since nothing was produced
            });
        }
    } catch (patientError: any) {
        console.error(
            `[${job_uuid}] Unhandled error processing patient ${dataMasterPasien.patient_name} (Encounter: ${dataMasterPasien.encounter_id}):`,
            patientError,
        );
        await updateLogError({
            job_uuid: job_uuid,
            error_message: `Unhandled patient processing error: ${patientError.message || patientError}`,
        });
    }
}

export async function processDailyData(
    trigger_uuid?: string,
    trigger_type?: "CRON_JOB" | "MANUAL_TRIGGER",
) {
    console.log("Starting daily data processing...");

    const now = new Date();
    const yesterday = subDays(now, 1); // This will be passed for filename generation
    const startOfProcessingDay = startOfDay(yesterday);
    const endOfProcessingDay = endOfDay(yesterday);

    const waktuAwal = process.env.waktuAwal
        ? format(new Date(process.env.waktuAwal), "dd-MM-yyyy HH:mm:ss")
        : format(startOfProcessingDay, "dd-MM-yyyy HH:mm:ss");
    const waktuAkhir = process.env.waktuAkhir
        ? format(new Date(process.env.waktuAkhir), "dd-MM-yyyy HH:mm:ss")
        : format(endOfProcessingDay, "dd-MM-yyyy HH:mm:ss");

    console.log(`Processing data for range: ${waktuAwal} to ${waktuAkhir}`);

    try {
        const encounterData = await getEncounter(waktuAwal, waktuAkhir);

        if (encounterData instanceof AppError) {
            console.error(
                `Error getting encounter data: ${encounterData.message}. Stopping daily processing.`,
            );
            // Throw an error to signal failure to the caller (cron job)
            throw new AppError(
                `Failed to get encounter data: ${encounterData.message}`,
                encounterData.statusCode,
            );
        }

        // Update the trigger log status after encounters are fetched (or determined to be none)
        if (trigger_uuid && trigger_type) {
            const newStatus =
                trigger_type === "CRON_JOB"
                    ? LogStatus.CRON_JOB_ENCOUNTERS_FETCHED
                    : LogStatus.MANUAL_TRIGGER_ENCOUNTERS_FETCHED;
            await updateLog(trigger_uuid, {
                status: newStatus,
            });
            console.log(
                `[${trigger_uuid}] Trigger log status updated to ${newStatus}.`,
            );
        }

        if (encounterData.length === 0) {
            console.log("No encounter data found for the specified period.");
            console.log("Daily data processing finished (no encounters).");
            return;
        }

        console.log(`Found ${encounterData.length} encounters to process.`);

        for (const dataMasterPasien of encounterData) {
            await processSinglePatientEncounter(dataMasterPasien, yesterday);
        } // End of encounter loop

        console.log("Daily data processing finished successfully.");
    } catch (error) {
        console.error("Unhandled error during daily data processing:", error);
    }
}
// --- Original Express Handler (No changes needed here) ---
export async function main(req: Request, res: Response, next: NextFunction) {
    try {
        const trigger_uuid = uuidv4();
        console.log(
            `[${trigger_uuid}] Manual trigger received for data processing.`,
        );
        await createLogEntry({
            job_uuid: trigger_uuid,
            pendaftaran_id: "MANUAL_TRIGGER", // Placeholder as this is a trigger event
            encounter_id: "N/A",
            patient_id: "N/A",
            status: LogStatus.MANUAL_TRIGGER_INITIATED,
            created_by: "api_trigger",
        });

        processDailyData(trigger_uuid, "MANUAL_TRIGGER").catch((err) => {
            console.error(
                `[${trigger_uuid}] Error during manually triggered processDailyData:`,
                err,
            );
        });
        res.status(202).send({
            message:
                "Data processing initiated successfully. Check logs for progress.",
        });
    } catch (error) {
        console.error("Error initiating manual data processing:", error);
        next(error);
    }
}

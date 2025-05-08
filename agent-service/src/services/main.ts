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
import { KunjunganRawatInap, dataPemeriksaanLab } from "../utils/interface"; // Added dataPemeriksaanLab import
import dapatkanDataKunjunganRawatInap from "../repositories/pendaftaranKunjunganRawatInap";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import pengirimanDataPengeluaranObat from "./pengirimanDataPengeluaranObatService";
import { writeJSONBundlePasien } from "../utils/fsJson";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";
import pengirimanDataDiagnosisService from "./pengirimanDataDiagnosisService";
import { publishJobNotification } from "./publisherService";
import {
    createLogEntry,
    updateLogBundle,
    updateLogFilePath,
    updateLogError,
    updateLogPublishFailed,
    LogStatus,
} from "../repositories/logRepository";

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

export async function processDailyData() {
    console.log("Starting daily data processing...");

    const now = new Date();
    const yesterday = subDays(now, 1);
    const startOfYesterday = startOfDay(yesterday);
    const endOfYesterday = endOfDay(yesterday);

    const waktuAwal = process.env.waktuAwal
        ? format(new Date(process.env.waktuAwal), "dd-MM-yyyy HH:mm:ss") // Ensure Date object if parsing from string
        : format(startOfYesterday, "dd-MM-yyyy HH:mm:ss");
    const waktuAkhir = process.env.waktuAkhir
        ? format(new Date(process.env.waktuAkhir), "dd-MM-yyyy HH:mm:ss") // Ensure Date object if parsing from string
        : format(endOfYesterday, "dd-MM-yyyy HH:mm:ss");

    console.log(`Processing data for range: ${waktuAwal} to ${waktuAkhir}`);

    try {
        const encounterData = await getEncounter(waktuAwal, waktuAkhir);

        if (encounterData instanceof AppError) {
            console.error(
                `Error getting encounter data: ${encounterData.message}. Stopping daily processing.`,
            );
            return;
        }

        if (encounterData.length === 0) {
            console.log("No encounter data found for the specified period.");
            console.log("Daily data processing finished (no encounters).");
            return;
        }

        console.log(`Found ${encounterData.length} encounters to process.`);

        for (const dataMasterPasien of encounterData) {
            const job_uuid = uuidv4();
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
                // --- Fetch all data ---
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
                    const dataKunjunganRawatInap =
                        await dataKunjunganRawatInapService(
                            dataMasterPasien,
                            OrganizationID as string,
                            conditions,
                            LocationID,
                            LocationName,
                        );
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
                } else if (
                    physicalExamination &&
                    physicalExamination.length > 0
                ) {
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
                    const dataLabTest =
                        await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                            labTest as dataPemeriksaanLab,
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
                    const dataMedicationDispense =
                        await pengirimanDataPengeluaranObat(
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

                    const bundleFilename = `${job_uuid}_${dataMasterPasien.patient_id}_${dataMasterPasien.encounter_id}_${format(yesterday, "yyyyMMdd")}_NEW.json`;

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
                            await publishJobNotification(
                                bundleFilename,
                                job_uuid,
                            );
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
        } // End of encounter loop

        console.log("Daily data processing finished successfully.");
    } catch (error) {
        console.error("Unhandled error during daily data processing:", error);
    }
}

// --- Original Express Handler (No changes needed here) ---
export async function main(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("Manual trigger received for data processing.");
        processDailyData().catch((err) => {
            console.error(
                "Error during manually triggered processDailyData:",
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

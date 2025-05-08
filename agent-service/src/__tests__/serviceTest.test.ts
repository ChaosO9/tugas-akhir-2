import * as fs from "fs";
import * as path from "path"; // Use path for cross-platform compatibility

// Service Imports
import dataKunjunganRawatInapService from "../services/dataKunjunganRawatInapService";
import pengirimanDataAnamnesisService from "../services/pengirimanDataAnamnesisService";
import pengirimanDataHasilPemeriksaanFisikService from "../services/pengirimanDataHasilPemeriksaanFisikService";
import pengirimanDataPengeluaranObatService from "../services/pengirimanDataPengeluaranObatService"; // Corrected import name
import pengirimanDataPeresepanObatService from "../services/pengirimanDataPeresepanObatService"; // Corrected import name
import pengirimanDataPemeriksaanPenunjangLaboratoriumService from "../services/pengirimanDataPemeriksaanPenunjangLaboratoriumService";
import pengirimanDataDiagnosisService from "../services/pengirimanDataDiagnosisService";

// Repository Imports
import dapatkanDataAnamnesis from "../repositories/pengirimanDataAnamnesis";
import dapatkanHasilPemeriksaanFisik from "../repositories/pengirimanDataHasilPemeriksaanFisik";
import dapatkanPeresepanObat from "../repositories/pengirimanDataPeresepanObat";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import dapatkanPemeriksaanLab from "../repositories/pengirimanDataPemeriksaanPenunjangLaboratorium";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";

// Utility and Interface Imports
import {
    KunjunganRawatInap,
    dataAnamnesis,
    dataHasilPemeriksaanFisik,
    dataPengeluaranObat,
    dataPemeriksaanLab,
    dataPeresepanObat,
    ConditionRow,
} from "../utils/interface";
import { writeJSON } from "../utils/fsJson";
import AppError from "../utils/errorHandler";

// Define the structure for mock data, using KunjunganRawatInap as the base type
interface MockDataMasterPasien {
    KunjunganRawatInap: KunjunganRawatInap;
    Anamnesis: KunjunganRawatInap;
    PemeriksaanFisik: KunjunganRawatInap;
    PeresepanObat: KunjunganRawatInap;
    PengeluaranObat: KunjunganRawatInap; // Added for clarity, uses PeresepanObat data
    PemeriksaanLab: KunjunganRawatInap;
    Diagnosa: KunjunganRawatInap;
}

// --- Mock Data (Unchanged as requested) ---
const mockDataMasterPasien: MockDataMasterPasien = {
    KunjunganRawatInap: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ08122022-00001",
        encounter_id: "c8de0f00-5b00-a33b-9afb-8189ee610ea9",
        arrived: "2022-12-08T02:16:57.000Z",
        in_progress: "2022-12-08T02:21:48.000Z",
        finished: "2022-12-08T02:22:32.000Z",
        patient_id: "P02478375538",
        patient_name: "KAYLILA FAUZIAH, NY",
        practitioner_id: "10009880728",
        practitioner_name: "TIARA PRAMAESYA",
        period_start: "2022-12-08T02:16:57.000Z",
        period_end: "2022-12-08T02:22:32.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "00cfd100-4e00-80db-96c1-9a04d8d16e5f",
                diagnosa_nama: "Faecal incontinence",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    Anamnesis: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ03062024-00013",
        encounter_id: "e446af00-fa00-3584-0c40-35545b61055d",
        arrived: "2024-06-03T14:42:51.000Z",
        in_progress: "2024-06-03T15:58:35.000Z",
        finished: "2024-06-03T15:58:35.000Z",
        patient_id: "P02478375538",
        patient_name: "REVA ANDHARA KIRANA, TN",
        practitioner_id: "10009880728",
        practitioner_name: "BUDY SANTOSO, SP. BM",
        period_start: "2024-06-03T14:42:51.000Z",
        period_end: "2024-06-03T15:58:35.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "082c6b00-c900-f15c-0aad-2228ede165fa",
                diagnosa_nama: "Paratyphoid fever, unspecified",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    PemeriksaanFisik: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ18072024-00006",
        encounter_id: "67716000-c500-c5a1-b596-605fa7f10bf2",
        arrived: "2024-07-18T10:43:10.000Z",
        in_progress: "2024-07-18T10:43:10.000Z",
        finished: "2024-07-18T10:43:10.000Z",
        patient_id: "P02280547535",
        patient_name: "SULASTRI NINGSIH, NYONYA",
        practitioner_id: "10018452434",
        practitioner_name: "Tenaga Medis 91495 (Mitra Medika)",
        period_start: "2024-07-18T10:43:10.000Z",
        period_end: "2024-07-18T10:43:10.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "e971bb00-d300-f166-a903-9c23aa3167f6",
                diagnosa_nama: "Shigellosis",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    PeresepanObat: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ27092022-00005",
        encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P00515344124",
        patient_name: "ANDHIKA MEGA KURNIAWAN",
        practitioner_id: "10009880728",
        practitioner_name: "TIARA PRAMAESYA",
        period_start: "2022-09-27T14:11:06.000Z",
        period_end: "2022-09-27T14:16:30.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "d8576700-0300-00d1-e07b-757800d166dd",
                diagnosa_nama: "Nausea and vomiting",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    // PengeluaranObat uses the same base data as PeresepanObat for this test setup
    PengeluaranObat: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ27092022-00005",
        encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P00515344124",
        patient_name: "ANDHIKA MEGA KURNIAWAN",
        practitioner_id: "10009880728",
        practitioner_name: "TIARA PRAMAESYA",
        period_start: "2022-09-27T14:11:06.000Z",
        period_end: "2022-09-27T14:16:30.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "d8576700-0300-00d1-e07b-757800d166dd",
                diagnosa_nama: "Nausea and vomiting",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    PemeriksaanLab: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ27092022-00005",
        encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P00515344124",
        patient_name: "ANDHIKA MEGA KURNIAWAN",
        practitioner_id: "10009880728",
        practitioner_name: "TIARA PRAMAESYA",
        period_start: "2022-09-27T14:11:06.000Z",
        period_end: "2022-09-27T14:16:30.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "d8576700-0300-00d1-e07b-757800d166dd",
                diagnosa_nama: "Nausea and vomiting",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
    Diagnosa: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ03062024-00013",
        encounter_id: "e446af00-fa00-3584-0c40-35545b61055d",
        arrived: "2024-06-03T14:42:51.000Z",
        in_progress: "2024-06-03T15:58:35.000Z",
        finished: "2024-06-03T15:58:35.000Z",
        patient_id: "P02478375538",
        patient_name: "REVA ANDHARA KIRANA, TN",
        practitioner_id: "10009880728",
        practitioner_name: "BUDY SANTOSO, SP. BM",
        period_start: "2024-06-03T14:42:51.000Z",
        period_end: "2024-06-03T15:58:35.000Z",
        diagnosa: [
            {
                diagnosa_uuid: "082c6b00-c900-f15c-0aad-2228ede165fa",
                diagnosa_nama: "Paratyphoid fever, unspecified",
                diagnosa_type: "UTAMA",
            },
        ],
        location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
        unit_nama: "POLI UMUM",
    },
};
// --- End Mock Data ---

// Constants used across tests
const ORGANIZATION_ID = "2143952e-a416-44ef-9085-20d551044c08";
const LOCATION_ID = "85df32eb-7b0a-4ab2-9867-5309d2b9d944";
const LOCATION_NAME = "POLI UMUM";
const OUTPUT_DIR = path.join("json", "patient"); // Use path.join for directory path

describe("Services Tests", () => {
    // Ensure the output directory exists before running tests
    beforeAll(() => {
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }
    });

    // Optional: Clean up generated files after all tests run
    // afterAll(() => {
    //     if (fs.existsSync(OUTPUT_DIR)) {
    //         fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
    //     }
    // });

    // Helper function to generate file path and check existence
    const checkFileExists = (fileName: string): void => {
        const filePath = path.join(OUTPUT_DIR, `${fileName}.json`);
        expect(fs.existsSync(filePath)).toBe(true);
    };

    // Helper function to handle potential AppError from repository functions
    const handleRepositoryError = (
        result: any | AppError,
        repositoryName: string,
    ): any => {
        if (result instanceof AppError) {
            // Use fail() from Jest to stop the test and report the error
            fail(`${repositoryName} returned an error: ${result.message}`);
        }
        return result; // Return the data if it's not an error
    };

    it("should generate JSON for dataKunjunganRawatInapService", async () => {
        const mockKunjungan = mockDataMasterPasien.KunjunganRawatInap;
        const conditions: ConditionRow[] = []; // Correctly typed empty array
        const fileName = `${mockKunjungan.patient_name}_Kunjungan Rawat Inap`;

        const result = await dataKunjunganRawatInapService(
            mockKunjungan,
            ORGANIZATION_ID,
            conditions,
            LOCATION_ID,
            LOCATION_NAME,
        );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataAnamnesisService", async () => {
        const mockKunjungan = mockDataMasterPasien.Anamnesis;
        // Keep hardcoded dates as they might be specific to the mock data context
        const startDate = "03-06-2024 00:00:00";
        const endDate = "03-06-2024 23:59:00";
        const fileName = `${mockKunjungan.patient_name}_Data Anamnesis`;

        const repoResult = await dapatkanDataAnamnesis(
            mockKunjungan,
            startDate,
            endDate,
        );
        const mockDataAnamnesis = handleRepositoryError(
            repoResult,
            "dapatkanDataAnamnesis",
        );

        const result = await pengirimanDataAnamnesisService(
            mockKunjungan,
            mockDataAnamnesis,
        );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataHasilPemeriksaanFisikService", async () => {
        const mockKunjungan = mockDataMasterPasien.PemeriksaanFisik;
        const fileName = `${mockKunjungan.patient_name}_Pemeriksaan Fisik`;

        const repoResult = await dapatkanHasilPemeriksaanFisik(mockKunjungan);
        const mockDataPemeriksaanFisik = handleRepositoryError(
            repoResult,
            "dapatkanHasilPemeriksaanFisik",
        );

        const result = await pengirimanDataHasilPemeriksaanFisikService(
            mockKunjungan,
            mockDataPemeriksaanFisik,
        );

        expect(result).toBeDefined();
        // Add more specific assertions if possible, e.g., check bundle type or entries
        // expect(result.resourceType).toBe('Bundle');
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataPeresepanObatService", async () => {
        const mockKunjungan = mockDataMasterPasien.PeresepanObat;
        const fileName = `${mockKunjungan.patient_name}_Peresepan Obat`;

        const repoResult = await dapatkanPeresepanObat(mockKunjungan);
        const mockDataPeresepanObat = handleRepositoryError(
            repoResult,
            "dapatkanPeresepanObat",
        );

        const result = await pengirimanDataPeresepanObatService(
            mockKunjungan,
            mockDataPeresepanObat,
        );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataPengeluaranObatService", async () => {
        // Uses the same base Kunjungan data as PeresepanObat in this setup
        const mockKunjungan = mockDataMasterPasien.PengeluaranObat;
        const fileName = `${mockKunjungan.patient_name}_Pengeluaran Obat`;

        const repoResult = await dapatkanPengeluaranObat(mockKunjungan);
        const mockDataPengeluaranObat = handleRepositoryError(
            repoResult,
            "dapatkanPengeluaranObat",
        );

        const result = await pengirimanDataPengeluaranObatService(
            mockKunjungan,
            mockDataPengeluaranObat,
            LOCATION_NAME,
        );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataPemeriksaanPenunjangLaboratoriumService", async () => {
        const mockKunjungan = mockDataMasterPasien.PemeriksaanLab;
        const fileName = `${mockKunjungan.patient_name}_Pemeriksaan Lab`;

        const repoResult = await dapatkanPemeriksaanLab(mockKunjungan);
        const mockDataPemeriksaanLab = handleRepositoryError(
            repoResult,
            "dapatkanPemeriksaanLab",
        );

        const result =
            await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                mockDataPemeriksaanLab,
            );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    it("should generate JSON for pengirimanDataDiagnosisService", async () => {
        const mockKunjungan = mockDataMasterPasien.Diagnosa;
        // Keep hardcoded dates as they might be specific to the mock data context
        const startDate = "03-06-2024 00:00:00";
        const endDate = "03-06-2024 23:59:00";
        const fileName = `${mockKunjungan.patient_name}_Diagnosa`;

        const repoResult = await dapatkanDataDiagnosis(
            mockKunjungan,
            startDate,
            endDate,
        );
        const mockDataDiagnosis = handleRepositoryError(
            repoResult,
            "dapatkanDataDiagnosis",
        );

        const result = await pengirimanDataDiagnosisService(
            mockKunjungan,
            mockDataDiagnosis,
        );

        expect(result).toBeDefined();
        await writeJSON(result, fileName);
        checkFileExists(fileName);
    });

    // Placeholder for the commented-out test if needed in the future
    // it("should generate JSON for pengirimanDataRiwayatPerjalananPenyakitService", async () => {
    //     // ... implementation ...
    // });
});

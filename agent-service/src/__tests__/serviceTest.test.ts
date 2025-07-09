import * as fs from "fs";
import * as path from "path"; // Use path for cross-platform compatibility

// Service Imports
import dataKunjunganRawatInapService from "../services/dataKunjunganRawatInapService";
import pengirimanDataAnamnesisService from "../services/pengirimanDataAnamnesisService";
import pengirimanDataCaraKeluardariRumahSakitService from "../services/pengirimanDataCaraKeluardariRumahSakitService";
import pengirimanDataDiagnosisService from "../services/pengirimanDataDiagnosisService";
import pengirimanDataDietService from "../services/pengirimanDataDietService";
import pengirimanDataEdukasiService from "../services/pengirimanDataEdukasiService";
import pengirimanDataHasilPemeriksaanFisikService from "../services/pengirimanDataHasilPemeriksaanFisikService";
import pengirimanDataInstruksiMedikdanKeperawatanService from "../services/pengirimanDataInstruksiMedikdanKeperawatanService";
import pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService from "../services/pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService";
import pengirimanDataKondisiSaatMeninggalkanRumahSakitService from "../services/pengirimanDataKondisiSaatMeninggalkanRumahSakitService";
import pengirimanDataPengeluaranObatService from "../services/pengirimanDataPengeluaranObatService"; // Corrected import name
import pengirimanDataPemberianObatService from "../services/pengirimanDataPemberianObatService";
import pengirimanDataPemeriksaanFungsionalService from "../services/pengirimanDataPemeriksaanFungsionalService";
import pengirimanDataPemeriksaanPenunjangLaboratoriumService from "../services/pengirimanDataPemeriksaanPenunjangLaboratoriumService";
import pengirimanDataPemeriksaanPenunjangRadiologiService from "../services/pengirimanDataPemeriksaanPenunjangRadiologiService";
import pengirimanDataPemulanganPasienService from "../services/pengirimanDataPemulanganPasienService";
import pengirimanDataPengkajianResepService from "../services/pengirimanDataPengkajianResepService";
import pengirimanDataPenilaianRisikoService from "../services/pengirimanDataPenilaianRisikoService";
import pengirimanDataPeresepanObatService from "../services/pengirimanDataPeresepanObatService"; // Corrected import name
import pengirimanDataPrognosisService from "../services/pengirimanDataPrognosisService";
import pengirimanDataRasionalKlinisService from "../services/pengirimanDataRasionalKlinisService";
import pengirimanDataRencanaTindakLanjutService from "../services/pengirimanDataRencanaTindakLanjutService";
import pengirimanDataResumeMedisService from "../services/pengirimanDataResumeMedisService";
import pengirimanDataRiwayatPerjalananPenyakitService from "../services/pengirimanDataRiwayatPerjalananPenyakitService";
import pengirimanDataTindakanProsedurMedisService from "../services/pengirimanDataTindakanProsedurMedisService";
import pengirimanDataTujuanPerawatanService from "../services/pengirimanDataTujuanPerawatanService";

// Repository Imports
import dapatkanDataAnamnesis from "../repositories/pengirimanDataAnamnesis";
import dapatkanHasilPemeriksaanFisik from "../repositories/pengirimanDataHasilPemeriksaanFisik";
import dapatkanPeresepanObat from "../repositories/pengirimanDataPeresepanObat";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import dapatkanPemeriksaanLab from "../repositories/pengirimanDataPemeriksaanPenunjangLaboratorium";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";
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
import dapatkanRiwayatPerjalananPenyakit from "../repositories/pengirimanDataRiwayatPerjalananPenyakit";
import dapatkanDataTindakanProsedurMedis from "../repositories/pengirimanDataTindakanProsedurMedis";
import dapatkanDataTujuanPerawatan from "../repositories/pengirimanDataTujuanPerawatan";
import dapatkanDataCaraKeluarDariRumahSakit from "../repositories/pengirimanDataCaraKeluardariRumahSakit";

// Utility and Interface Imports
import {
    KunjunganRawatInap,
    dataAnamnesis,
    dataHasilPemeriksaanFisik,
    dataPengeluaranObat,
    dataPemeriksaanLab,
    dataPeresepanObat,
    ConditionRow,
    dataRiwayatPerjalananPenyakit,
    DietDbRow,
    EdukasiDbRow,
    InstruksiMedikKeperawatanDbRow,
    InstruksiTindakLanjutDbRow,
    KondisiSaatPulangDbRow,
    DataPemberianObatFromRepo,
    PemeriksaanFungsionalDbRow,
    DataPemeriksaanRadiologiFromRepo,
    DataPemulanganPasienFromRepo,
    PengkajianResepDbRow,
    PenilaianRisikoDbRow,
    PrognosisDbRow,
    RasionalKlinisDbRow,
    RencanaTindakLanjutDbRow,
    ResumeMedisDbRow,
    DataTindakanProsedurMedisFromRepo,
    TujuanPerawatanDbRow,
    CaraKeluarDbRow,
} from "../utils/interface";
import { writeJSONBundlePasien } from "../utils/fsJson";
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
    RiwayatPerjalananPenyakit: KunjunganRawatInap; // Added for clarity, uses Anamnesis data
}
// Constants used across tests
const ORGANIZATION_ID = "45f9b617-7bd7-4136-8803-5727aa0b890c";
const LOCATION_ID = "85df32eb-7b0a-4ab2-9867-5309d2b9d944";
const LOCATION_NAME = "POLI UMUM";
// const OUTPUT_DIR = path.join("app", "job_files"); // Align with writeJSONBundlePasien's default base
const OUTPUT_DIR = "agent-service/app/job_files"; // Align with writeJSONBundlePasien's default base
const ENCOUNTER = "22928d1c-2c2f-47a3-936a-b788484846af";

// --- Mock Data (Unchanged as requested) ---
const mockDataMasterPasien: MockDataMasterPasien = {
    // Patient ID and Name will be overridden by baseMockKunjungan values below
    KunjunganRawatInap: {
        org_id: "2143952e-a416-44ef-9085-20d551044c08",
        registration_id: "RJ08122022-00001",
        encounter_id: "c8de0f00-5b00-a33b-9afb-8189ee610ea9",
        arrived: "2022-12-08T02:16:57.000Z",
        in_progress: "2022-12-08T02:21:48.000Z",
        finished: "2022-12-08T02:22:32.000Z",
        patient_id: "P02478375538", // Will be overridden
        patient_name: "Ardianto Putra", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
        period_start: "2022-12-08T02:16:57.000Z",
        period_end: "2022-12-08T02:22:32.000Z",
        diagnosa: [
            {
                condition: [
                    {
                        condition_uuid: "0f6fab00-0c00-10c3-54e3-6b84d7116f1e",
                        condition_nama: "Abdominal rigidity",
                        condition_kode: "R19.3",
                        tanggal: "2022-09-12T03:14:45",
                    },
                ],
                patient_id: "P00515344124",
                patient_name: "ANDHIKA MEGA KURNIAWAN",
                pendaftaran_uuid: "af345700-6200-e30a-ad9c-ae88cbb10892",
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
        patient_id: "P02478375538", // Will be overridden
        patient_name: "REVA ANDHARA KIRANA, TN", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
        patient_id: "P02280547535", // Will be overridden
        patient_name: "Salsabila Anjani Rizki", // Will be overridden
        practitioner_id: "10018452434",
        practitioner_name: "dr. Nathalie Tan, Sp.PK.",
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
        org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
        registration_id: "RJ27092022-00005",
        encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P02280547535", // Will be overridden
        patient_name: "Salsabila Anjani Rizki", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
    PengeluaranObat: {
        org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
        registration_id: "RJ27092022-00005",
        encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P02428473601", // Will be overridden
        patient_name: "Syarif Muhammad", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
        org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
        // registration_id: "LA11062024-00002",
        registration_id: "LA11062024-00001",
        encounter_id: "64b0f600-6b00-5565-3b10-6c6855d104c0",
        arrived: "2022-09-27T14:11:06.000Z",
        in_progress: "2022-09-27T14:11:25.000Z",
        finished: "2022-09-27T14:16:30.000Z",
        patient_id: "P02428473601", // Will be overridden
        patient_name: "Syarif Muhammad", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
        org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
        registration_id: "RJ03062024-00013",
        encounter_id: "e446af00-fa00-3584-0c40-35545b61055d",
        arrived: "2024-06-03T14:42:51.000Z",
        in_progress: "2024-06-03T15:58:35.000Z",
        finished: "2024-06-03T15:58:35.000Z",
        patient_id: "P02478375538", // Will be overridden
        patient_name: "Ardianto Putra", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
    RiwayatPerjalananPenyakit: {
        org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
        registration_id: "RJ01042024-00001",
        encounter_id: "e446af00-fa00-3584-0c40-35545b61055d",
        arrived: "2024-06-03T14:42:51.000Z",
        in_progress: "2024-06-03T15:58:35.000Z",
        finished: "2024-06-03T15:58:35.000Z",
        patient_id: "P02280547535", // Will be overridden
        patient_name: "Salsabila Anjani Rizki", // Will be overridden
        practitioner_id: "10009880728",
        practitioner_name: "dr. Alexander",
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
}; // Keep existing mockDataMasterPasien

// --- New Unified Mock Data ---
const baseMockKunjungan: KunjunganRawatInap = {
    org_id: "45f9b617-7bd7-4136-8803-5727aa0b890c",
    registration_id: "RJ01012023-00001", // Generic registration ID
    encounter_id: ENCOUNTER,
    arrived: new Date("2023-01-01T08:00:00.000Z").toISOString(),
    in_progress: new Date("2023-01-01T08:05:00.000Z").toISOString(),
    finished: new Date("2023-01-01T10:00:00.000Z").toISOString(),
    patient_id: "P02478375538",
    patient_name: "Ardianto Putra",
    practitioner_id: "10009880728",
    practitioner_name: "dr. Alexander",
    period_start: new Date("2023-01-01T08:00:00.000Z").toISOString(),
    period_end: new Date("2023-01-01T10:00:00.000Z").toISOString(),
    diagnosa: [
        // Example diagnosa, adjust as needed for specific tests
        // This structure matches ConditionObject for dataKunjunganRawatInapService if used with baseMockKunjungan
        // However, dataKunjunganRawatInapService test uses mockDataMasterPasien.KunjunganRawatInap.diagnosa which is ConditionRow[]
        // For other services, this field might not be directly used or will be fetched by their specific repositories.
        // For simplicity, we'll keep it as an example.
    ],
    location_poli_id: "85df32eb-7b0a-4ab2-9867-5309d2b9d944",
    unit_nama: "POLI UMUM", // Assuming this is consistent
};

// Override patient_id, patient_name, and encounter_id in mockDataMasterPasien
for (const key in mockDataMasterPasien) {
    const KunjunganKey = key as keyof MockDataMasterPasien;
    mockDataMasterPasien[KunjunganKey].patient_id =
        baseMockKunjungan.patient_id;
    mockDataMasterPasien[KunjunganKey].patient_name =
        baseMockKunjungan.patient_name;
    mockDataMasterPasien[KunjunganKey].encounter_id = ENCOUNTER;
}
// --- End Mock Data ---

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
    const checkFileExists = (generatedFilename: string): void => {
        const filePath = path.join(OUTPUT_DIR, generatedFilename);
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
        const conditions = mockKunjungan.diagnosa as ConditionRow[];

        const result = await dataKunjunganRawatInapService(
            mockKunjungan,
            ORGANIZATION_ID,
            conditions,
            LOCATION_ID,
            LOCATION_NAME,
        );

        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_KunjunganRawatInap.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataAnamnesisService", async () => {
        const mockKunjungan = mockDataMasterPasien.Anamnesis;
        const startDate = "03-06-2024 00:00:00";
        const endDate = "03-06-2024 23:59:00";

        const repoResult = await dapatkanDataAnamnesis(mockKunjungan);
        const mockDataAnamnesis = handleRepositoryError(
            repoResult,
            "dapatkanDataAnamnesis",
        );

        const result = await pengirimanDataAnamnesisService(
            mockKunjungan,
            mockDataAnamnesis,
        );

        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_Anamnesis.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataHasilPemeriksaanFisikService", async () => {
        const mockKunjungan = mockDataMasterPasien.PemeriksaanFisik;

        const repoResult = await dapatkanHasilPemeriksaanFisik(mockKunjungan);
        const mockDataPemeriksaanFisik = handleRepositoryError(
            repoResult,
            "dapatkanDataPemeriksaanFisik",
        );

        const result = await pengirimanDataHasilPemeriksaanFisikService(
            mockKunjungan,
            mockDataPemeriksaanFisik,
        );
        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemeriksaanFisik.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPeresepanObatService", async () => {
        const mockKunjungan = mockDataMasterPasien.PeresepanObat;

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
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PeresepanObat.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPengeluaranObatService", async () => {
        const mockKunjungan = mockDataMasterPasien.PengeluaranObat;

        const repoResult = await dapatkanPengeluaranObat(mockKunjungan);
        const mockDataPengeluaranObat = handleRepositoryError(
            repoResult,
            "daparkanDataPengeluaranObat",
        );

        const result = await pengirimanDataPengeluaranObatService(
            mockKunjungan,
            mockDataPengeluaranObat,
            LOCATION_NAME,
        );
        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PengeluaranObat.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPemeriksaanPenunjangLaboratoriumService", async () => {
        const mockKunjungan = mockDataMasterPasien.PemeriksaanLab;

        const repoResult = await dapatkanPemeriksaanLab(mockKunjungan);
        const mockDataPemeriksaanLab = handleRepositoryError(
            repoResult,
            "dapatkanPemeriksaanPenunjangLaboratorium",
        );

        const result =
            await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                mockDataPemeriksaanLab,
                mockKunjungan,
            );
        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemeriksaanLab.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataDiagnosisService", async () => {
        const mockKunjungan = mockDataMasterPasien.Diagnosa;
        const startDate = "03-06-2024 00:00:00";
        const endDate = "03-06-2024 23:59:00";

        const repoResult = await dapatkanDataDiagnosis(mockKunjungan);
        const mockDataDiagnosis = handleRepositoryError(
            repoResult,
            "dapatkanDataDiagnosis",
        );

        const result = await pengirimanDataDiagnosisService(
            mockKunjungan,
            mockDataDiagnosis,
        );
        expect(result).toBeDefined();
        const filename = `${mockKunjungan.registration_id}_${mockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_Diagnosa.json`;
        const savedFile = await writeJSONBundlePasien(
            result,
            mockKunjungan,
            filename,
        );
        checkFileExists(savedFile);
    });

    // --- Tests using baseMockKunjungan ---

    it("should generate JSON for pengirimanDataRiwayatPerjalananPenyakitService", async () => {
        const repoResult = await dapatkanRiwayatPerjalananPenyakit(
            mockDataMasterPasien.RiwayatPerjalananPenyakit,
        );
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanRiwayatPerjalananPenyakit",
        ) as dataRiwayatPerjalananPenyakit[];
        const result = await pengirimanDataRiwayatPerjalananPenyakitService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_RiwayatPerjalananPenyakit.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataDietService", async () => {
        const repoResult = await dapatkanDataDiet(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dadapatkanDataDiet",
        ) as DietDbRow[];
        const result = await pengirimanDataDietService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_Diet.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataEdukasiService", async () => {
        const repoResult = await dapatkanDataEdukasi(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataEdukasi",
        ) as EdukasiDbRow[];
        const result = await pengirimanDataEdukasiService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_Edukasi.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataInstruksiMedikdanKeperawatanService", async () => {
        const repoResult =
            await dapatkanDataInstruksiMedikdanKeperawatan(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataInstruksiMedikdanKeperawatan",
        ) as InstruksiMedikKeperawatanDbRow[];
        const result = await pengirimanDataInstruksiMedikdanKeperawatanService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_InstruksiMedikKeperawatan.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService", async () => {
        const repoResult =
            await dapatkanDataInstruksiTindakLanjut(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujuk",
        ) as InstruksiTindakLanjutDbRow[];
        const result =
            await pengirimanDataInstruksiTindakLanjutdanSaranaTransportasiuntukRujukService(
                baseMockKunjungan,
                mockData,
            );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_InstruksiTindakLanjutRujuk.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataKondisiSaatMeninggalkanRumahSakitService", async () => {
        const repoResult =
            await dapatkanDataKondisiSaatMeninggalkanRumahSakit(
                baseMockKunjungan,
            );
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataKondisiSaatMeninggalkanRumahSakit",
        ) as KondisiSaatPulangDbRow[];
        const result =
            await pengirimanDataKondisiSaatMeninggalkanRumahSakitService(
                baseMockKunjungan,
                mockData,
            );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_KondisiMeninggalkanRS.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPemberianObatService", async () => {
        const repoResult = await dapatkanDataPemberianObat(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPemberianObat",
        ) as DataPemberianObatFromRepo;
        const result = await pengirimanDataPemberianObatService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemberianObat.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPemeriksaanFungsionalService", async () => {
        const repoResult =
            await dapatkanDataPemeriksaanFungsional(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPemeriksaanFungsional",
        ) as PemeriksaanFungsionalDbRow[];
        const result = await pengirimanDataPemeriksaanFungsionalService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemeriksaanFungsional.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPemeriksaanPenunjangRadiologiService", async () => {
        const repoResult =
            await dapatkanDataPemeriksaanPenunjangRadiologi(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPemeriksaanPenunjangRadiologi",
        ) as DataPemeriksaanRadiologiFromRepo;
        const result = await pengirimanDataPemeriksaanPenunjangRadiologiService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemeriksaanRadiologi.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPemulanganPasienService", async () => {
        const repoResult =
            await dapatkanDataPemulanganPasien(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataDietPemulanganPasien",
        ) as DataPemulanganPasienFromRepo;
        const result = await pengirimanDataPemulanganPasienService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PemulanganPasien.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPengkajianResepService", async () => {
        const repoResult = await dapatkanDataPengkajianResep(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPengkajianResep",
        ) as PengkajianResepDbRow[];
        const result = await pengirimanDataPengkajianResepService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PengkajianResep.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPenilaianRisikoService", async () => {
        const repoResult = await dapatkanDataPenilaianRisiko(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPenilaianRisiko",
        ) as PenilaianRisikoDbRow[];
        const result = await pengirimanDataPenilaianRisikoService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_PenilaianRisiko.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataPrognosisService", async () => {
        const repoResult = await dapatkanDataPrognosis(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataPrognosis",
        ) as PrognosisDbRow[];
        const result = await pengirimanDataPrognosisService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_Prognosis.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataRasionalKlinisService", async () => {
        const repoResult = await dapatkanDataRasionalKlinis(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataRasionalKlinis",
        ) as RasionalKlinisDbRow[];
        const result = await pengirimanDataRasionalKlinisService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_RasionalKlinis.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataRencanaTindakLanjutService", async () => {
        const repoResult =
            await dapatkanDataRencanaTindakLanjut(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataRencanaTindakLanjut",
        ) as RencanaTindakLanjutDbRow[];
        const result = await pengirimanDataRencanaTindakLanjutService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_RencanaTindakLanjut.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataResumeMedisService", async () => {
        const repoResult = await dapatkanDataResumeMedis(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataResumeMedis",
        ) as ResumeMedisDbRow[];
        const result = await pengirimanDataResumeMedisService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_ResumeMedis.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataTindakanProsedurMedisService", async () => {
        const repoResult =
            await dapatkanDataTindakanProsedurMedis(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataTindakanProsedurMedis",
        ) as DataTindakanProsedurMedisFromRepo;
        const result = await pengirimanDataTindakanProsedurMedisService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_TindakanProsedurMedis.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataTujuanPerawatanService", async () => {
        const repoResult = await dapatkanDataTujuanPerawatan(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataTujuanPerawatan",
        ) as TujuanPerawatanDbRow[];
        const result = await pengirimanDataTujuanPerawatanService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_TujuanPerawatan.json`,
        );
        checkFileExists(savedFile);
    });

    it("should generate JSON for pengirimanDataCaraKeluardariRumahSakitService", async () => {
        const repoResult =
            await dapatkanDataCaraKeluarDariRumahSakit(baseMockKunjungan);
        const mockData = handleRepositoryError(
            repoResult,
            "dapatkanDataCaraKeluarDariRumahSakit",
        ) as CaraKeluarDbRow[];
        const result = await pengirimanDataCaraKeluardariRumahSakitService(
            baseMockKunjungan,
            mockData,
        );
        expect(result).toBeDefined();
        const savedFile = await writeJSONBundlePasien(
            result,
            baseMockKunjungan,
            `${baseMockKunjungan.registration_id}_${baseMockKunjungan.patient_name.replace(/[\s,.]+/g, "_")}_CaraKeluarRS.json`,
        );
        checkFileExists(savedFile);
    });
});

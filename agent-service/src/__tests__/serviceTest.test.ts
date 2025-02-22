import dataKunjunganRawatInapService from "../services/dataKunjunganRawatInapService";
import pengirimanDataAnamnesisService from "../services/pengirimanDataAnamnesisService";
import pengirimanDataHasilPemeriksaanFisikService from "../services/pengirimanDataHasilPemeriksaanFisikService";
import pengirimanDataPengeluaranObat from "../services/pengirimanDataPengeluaranObatService";
import pengirimanDataPeresepanObat from "../services/pengirimanDataPeresepanObatService";
import pengirimanDataPemeriksaanPenunjangLaboratoriumService from "../services/pengirimanDataPemeriksaanPenunjangLaboratoriumService";
import {
    KunjunganRawatInap,
    dataAnamnesis,
    dataHasilPemeriksaanFisik,
    dataPengeluaranObat,
    dataPemeriksaanLab,
    dataPeresepanObat,
    ConditionRow,
} from "../utils/interface";
import dapatkanDataAnamnesis from "../repositories/pengirimanDataAnamnesis";
import { writeJSON } from "../utils/fsJson";
import * as fs from "fs";
import dapatkanHasilPemeriksaanFisik from "../repositories/pengirimanDataHasilPemeriksaanFisik";
import AppError from "../utils/errorHandler";
import dapatkanPeresepanObat from "../repositories/pengirimanDataPeresepanObat";
import dapatkanPengeluaranObat from "../repositories/pengirimanDataPengeluaranObat";
import dapatkanPemeriksaanLab from "../repositories/pengirimanDataPemeriksaanPenunjangLaboratorium";
import dapatkanDataDiagnosis from "../repositories/pengirimanDataDiagnosis";
import pengirimanDataDiagnosisService from "../services/pengirimanDataDiagnosisService";

interface MockDataMasterPasien {
    KunjunganRawatInap: KunjunganRawatInap;
    Anamnesis: KunjunganRawatInap;
    PemeriksaanFisik: KunjunganRawatInap;
    PeresepanObat: KunjunganRawatInap;
    PemeriksaanLab: KunjunganRawatInap;
    Diagnosa: KunjunganRawatInap;
}

describe("Services Tests", () => {
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
            arrived: "2024-07-18T10:43:10.000Z", // ISO 8601 format
            in_progress: "2024-07-18T10:43:10.000Z", // ISO 8601 format
            finished: "2024-07-18T10:43:10.000Z", // ISO 8601 format
            patient_id: "P02280547535",
            patient_name: "SULASTRI NINGSIH, NYONYA",
            practitioner_id: "10018452434",
            practitioner_name: "Tenaga Medis 91495 (Mitra Medika)",
            period_start: "2024-07-18T10:43:10.000Z", // ISO 8601 format
            period_end: "2024-07-18T10:43:10.000Z", // ISO 8601 format
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
        PemeriksaanLab: {
            org_id: "2143952e-a416-44ef-9085-20d551044c08",
            registration_id: "RJ27092022-00005",
            encounter_id: "35d37800-3c00-b319-215e-0a913d31003a",
            arrived: "2022-09-27T14:11:06.000Z", // ISO 8601 format
            in_progress: "2022-09-27T14:11:25.000Z", // ISO 8601 format
            finished: "2022-09-27T14:16:30.000Z", // ISO 8601 format
            patient_id: "P00515344124",
            patient_name: "ANDHIKA MEGA KURNIAWAN",
            practitioner_id: "10009880728",
            practitioner_name: "TIARA PRAMAESYA",
            period_start: "2022-09-27T14:11:06.000Z", // ISO 8601 format
            period_end: "2022-09-27T14:16:30.000Z", // ISO 8601 format
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
    const OrganizationID = "2143952e-a416-44ef-9085-20d551044c08";
    const LocationID = "85df32eb-7b0a-4ab2-9867-5309d2b9d944";
    const LocationName = "POLI UMUM";

    beforeEach(() => {
        // Ensure directory exists before each test
        if (!fs.existsSync("json/patient")) {
            fs.mkdirSync("json/patient", { recursive: true });
        }
    });

    afterEach(() => {
        // Clean up the test directory after each test
        // This might be needed depending how writeJSON works
        // fs.rmdirSync("json/patient", { recursive: true });
    });

    it("should generate JSON for dataKunjunganRawatInapService", async () => {
        const conditions: any[] = [];
        const result = await dataKunjunganRawatInapService(
            mockDataMasterPasien.KunjunganRawatInap,
            OrganizationID,
            conditions,
            LocationID,
            LocationName,
        );
        expect(result).toBeDefined();
        await writeJSON(
            result,
            `${mockDataMasterPasien.KunjunganRawatInap.patient_name}_Kunjungan Rawat Inap`,
        );

        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.KunjunganRawatInap.patient_name}_Kunjungan Rawat Inap.json`,
            ),
        ).toBe(true);
    });

    it("should generate JSON for pengirimanDataAnamnesisService", async () => {
        const mockDataAnamnesis: dataAnamnesis | AppError =
            await dapatkanDataAnamnesis(
                mockDataMasterPasien.Anamnesis,
                "03-06-2024 00:00:00",
                "03-06-2024 23:59:00",
            );

        if (mockDataAnamnesis instanceof Error) {
            fail(
                "dapatkanDataAnamnesis returned an error: " +
                    mockDataAnamnesis.message,
            );
        }

        const result = await pengirimanDataAnamnesisService(
            mockDataMasterPasien.Anamnesis,
            mockDataAnamnesis,
        );
        expect(result).toBeDefined();
        await writeJSON(
            result,
            `${mockDataMasterPasien.Anamnesis.patient_name}_Data Anamnesis`,
        );
        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.Anamnesis.patient_name}_Data Anamnesis.json`,
            ),
        ).toBe(true);
    });

    // Repeat similar tests for other services:
    it("should generate JSON for pengirimanDataHasilPemeriksaanFisikService", async () => {
        const mockDataHasilPemeriksaanFisik:
            | dataHasilPemeriksaanFisik[]
            | AppError = await dapatkanHasilPemeriksaanFisik(
            mockDataMasterPasien.PemeriksaanFisik,
        );

        if (mockDataHasilPemeriksaanFisik instanceof AppError) {
            fail(
                "dapatkanHasilPemeriksaanFisik returned an error: " +
                    mockDataHasilPemeriksaanFisik.message,
            );
        }

        const result = await pengirimanDataHasilPemeriksaanFisikService(
            mockDataMasterPasien.PemeriksaanFisik,
            mockDataHasilPemeriksaanFisik,
        );

        expect(result).toBeDefined();
        await writeJSON(
            result,
            `${mockDataMasterPasien.PemeriksaanFisik.patient_name}_Pemeriksaan Fisik`,
        );
        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.PemeriksaanFisik.patient_name}_Pemeriksaan Fisik.json`,
            ),
        ).toBe(true);
    });

    it("should generate JSON for pengirimanDataPeresepanObat", async () => {
        const mockDataPeresepanObat: dataPeresepanObat | AppError =
            await dapatkanPeresepanObat(mockDataMasterPasien.PeresepanObat);

        if (mockDataPeresepanObat instanceof AppError) {
            fail(
                "dapatkanPeresepanObat returned an error: " +
                    mockDataPeresepanObat.message,
            );
        }

        const result = await pengirimanDataPeresepanObat(
            mockDataMasterPasien.PeresepanObat,
            mockDataPeresepanObat,
        );

        expect(result).toBeDefined();

        expect(result).toBeDefined();
        await writeJSON(
            result,
            `${mockDataMasterPasien.PeresepanObat.patient_name}_Peresepan Obat`,
        );
        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.PeresepanObat.patient_name}_Peresepan Obat.json`,
            ),
        ).toBe(true);
    });

    it("should generate JSON for pengirimanDataPengeluaranObat", async () => {
        const mockDataPengeluaranObat: dataPengeluaranObat | AppError =
            await dapatkanPengeluaranObat(mockDataMasterPasien.PeresepanObat);

        if (mockDataPengeluaranObat instanceof AppError) {
            fail(
                "dapatkanPengeluaranObat returned an error: " +
                    mockDataPengeluaranObat.message,
            );
        }

        const result = await pengirimanDataPengeluaranObat(
            mockDataMasterPasien.PeresepanObat,
            mockDataPengeluaranObat,
            LocationName,
        );
        expect(result).toBeDefined();

        await writeJSON(
            result,
            `${mockDataMasterPasien.PeresepanObat.patient_name}_Pengeluaran Obat`,
        );
        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.PeresepanObat.patient_name}_Pengeluaran Obat.json`,
            ),
        ).toBe(true);
    });

    it("should generate JSON for pengirimanDataPemeriksaanPenunjangLaboratoriumService", async () => {
        const mockDataPemeriksaanLab: dataPemeriksaanLab | AppError =
            await dapatkanPemeriksaanLab(mockDataMasterPasien.PemeriksaanLab);

        if (mockDataPemeriksaanLab instanceof AppError) {
            fail(
                "dapatkanPemeriksaanLab returned an error: " +
                    mockDataPemeriksaanLab.message,
            );
        }

        const result =
            await pengirimanDataPemeriksaanPenunjangLaboratoriumService(
                mockDataPemeriksaanLab,
            );
        expect(result).toBeDefined();

        await writeJSON(
            result,
            `${mockDataMasterPasien.PemeriksaanLab.patient_name}_Pemeriksaan Lab`,
        );

        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.PemeriksaanLab.patient_name}_Pemeriksaan Lab.json`,
            ),
        ).toBe(true);
    });

    it("should generate JSON for pengirimanDataDiagnosisService", async () => {
        const mockDataDiagnosis: ConditionRow[] | AppError =
            await dapatkanDataDiagnosis(
                mockDataMasterPasien.Diagnosa,
                "03-06-2024 00:00:00",
                "03-06-2024 23:59:00",
            );

        if (mockDataDiagnosis instanceof AppError) {
            fail(
                "dapatkanDataDiagnosis returned an error: " +
                    mockDataDiagnosis.message,
            );
        }

        const result = await pengirimanDataDiagnosisService(
            mockDataMasterPasien.Diagnosa,
            mockDataDiagnosis,
        );
        expect(result).toBeDefined();

        await writeJSON(
            result,
            `${mockDataMasterPasien.Diagnosa.patient_name}_Diagnosa`,
        );

        expect(
            fs.existsSync(
                `json/patient/${mockDataMasterPasien.Diagnosa.patient_name}_Diagnosa.json`,
            ),
        ).toBe(true);
    });

    // it("should generate JSON for pengirimanDataRiwayatPerjalananPenyakitService", async () => {
    //     const mockDataRiwayatPerjalananPenyakit: dataRiwayatPerjalananPenyakit[] =
    //         [
    //             /* Mock data */
    //         ];

    //     const result = await pengirimanDataRiwayatPerjalananPenyakitService(
    //         mockDataMasterPasien,
    //         mockDataRiwayatPerjalananPenyakit,
    //     );
    //     expect(result).toBeDefined();
    //     // ... assertions and writeJSON
    // });
});

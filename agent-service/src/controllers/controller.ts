// import { Request, Response } from "express";
// import pendaftaranPasienService from "../services/pendaftaranPasienService";
// import pendaftaranKunjunganRawatInapService from "../services/dataKunjunganRawatInapService";
// import pengirimanDataHasilPemeriksaanFisikService from "../services/pengirimanDataHasilPemeriksaanFisikService";

// export async function pendaftaranPasien(req: Request, res: Response) {
//     try {
//         const result = await pendaftaranPasienService();
//         res.json(JSON.parse(result as string));
//     } catch (err) {
//         console.error("Error in pendaftaran_pasien:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// export async function pendaftaranKunjunganRawatInap(
//     req: Request,
//     res: Response,
// ) {
//     try {
//         const result = await pendaftaranKunjunganRawatInapService();
//         res.json(JSON.parse(result as string));
//     } catch (err) {
//         console.error("Error in pendaftaran_kunjungan_rawat_inap:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// export async function pengirimanDataAnamnesis(req: Request, res: Response) {
//     try {
//         const result = await pendaftaranKunjunganRawatInapService();
//         res.json(JSON.parse(result as string));
//     } catch (err) {
//         console.error("Error in pendaftaran_kunjungan_rawat_inap:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

// export async function pengirimanDataHasilPemeriksaanFisik(
//     req: Request,
//     res: Response,
// ) {
//     try {
//         const result = await pengirimanDataHasilPemeriksaanFisikService();
//         res.json(JSON.parse(result as string));
//     } catch (err) {
//         console.error("Error in pendaftaran_kunjungan_rawat_inap:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// }

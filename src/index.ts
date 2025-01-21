import express, { Request, Response, NextFunction, Router } from "express";
// import {
//     pendaftaranPasien,
//     pendaftaranKunjunganRawatInap,
//     pengirimanDataAnamnesis,
//     pengirimanDataHasilPemeriksaanFisik,
// } from "./controllers/controller";
import AppError from "./utils/errorHandler";
import { globalErrorHandler } from "./controllers/errorController";
import { main } from "./services/main";

const app = express();

const PORT = 3000;

const router = Router();

// router.get("/", async (req, res) => {
//     pendaftaranPasien(req, res);
// });

// router.get("/pendaftaran_kunjungan_rawat_inap", async (req, res) => {
//     pendaftaranKunjunganRawatInap(req, res);
// });

// router.get("/data_anamnesis", async (req, res) => {
//     pengirimanDataAnamnesis(req, res);
// });

// router.get("/hasil_pemeriksaan_fisik", async (req, res) => {
//     pengirimanDataHasilPemeriksaanFisik(req, res);
// });

router.get("/process-data", main);

app.use("/api/v1", router);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    globalErrorHandler(err, req, res, next);
});

app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});

module.exports = router;

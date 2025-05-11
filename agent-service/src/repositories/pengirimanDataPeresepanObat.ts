import AppError from "../utils/errorHandler";
import { dataPeresepanObat, KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanPeresepanObat(
    dataMasterPasien: KunjunganRawatInap,
): Promise<dataPeresepanObat | AppError> {
    try {
        const medicationQueryText = `
                SELECT
                    resepdet_uuid AS medication_uuid,
                    resepdet_racikan AS racikan,
                    t_resepdet.resepdet_id,
                    t_resepdet.resepdet_resep_id,
                    barang_kode AS identifier_value,
                    barangihs_kode AS code_coding_code,
                    barangihs_nama AS code_coding_display,
                    satuanihs_link AS form_coding_system,
                    satuanihs_kode AS form_coding_code,
                    satuanihs_nama AS form_coding_display,
                    zat_aktif_racikan.ingredient_racikan,
                    zat_aktif_non_racikan.barangzataktifihs_kode AS itemCodeableConcept_coding_code,
                    zat_aktif_non_racikan.barangzataktifihs_nama AS itemCodeableConcept_coding_display,
                    zat_aktif_non_racikan.barangzataktif_nilai_denom AS ingredient_strength_denominator_value,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_link ELSE bentukjadi_ihs_link 
                    END AS strength_denominator_system,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_kode ELSE bentukjadi_ihs_kode 
                    END AS strength_denominator_code 
                FROM
                    t_resep
                    JOIN t_resepdet ON resepdet_resep_id = resep_id
                    LEFT JOIN m_barang ON barang_id = resepdet_barang_id
                    LEFT JOIN m_barang_ihs ON barangihs_id = m_barangihs_id
                    LEFT JOIN m_barang_varian_ihs ON barangvarian_ihs_id = m_barangvarianihs_id
                    LEFT JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_barang_satuandenomihs_id
                    JOIN (
                    SELECT
                        satuan_id,
                        satuan_kode,
                        satuan_nama,
                        m_satuanihs_id,
                        m_bentukjadi_ihs_id,
                        bentukjadi_ihs_kode AS satuan_bentukjadi_ihs_kode,
                        bentukjadi_ihs_nama AS satuan_bentukjadi_ihs_nama,
                        bentukjadi_ihs_link AS satuan_bentukjadi_ihs_link 
                    FROM
                        m_satuan
                        LEFT JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_bentukjadi_ihs_id 
                    ) m_satuan ON satuan_id = resepdet_satuan_id
                    LEFT JOIN (
                    SELECT
                        resepdetracikan_resepdet_id,
                        json_agg ( json_build_object ( 'ingredient_strength_value', resepdet_barang_qty, 'ingredient_strength_kode', barangihs_kode, 'ingredient_strength_system', satuanihs_link, 'ingredient_denominator_value', resepdet_barang_kekuatan, 'ingredient_denominator_kode', bentukjadi_ihs_kode, 'ingredient_denominator_system', bentukjadi_ihs_link ) ) AS ingredient_racikan 
                    FROM
                        t_resepdet
                        JOIN (
                        SELECT
                            resepdet_id AS resepdet_parent_id,
                            resepdet_barang_nama AS resepdet_parent_barang_nama,
                            satuanihs_kode AS resepdet_parent_satuanihs_kode,
                            satuanihs_nama AS resepdet_parent_satuanihs_nama,
                            bentukjadi_ihs_kode AS resepdet_parent_bentukjadi_ihs_kode,
                            bentukjadi_ihs_nama AS resepdet_parent_bentukjadi_ihs_nama 
                        FROM
                            t_resepdet
                            JOIN m_satuan ON satuan_id = resepdet_satuan_id
                            LEFT JOIN m_satuan_ihs ON satuanihs_id = m_satuanihs_id
                            LEFT JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_bentukjadi_ihs_id 
                        WHERE
                            resepdet_racikan = 'y' 
                            AND COALESCE ( resepdetracikan_resepdet_id, 0 ) = 0 
                        ) t_resepdet_parent ON resepdet_parent_id = resepdetracikan_resepdet_id
                        JOIN m_barang ON barang_id = resepdet_barang_id
                        JOIN m_barang_ihs ON barangihs_id = m_barangihs_id
                        JOIN m_barang_varian_ihs ON barangvarian_ihs_id = m_barangvarianihs_id
                        JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_barang_satuandenomihs_id
                        JOIN m_satuan ON satuan_id = resepdet_satuan_id
                        LEFT JOIN m_satuan_ihs ON satuanihs_id = m_satuanihs_id 
                    WHERE
                        resepdet_aktif = 'y' 
                    GROUP BY
                        resepdetracikan_resepdet_id 
                    ) zat_aktif_racikan ON zat_aktif_racikan.resepdetracikan_resepdet_id = t_resepdet.resepdet_id
                    LEFT JOIN m_satuan_ihs ON satuanihs_id = m_satuanihs_id
                    LEFT JOIN m_barang_bentuk_sediaan_ihs ON barangbentuksediaanihs_keterangan = resepdet_cara_pakai
                    LEFT JOIN (
                    SELECT
                        resepdet_id,
                        barangzataktifihs_kode,
                        barangzataktifihs_nama,
                        1 AS barangzataktif_nilai_denom 
                    FROM
                        t_resepdet
                        JOIN t_resep ON resep_id = t_resepdet.resepdet_resep_id
                        JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_resep.resep_pendaftaran_id
                        JOIN m_barang ON barang_id = resepdet_barang_id
                        JOIN m_barang_zataktif ON barangzataktif_master_id = barang_id
                        LEFT JOIN m_barang_zataktif_ihs ON barangzataktif_barang_id = barangzataktifihs_id
                        LEFT JOIN m_satuan_ukuran_ihs ON barangzataktif_satuan_id = satuanukuran_ihs_id
                        LEFT JOIN m_bentuk_jadi_ihs ON m_barang_satuandenomihs_id = bentukjadi_ihs_id 
                    WHERE
                        barangzataktif_aktif = 'y' 
                    ) zat_aktif_non_racikan ON zat_aktif_non_racikan.resepdet_id = t_resepdet.resepdet_id
                    JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_resep.resep_pendaftaran_id 
                WHERE
                    t_resep.resep_aktif = 'y' 
                    AND t_resepdet.resepdet_aktif = 'y' 
                    AND t_resepdet.resepdetracikan_resepdet_id IS NULL 
                    AND t_pendaftaran.pendaftaran_no = '${dataMasterPasien.registration_id}' 
                    AND t_pendaftaran.pendaftaran_no = $1
                ORDER BY
                    resep_id ASC;
            `;
        const medicationValues = [dataMasterPasien.registration_id];

        const medicationRequestQueryText = `
                SELECT
                    resepdet_uuid AS medicationRequest_uuid,
                    resep_no AS identifier_value_1,
                    resep_no || '-' || ROW_NUMBER ( ) OVER ( PARTITION BY resep_id ORDER BY resepdet_id ) AS identifier_value_2,
                    barang_nama AS medicationReference_display,
                    m_pasien.pasien_fhir_id AS Patient_id,
                    m_pasien.pasien_nama AS Patient_Name,
                    m_pegawai.pegawai_fhir_id AS Practitioner_id,
                    m_pegawai.pegawai_nama AS Practitioner_Name,
                    t_pendaftaran.pendaftaran_uuid AS encounter,
                    resepdet_created_date AS authoredOn,
                    1 AS dosageInstruction_sequence,
                    resepdet_aturan_pakai AS dosageInstruction_text,
                    NULL AS dosageInstruction_sequence_timing_repeat_frequency,
                    1 AS dosageInstruction_sequence_timing_repeat_period,
                    'd' AS dosageInstruction_sequence_timing_repeat_periodUnit,
                    'http://www.whocc.no/atc' AS route_coding_system,
                    barangbentuksediaanihs_kode AS dosageInstruction_route_coding_code,
                    barangbentuksediaanihs_nama AS dosageInstruction_route_coding_display,
                    'http://terminology.hl7.org/CodeSystem/dose-rate-type' AS dosageInstruction_doseAndRate_type_coding_system,
                    'ordered' AS dosageInstruction_doseAndRate_type_coding_code,
                    'Ordered' AS dosageInstruction_doseAndRate_type_coding_display,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_kode ELSE bentukjadi_ihs_kode 
                    END AS dosageInstruction_doseAndRate_doseQuantity_unit,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_link ELSE bentukjadi_ihs_link 
                    END AS dosageInstruction_doseAndRate_doseQuantity_system,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_kode ELSE bentukjadi_ihs_kode 
                    END AS dosageInstruction_doseAndRate_doseQuantity_code,
                    1 AS dispenseRequest_dispenseInterval_value,
                    'day' AS dispenseRequest_dispenseInterval_unit,
                    'http://unitsofmeasure.org' AS dispenseRequest_dispenseInterval_system,
                    'd' AS dispenseRequest_dispenseInterval_code,
                    resep_created_date AS dispenseRequest_validityPeriod_start,
                    resep_created_date AS dispenseRequest_validityPeriod_end,
                    resepdet_jumlah AS dispenseRequest_quantity_value,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_kode ELSE bentukjadi_ihs_kode 
                    END AS dispenseRequest_quantity_unit,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_link ELSE bentukjadi_ihs_link 
                    END AS dispenseRequest_quantity_system,
                CASE
                        
                        WHEN resepdet_racikan = 'y' THEN
                        satuan_bentukjadi_ihs_kode ELSE bentukjadi_ihs_kode 
                    END AS dispenseRequest_quantity_code,
                    NULL AS dispenseRequest_expectedSupplyDuration_unit,
                    'http://unitsofmeasure.org' AS dispenseRequest_expectedSupplyDuration_system,
                    NULL AS dispenseRequest_expectedSupplyDuration_code,
                    NULL AS dispenseRequest_expectedSupplyDuration_value,
                    ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id 
                FROM
                    t_resep
                    JOIN t_resepdet ON resepdet_resep_id = resep_id
                    LEFT JOIN m_barang ON barang_id = resepdet_barang_id
                    LEFT JOIN m_barang_ihs ON barangihs_id = m_barangihs_id
                    LEFT JOIN m_barang_varian_ihs ON barangvarian_ihs_id = m_barangvarianihs_id
                    LEFT JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_barang_satuandenomihs_id
                    JOIN (
                    SELECT
                        satuan_id,
                        satuan_kode,
                        satuan_nama,
                        m_satuanihs_id,
                        m_bentukjadi_ihs_id,
                        bentukjadi_ihs_kode AS satuan_bentukjadi_ihs_kode,
                        bentukjadi_ihs_nama AS satuan_bentukjadi_ihs_nama,
                        bentukjadi_ihs_link AS satuan_bentukjadi_ihs_link 
                    FROM
                        m_satuan
                        LEFT JOIN m_bentuk_jadi_ihs ON bentukjadi_ihs_id = m_bentukjadi_ihs_id 
                    ) m_satuan ON satuan_id = resepdet_satuan_id
                    LEFT JOIN m_satuan_ihs ON satuanihs_id = m_satuanihs_id
                    LEFT JOIN m_barang_bentuk_sediaan_ihs ON barangbentuksediaanihs_keterangan = resepdet_cara_pakai
                    JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_resep.resep_pendaftaran_id
                    JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
                    JOIN m_pegawai ON m_pegawai.pegawai_id = t_pendaftaran.pendaftaran_dokter 
                WHERE
                    t_resep.resep_aktif = 'y' 
                    AND t_resepdet.resepdet_aktif = 'y' 
                    AND t_resepdet.resepdetracikan_resepdet_id IS NULL 
                    AND t_pendaftaran.pendaftaran_no = '${dataMasterPasien.registration_id}' 
                    AND t_pendaftaran.pendaftaran_no = $1
                ORDER BY
                    resep_id ASC;
            `;
        const medicationRequestValues = [dataMasterPasien.registration_id];

        const [medicationResult, medicationRequestResult] = await Promise.all([
            db.query(medicationQueryText, medicationValues),
            db.query(medicationRequestQueryText, medicationRequestValues),
        ]);

        const gabungData = {
            medication: medicationResult.rows,
            medicationRequest: medicationRequestResult.rows,
        };

        return gabungData;
    } catch (err) {
        console.error("Error fetching medicine prescription data:", err);
        return new AppError(
            `Error fetching medicine prescription data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

import AppError from "../utils/errorHandler";
import {
    dataPemeriksaanLab,
    diagnosticReport,
    KunjunganRawatInap,
    observationLab,
    serviceRequestLab,
    specimenLab,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanPemeriksaanLab(
    dataMasterPasien: KunjunganRawatInap,
): Promise<dataPemeriksaanLab | AppError> {
    // --- Define Parameter Values ---
    // Since the registration_id is used twice in the WHERE clause of each query
    const queryValues = [
        dataMasterPasien.registration_id,
        dataMasterPasien.registration_id,
    ];

    // --- Define SQL Query Texts with Placeholders ($1, $2) ---

    const serviceRequestQueryText = `
        SELECT
            ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
            t_pendaftaran.pendaftaran_no AS pendaftaran_id,
            pmedispasien_uuid AS servicerequest_uuid,
            pendaftaran_uuid AS encounter,
            m_penunjang_medis.penunjangmedis_id AS value, -- Added alias for clarity
            penunjangmedis_nama AS text,
            penunjangloinc_link AS system,
            penunjangloinc_kode AS code,
            penunjangloinc_nama AS display,
            pegawai_fhir_id AS practitioner_id,
            pegawai_nama AS practitioner_nama,
            m_pasien.pasien_fhir_id AS Patient_id,
            m_pasien.pasien_nama AS Patient_Name,
            pmedispasien_created_date AS authoredOn
        FROM
            t_penunjangmedis_pasien
            JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_penunjangmedis_pasien.t_pendaftaran_id
            JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            JOIN m_penunjang_medis ON m_penunjang_medis.penunjangmedis_id = t_penunjangmedis_pasien.m_penunjangmedis_id
            JOIN m_penunjang_loinc ON m_penunjang_loinc.penunjangloinc_id = m_penunjang_medis.m_penunjangloinc_id
            JOIN m_penunjang_spesimen_loinc ON m_penunjang_spesimen_loinc.penunjangspesimenloinc_id = m_penunjang_medis.m_penunjangspesimenloinc_id
            JOIN m_penunjang_metode_loinc ON m_penunjang_metode_loinc.penunjangmetodeloinc_id = m_penunjang_medis.m_penunjangmetodeloinc_id
            JOIN m_penunjang_kategori_diagnostik_loinc ON m_penunjang_kategori_diagnostik_loinc.penunjangkatdiagloinc_id = m_penunjang_medis.m_penunjangkatdiagloinc_id
            JOIN m_pegawai ON m_pegawai.pegawai_id = t_penunjangmedis_pasien.pmedispasien_dokter
        WHERE
            t_penunjangmedis_pasien.pmedispasien_aktif = 'y'
            AND pmedispasien_jenis = 2
            AND t_pendaftaran.pendaftaran_krs IS NOT NULL
            AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> ''
            AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> ''
            AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> ''
            -- Use placeholders $1 and $2 for the registration_id
            AND ( t_pendaftaran.pendaftaran_no = $1 OR t_pendaftaran.pendaftaran_id_asal = ( SELECT pendaftaran_id FROM t_pendaftaran WHERE pendaftaran_no = $2 ) )
        ORDER BY
            COALESCE ( NULLIF ( regexp_replace( penunjangmedis_urut, '[^0-9]+', '', 'g' ), '' ), '0' ) :: INTEGER ASC,
            penunjangmedis_nama ASC;
    `;

    const specimenQueryText = `
        SELECT
            ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
            pmedispasien_uuid AS servicerequest_uuid,
            pmedispasien_uuid AS specimen_uuid,
            pendaftaran_uuid AS encounter,
            pmedispasien_id AS value, -- Added alias for clarity
            penunjangspesimenloinc_link AS spesimen_system,
            penunjangspesimenloinc_kode AS spesimen_kode,
            penunjangspesimenloinc_nama AS spesimen_nama,
            penunjangmetodeloinc_link AS metode_system,
            penunjangmetodeloinc_kode AS metode_kode,
            penunjangmetodeloinc_nama AS metode_nama,
            pegawai_fhir_id AS practitioner_id,
            pegawai_nama AS practitioner_nama,
            m_pasien.pasien_fhir_id AS Patient_id,
            m_pasien.pasien_nama AS Patient_Name,
            pmedispasien_created_date AS authoredOn
        FROM
            t_penunjangmedis_pasien
            JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_penunjangmedis_pasien.t_pendaftaran_id
            JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            JOIN m_penunjang_medis ON m_penunjang_medis.penunjangmedis_id = t_penunjangmedis_pasien.m_penunjangmedis_id
            JOIN m_penunjang_loinc ON m_penunjang_loinc.penunjangloinc_id = m_penunjang_medis.m_penunjangloinc_id
            JOIN m_penunjang_spesimen_loinc ON m_penunjang_spesimen_loinc.penunjangspesimenloinc_id = m_penunjang_medis.m_penunjangspesimenloinc_id
            JOIN m_penunjang_metode_loinc ON m_penunjang_metode_loinc.penunjangmetodeloinc_id = m_penunjang_medis.m_penunjangmetodeloinc_id
            JOIN m_penunjang_kategori_diagnostik_loinc ON m_penunjang_kategori_diagnostik_loinc.penunjangkatdiagloinc_id = m_penunjang_medis.m_penunjangkatdiagloinc_id
            JOIN m_pegawai ON m_pegawai.pegawai_id = t_penunjangmedis_pasien.pmedispasien_dokter
        WHERE
            t_penunjangmedis_pasien.pmedispasien_aktif = 'y'
            AND pmedispasien_jenis = 2
            AND t_pendaftaran.pendaftaran_krs IS NOT NULL
            AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> ''
            AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> ''
            AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> ''
            -- Use placeholders $1 and $2 for the registration_id
            AND ( t_pendaftaran.pendaftaran_no = $1 OR t_pendaftaran.pendaftaran_id_asal = ( SELECT pendaftaran_id FROM t_pendaftaran WHERE pendaftaran_no = $2 ) )
        ORDER BY
            COALESCE ( NULLIF ( regexp_replace( penunjangmedis_urut, '[^0-9]+', '', 'g' ), '' ), '0' ) :: INTEGER ASC,
            penunjangmedis_nama ASC;
    `;

    const observationQueryText = `
        SELECT
            ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
            pmedispasien_uuid AS servicerequest_uuid,
            observation.observation_uuid,
            pendaftaran_uuid AS encounter,
            pmedispasien_id AS value, -- Added alias for clarity
            penunjangmedis_nama AS loinc_text,
            penunjangloinc_link AS loinc_system,
            penunjangloinc_kode AS loinc_code,
            penunjangloinc_nama AS loinc_display,
            pegawai_fhir_id AS practitioner_id,
            pegawai_nama AS practitioner_nama,
            m_pasien.pasien_fhir_id AS Patient_id,
            m_pasien.pasien_nama AS Patient_Name,
            pmedispasien_created_date AS authoredOn,
            observation.hasil_lab
        FROM
            t_penunjangmedis_pasien
            JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_penunjangmedis_pasien.t_pendaftaran_id
            JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            JOIN m_penunjang_medis ON m_penunjang_medis.penunjangmedis_id = t_penunjangmedis_pasien.m_penunjangmedis_id
            LEFT JOIN m_penunjang_loinc ON m_penunjang_loinc.penunjangloinc_id = m_penunjang_medis.m_penunjangloinc_id
            LEFT JOIN m_penunjang_spesimen_loinc ON m_penunjang_spesimen_loinc.penunjangspesimenloinc_id = m_penunjang_medis.m_penunjangspesimenloinc_id
            LEFT JOIN m_penunjang_metode_loinc ON m_penunjang_metode_loinc.penunjangmetodeloinc_id = m_penunjang_medis.m_penunjangmetodeloinc_id
            LEFT JOIN m_penunjang_kategori_diagnostik_loinc ON m_penunjang_kategori_diagnostik_loinc.penunjangkatdiagloinc_id = m_penunjang_medis.m_penunjangkatdiagloinc_id
            JOIN m_pegawai ON m_pegawai.pegawai_id = t_penunjangmedis_pasien.pmedispasien_dokter
            JOIN (
            SELECT
                pmedishasilpasien_uuid AS observation_uuid,
                t_penunjangmedispasien_id,
                json_agg (
                    json_build_object (
                        'valueQuantity_value',
                        t_pmedishasil_pasien.pmedishasilpasien_nilai,
                        'valueQuantity_unit',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_kode,
                        'valueQuantity_system',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_link,
                        'valueQuantity_code',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_kode,
                        'valueCodeableConcept_coding_system',
                        m_penunjang_nilai_param_loinc.penunjangnilaiparamloinc_link,
                        'valueCodeableConcept_coding_code',
                        m_penunjang_nilai_param_loinc.penunjangnilaiparamloinc_kode,
                        'valueCodeableConcept_coding_display',
                        m_penunjang_nilai_param_loinc.penunjangnilaiparamloinc_nama,
                        'referenceRange_low_value',
                        t_pmedishasil_pasien.pmedishasilpasien_reference_min,
                        'referenceRange_low_unit',
                        t_pmedishasil_pasien.pmedishasilpasien_satuan,
                        'referenceRange_low_sytem',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_link,
                        'referenceRange_low_code',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_kode,
                        'referenceRange_high_value',
                        t_pmedishasil_pasien.pmedishasilpasien_reference_max,
                        'referenceRange_high_unit',
                        t_pmedishasil_pasien.pmedishasilpasien_satuan,
                        'referenceRange_high_sytem',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_link,
                        'referenceRange_high_code',
                        m_satuan_ukuran_ihs.satuanukuran_ihs_kode
                    )
                ) AS hasil_lab
            FROM
                t_pmedishasil_pasien
                LEFT JOIN m_satuan_ukuran_ihs ON LOWER ( m_satuan_ukuran_ihs.satuanukuran_ihs_kode ) = LOWER ( t_pmedishasil_pasien.pmedishasilpasien_satuan )
                LEFT JOIN m_penunjang_nilai_param_loinc ON ( ',' || COALESCE ( penunjangnilaiparamloinc_keterangan, penunjangnilaiparamloinc_nama ) || ',' ) ILIKE ( '%,' || pmedishasilpasien_nilai || ',%' )
                JOIN t_penunjangmedis_pasien ON t_penunjangmedis_pasien.pmedispasien_id = t_pmedishasil_pasien.t_penunjangmedispasien_id
            GROUP BY
                pmedishasilpasien_uuid,
                t_penunjangmedispasien_id
            ) observation ON t_penunjangmedis_pasien.pmedispasien_id = observation.t_penunjangmedispasien_id
        WHERE
            t_penunjangmedis_pasien.pmedispasien_aktif = 'y'
            AND pmedispasien_jenis = 2
            AND t_pendaftaran.pendaftaran_krs IS NOT NULL
            AND COALESCE ( t_pendaftaran.pendaftaran_uuid, '' ) <> ''
            AND COALESCE ( m_pasien.pasien_fhir_id, '' ) <> ''
            AND COALESCE ( m_pegawai.pegawai_fhir_id, '' ) <> ''
            -- Use placeholders $1 and $2 for the registration_id
            AND ( t_pendaftaran.pendaftaran_no = $1 OR t_pendaftaran.pendaftaran_id_asal = ( SELECT pendaftaran_id FROM t_pendaftaran WHERE pendaftaran_no = $2 ) )
        ORDER BY
            COALESCE ( NULLIF ( regexp_replace( penunjangmedis_urut, '[^0-9]+', '', 'g' ), '' ), '0' ) :: INTEGER ASC,
            penunjangmedis_nama ASC;
    `;

    const diagnosticReportQueryText = `
        SELECT
            t_pendaftaran.pendaftaran_no AS pendaftaran_id,
            ( SELECT fhirsetup_organization_id FROM m_far_fhir_setup mffs ) AS org_id,
            pmedispasien_uuid AS servicerequest_uuid,
            pmedispasien_uuid AS specimen_uuid,
            observation.observation_uuid,
            pmedispasien_uuid AS medicationrequest_uuid, -- This seems potentially incorrect, might still be related to diagnostic report ID? Keeping as is based on original.
            pendaftaran_uuid AS encounter,
            pmedispasien_id AS value,
            penunjangmedis_nama AS loinc_text,
            penunjangloinc_link AS loinc_system,
            penunjangloinc_kode AS loinc_code,
            penunjangloinc_nama AS loinc_display,
            penunjangkatdiagloinc_link AS category_link,
            penunjangkatdiagloinc_kode AS category_kode,
            penunjangkatdiagloinc_nama AS category_nama,
            pegawai_fhir_id AS practitioner_id,
            pegawai_nama AS practitioner_nama,
            m_pasien.pasien_fhir_id AS Patient_id,
            m_pasien.pasien_nama AS Patient_Name,
            t_penunjangmedis_pasien.pmedispasien_created_date_hasil
        FROM
            t_penunjangmedis_pasien
            JOIN t_pendaftaran ON t_pendaftaran.pendaftaran_id = t_penunjangmedis_pasien.t_pendaftaran_id
            JOIN m_pasien ON m_pasien.pasien_id = t_pendaftaran.m_pasien_id
            JOIN m_penunjang_medis ON m_penunjang_medis.penunjangmedis_id = t_penunjangmedis_pasien.m_penunjangmedis_id
            LEFT JOIN m_penunjang_loinc ON m_penunjang_loinc.penunjangloinc_id = m_penunjang_medis.m_penunjangloinc_id
            LEFT JOIN m_penunjang_spesimen_loinc ON m_penunjang_spesimen_loinc.penunjangspesimenloinc_id = m_penunjang_medis.m_penunjangspesimenloinc_id
            LEFT JOIN m_penunjang_metode_loinc ON m_penunjang_metode_loinc.penunjangmetodeloinc_id = m_penunjang_medis.m_penunjangmetodeloinc_id
            LEFT JOIN m_penunjang_kategori_diagnostik_loinc ON m_penunjang_kategori_diagnostik_loinc.penunjangkatdiagloinc_id = m_penunjang_medis.m_penunjangkatdiagloinc_id
            JOIN m_pegawai ON m_pegawai.pegawai_id = t_penunjangmedis_pasien.pmedispasien_dokter
            JOIN (
                SELECT
                    pmedishasilpasien_uuid AS observation_uuid,
                    t_penunjangmedispasien_id
                FROM
                    t_pmedishasil_pasien
                    LEFT JOIN m_satuan_ukuran_ihs ON LOWER(m_satuan_ukuran_ihs.satuanukuran_ihs_kode) = LOWER(t_pmedishasil_pasien.pmedishasilpasien_satuan)
                    LEFT JOIN m_penunjang_nilai_param_loinc ON (',' || COALESCE(penunjangnilaiparamloinc_keterangan, penunjangnilaiparamloinc_nama) || ',') ILIKE ('%,' || pmedishasilpasien_nilai || ',%')
                    JOIN t_penunjangmedis_pasien ON t_penunjangmedis_pasien.pmedispasien_id = t_pmedishasil_pasien.t_penunjangmedispasien_id
                GROUP BY
                    pmedishasilpasien_uuid,
                    t_penunjangmedispasien_id
            ) observation ON t_penunjangmedis_pasien.pmedispasien_id = observation.t_penunjangmedispasien_id
        WHERE
            t_penunjangmedis_pasien.pmedispasien_aktif = 'y'
            AND pmedispasien_jenis = 2
            AND COALESCE(t_pendaftaran.pendaftaran_uuid, '') <> ''
            AND COALESCE(m_pasien.pasien_fhir_id, '') <> ''
            AND COALESCE(m_pegawai.pegawai_fhir_id, '') <> ''
            -- Use placeholders $1 and $2 for the registration_id
            AND ( t_pendaftaran.pendaftaran_no = $1 OR t_pendaftaran.pendaftaran_id_asal = ( SELECT pendaftaran_id FROM t_pendaftaran WHERE pendaftaran_no = $2 ) )
        ORDER BY
            COALESCE(NULLIF(regexp_replace(penunjangmedis_urut, '[^0-9]+', '', 'g'), ''), '0')::INTEGER ASC,
            penunjangmedis_nama ASC;
    `;

    try {
        // --- Execute Queries with Parameters ---
        const [
            serviceRequestResult,
            specimenResult,
            observationResult,
            diagnosticReportResult, // Renamed for clarity
        ] = await Promise.all([
            db.query(serviceRequestQueryText, queryValues), // Pass values
            db.query(specimenQueryText, queryValues), // Pass values
            db.query(observationQueryText, queryValues), // Pass values
            db.query(diagnosticReportQueryText, queryValues), // Pass values
        ]);

        // --- Combine Results ---
        const gabungData: dataPemeriksaanLab = {
            serviceRequest: serviceRequestResult.rows as serviceRequestLab[],
            specimen: specimenResult.rows as specimenLab[],
            observation: observationResult.rows as observationLab[],
            diagnosticReport: diagnosticReportResult.rows as diagnosticReport[],
        };

        return gabungData;
    } catch (err) {
        console.error("Error fetching lab test data:", err);
        // Consider logging the specific SQL error if possible
        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching lab test data for patient ${dataMasterPasien.patient_name} (Reg ID: ${dataMasterPasien.registration_id}): ${errorMessage}`, // Added more context to error
            500,
        );
    }
}

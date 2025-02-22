import AppError from "../utils/errorHandler";
import { dataAnamnesis, KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataAnamnesis(
    dataMasterPasien: KunjunganRawatInap,
    waktuAwal: string,
    waktuAkhir: string,
): Promise<dataAnamnesis | AppError> {
    try {
        const [condition, allergyIntolerance] = await Promise.all([
            db.query(
                `
                    select
                        t_diagnosa_pasien.diagnosapasien_data_json as condition,
                        m_pasien.pasien_fhir_id as Patient_id,
                        m_pasien.pasien_nama as Patient_Name,
                        t_pendaftaran.pendaftaran_uuid
                    from
                        t_pendaftaran
                    join (
                        select
                            t_diagnosa_pasien_1.t_pendaftaran_id as diagnosapasien_pendaftaran_id,
                            json_agg(json_build_object('condition_uuid',
                            t_diagnosa_pasien_1.diagnosapasien_uuid,
                            'condition_nama',
                            m_icd.icd_nama,
                            'condition_kode',
                            m_icd.icd_kode)) as diagnosapasien_data_json
                        from
                            t_diagnosa_pasien t_diagnosa_pasien_1
                        join m_icd on
                            m_icd.icd_id = t_diagnosa_pasien_1.m_icd_id
                        where
                            t_diagnosa_pasien_1.diagnosapasien_aktif = 'y'::bpchar
                            and coalesce(t_diagnosa_pasien_1.diagnosapasien_uuid,
                            ''::character varying)::text <> ''::text
                        group by
                            t_diagnosa_pasien_1.t_pendaftaran_id) t_diagnosa_pasien on
                        t_diagnosa_pasien.diagnosapasien_pendaftaran_id = t_pendaftaran.pendaftaran_id
                    join
                    m_pasien on
                        m_pasien.pasien_id = t_pendaftaran.m_pasien_id
                    where
                        t_pendaftaran.pendaftaran_aktif = 'y'
                        and t_pendaftaran.pendaftaran_krs is not null
                        and coalesce(t_pendaftaran.pendaftaran_uuid,
                        '') <> ''
                        and coalesce(m_pasien.pasien_fhir_id,
                        '') <> ''
                        and t_pendaftaran.pendaftaran_no = '${dataMasterPasien.registration_id}' 
	                    and to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) >= '${waktuAwal}' 
	                    and to_char( t_pendaftaran.pendaftaran_mrs, 'DD-MM-YYYY HH24:MM:SS' ) <= '${waktuAkhir}'
                    order by
                        t_pendaftaran.pendaftaran_id desc;
            `,
            ),
            db.query(
                `
                    select
                        tra.alergi_uuid,
                        (
                        select
                            fhirsetup_organization_id
                        from
                            m_far_fhir_setup mffs ) as org_id,
                        m_pasien.pasien_fhir_id as Pasien_id,
                        m_pasien.pasien_nama as Pasien_nama,
                        mcaf.link as clinical_status_system,
                        mcaf.code as clinical_status_code,
                        mcaf.display as clinicalStatus_display,
                        mvaf.link as verifikasi_status_system,
                        mvaf.code as verifikasi_status_code,
                        mvaf.display as verificationStatus_display,
                        tra.alergi_jenis as category,
                        tra.alergi_catatan,
                        mans.code_system as alergi_snomedct_system,
                        mans.code as alergi_snomedct_code,
                        mans.display as alergi_nama ,
                        tra.alergi_created_date
                    from
                        t_riwayat_alergi tra
                    join m_clinicalstatus_allergy_fhir mcaf on
                        mcaf.id = tra.alergi_clinicalstatus_fhir_id
                    join m_verificationstatus_allergy_fhir mvaf on
                        mvaf.id = tra.alergi_verificationstatus_fhir_id
                    join m_category_allergy_fhir on
                        m_category_allergy_fhir.id = tra.alergi_category_fhir_id
                    join m_allergy_name_snomedct mans on
                        mans.id = tra.alergi_name_snomedct_id
                    join
                    m_pasien on
                        m_pasien.pasien_id = tra.alergi_pasien_id
                    where
                        coalesce(m_pasien.pasien_fhir_id,
                        '') <> ''
                        and tra.alergi_aktif = 'y' 
                        and m_pasien.pasien_fhir_id = '${dataMasterPasien.patient_id}';
                `,
            ),
        ]);

        const gabungData = {
            condition: condition.rows,
            allergyIntolerance: allergyIntolerance.rows,
        };

        return gabungData;
    } catch (err) {
        console.error("Error fetching anamnesis data:", err);
        return new AppError(
            `Error fetching anamnesis data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

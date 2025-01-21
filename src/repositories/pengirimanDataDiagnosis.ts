import AppError from "../utils/errorHandler";
import { ConditionRow, KunjunganRawatInap } from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataDiagnosis(
    dataMasterPasien: KunjunganRawatInap,
    waktuAwal: string,
    waktuAkhir: string,
): Promise<ConditionRow[] | AppError> {
    try {
        const condition = await db.query(
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
        );
        return condition.rows;
    } catch (err) {
        console.error("Error fetching anamnesis data:", err);
        return new AppError(
            `Error fetching anamnesis data: ${dataMasterPasien.patient_name}'s patient!`,
            500,
        );
    }
}

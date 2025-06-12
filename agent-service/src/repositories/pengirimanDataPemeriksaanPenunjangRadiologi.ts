import AppError from "../utils/errorHandler";
import {
    DataPemeriksaanRadiologiFromRepo,
    KunjunganRawatInap,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataPemeriksaanPenunjangRadiologi(
    dataMasterPasien: KunjunganRawatInap,
): Promise<DataPemeriksaanRadiologiFromRepo | AppError> {
    const queryServiceRequest = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemeriksaan Penunjang Radiologi%'
            AND
                resource_type = 'ServiceRequest'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const queryObservation = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemeriksaan Penunjang Radiologi%'
            AND
                resource_type = 'Observation'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const queryDiagnosticReport = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Pemeriksaan Penunjang Radiologi%'
            AND
                resource_type = 'DiagnosticReport'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const [serviceRequest, observation, diagnosticReport] =
            await Promise.all([
                db.query(queryServiceRequest, values),
                db.query(queryObservation, values),
                db.query(queryDiagnosticReport, values),
            ]);

        const result = {
            serviceRequest: serviceRequest.rows,
            observation: observation.rows,
            diagnosticReport: diagnosticReport.rows,
        };

        return result;
    } catch (err) {
        console.error(
            "Error fetching PEMERIKSAAN PENUNJANG RADIOLOGI data:",
            err,
        );

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching PEMERIKSAAN PENUNJANG RADIOLOGI data: ${errorMessage}`,
            500,
        );
    }
}

import AppError from "../utils/errorHandler";
import {
    DataTindakanProsedurMedisFromRepo,
    KunjunganRawatInap,
} from "../utils/interface";
import db from "./dbConnect";

export default async function dapatkanDataTindakanProsedurMedis(
    dataMasterPasien: KunjunganRawatInap,
): Promise<DataTindakanProsedurMedisFromRepo | AppError> {
    const queryServiceRequest = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Tindakan/ Prosedur Medis%'
            AND
                resource_type = 'ServiceRequest'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const queryProcedure = `
        SELECT
             *
        FROM 
            "_interoperability-agent"
        WHERE 
            module_tag LIKE '%Tindakan/ Prosedur Medis%'
            AND
                resource_type = 'Procedure'
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
            module_tag LIKE '%Tindakan/ Prosedur Medis%'
            AND
                resource_type = 'Observation'
            AND 
                patient_ihs_id = $1
            AND 
                encounter_id = $2;
    `;

    const values = [dataMasterPasien.patient_id, dataMasterPasien.encounter_id];

    try {
        const [serviceRequest, procedure, observation] = await Promise.all([
            db.query(queryServiceRequest, values),
            db.query(queryProcedure, values),
            db.query(queryObservation, values),
        ]);

        const result = {
            serviceRequest: serviceRequest.rows,
            procedure: procedure.rows,
            observation: observation.rows,
        };

        return result;
    } catch (err) {
        console.error("Error fetching TINDAKAN PROSEDUR MEDIS data:", err);

        const errorMessage = err instanceof Error ? err.message : String(err);
        return new AppError(
            `Error fetching TINDAKAN PROSEDUR MEDIS data: ${errorMessage}`,
            500,
        );
    }
}

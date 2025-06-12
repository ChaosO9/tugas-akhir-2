import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { EdukasiDbRow, KunjunganRawatInap } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataEdukasiService(
    dataMasterPasien: KunjunganRawatInap,
    dataEdukasi: EdukasiDbRow[],
): Promise<object[] | AppError> {
    let jsonProcedureArray: object[] = [];

    if (Array.isArray(dataEdukasi) && dataEdukasi.length > 0) {
        dataEdukasi.forEach((edukasiItem) => {
            const procedureResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    resourceType: "Procedure",
                    status: edukasiItem.data.status,
                    category: {
                        coding: edukasiItem.data.category?.coding?.map((c) => ({
                            system: c.system,
                            code: c.code,
                            display: c.display,
                        })),
                        ...(edukasiItem.data.category?.text && {
                            text: edukasiItem.data.category?.text,
                        }),
                    },
                    code: {
                        coding: edukasiItem.data.code?.coding?.map((c) => ({
                            system: c.system,
                            code: c.code,
                            display: c.display,
                        })),
                        ...(edukasiItem.data.code?.text && {
                            text: edukasiItem.data.code?.text,
                        }),
                    },
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display: `Edukasi terkait ${edukasiItem.data.encounter?.display || "prosedur medis"} untuk ${dataMasterPasien.patient_name} pada ${new Date(edukasiItem.data.performedPeriod?.start || new Date()).toLocaleDateString("id-ID")}`,
                    },
                    performedPeriod: {
                        start: dateTimeToUTC(
                            edukasiItem.data.performedPeriod?.start ||
                                new Date().toISOString(),
                        ),
                        end: dateTimeToUTC(
                            edukasiItem.data.performedPeriod?.end ||
                                new Date().toISOString(),
                        ),
                    },
                    performer: [
                        {
                            actor: {
                                reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                                display: dataMasterPasien.practitioner_name,
                            },
                        },
                    ],
                    ...(edukasiItem.data.note && {
                        note: [
                            {
                                text: edukasiItem.data.note[0]?.text,
                            },
                        ],
                    }),
                },
                request: {
                    method: "POST",
                    url: "Procedure",
                },
            };
            jsonProcedureArray.push(procedureResource);
        });
    }

    return jsonProcedureArray;
}

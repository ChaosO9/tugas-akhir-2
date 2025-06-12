import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    InstruksiMedikKeperawatanDbRow,
    KunjunganRawatInap,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataRencanaRawatService(
    dataMasterPasien: KunjunganRawatInap,
    dataInstruksi: InstruksiMedikKeperawatanDbRow[],
): Promise<object[] | AppError> {
    let jsonCarePlanArray: object[] = [];

    let json = {
        fullUrl: "urn:uuid:ca1e2227-dfe2-4bd3-b0be-eee72e387110",
        resource: {
            resourceType: "CarePlan",
            status: "active",
            intent: "plan",
            category: [
                {
                    coding: [
                        {
                            system: "http://snomed.info/sct",
                            code: "736353004",
                            display: " Inpatient care plan",
                        },
                    ],
                },
            ],
            title: "Rencana Rawat Pasien",
            description:
                "Pasien akan melakukan Pengecekan Kolesterol, Kreatinin, dan USG Ginjal serta Tindakan Hemodialisis dengan Rencana Lama Waktu Rawat selama 3-4 Hari",
            subject: {
                reference: "Patient/{{Patient_id}}",
                display: "{{Patient_Name}}",
            },
            encounter: {
                reference: "Encounter/{{Encounter_id}}",
            },
            created: "2022-12-25T08:00:00+00:00",
            author: {
                reference: "Practitioner/{{Practitioner_id}}",
            },
            goal: [
                {
                    reference: "Goal/{{Goal_TujuanPerawatan}}",
                },
            ],
        },
        request: {
            method: "POST",
            url: "CarePlan",
        },
    };

    return jsonCarePlanArray;
}

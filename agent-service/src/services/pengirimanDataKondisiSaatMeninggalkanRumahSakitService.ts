import { dateTimeToUTC } from "../utils/dateTimeToUTC"; // Import if onset/recorded dates are added
import AppError from "../utils/errorHandler";
import { KondisiSaatPulangDbRow, KunjunganRawatInap } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataKondisiSaatMeninggalkanRumahSakitService(
    dataMasterPasien: KunjunganRawatInap,
    dataKondisiSaatPulang: KondisiSaatPulangDbRow[],
): Promise<object[] | AppError> {
    let jsonConditionArray: object[] = [];

    if (
        Array.isArray(dataKondisiSaatPulang) &&
        dataKondisiSaatPulang.length > 0
    ) {
        dataKondisiSaatPulang.forEach((kondisiItem) => {
            const fhirCondition = kondisiItem.data; // Access the FHIR Condition from the data property

            const conditionResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB or generate new
                resource: {
                    resourceType: "Condition",
                    clinicalStatus: fhirCondition.clinicalStatus,
                    category: fhirCondition.category,
                    code: fhirCondition.code,
                    subject: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                        display: dataMasterPasien.patient_name,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                        display:
                            fhirCondition.encounter?.display ||
                            `Kondisi terkait kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
                    },
                    ...(fhirCondition.onsetDateTime && {
                        onsetDateTime: dateTimeToUTC(
                            fhirCondition.onsetDateTime,
                        ),
                    }),
                    ...(fhirCondition.recordedDate && {
                        recordedDate: dateTimeToUTC(fhirCondition.recordedDate),
                    }),
                    // recorder can also be overridden if needed, or taken from fhirCondition.recorder
                    recorder: fhirCondition.recorder || {
                        reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                        display: dataMasterPasien.practitioner_name,
                    },
                },
                request: {
                    method: "POST",
                    url: "Condition",
                },
            };
            jsonConditionArray.push(conditionResource);
        });
    }

    return jsonConditionArray;
}

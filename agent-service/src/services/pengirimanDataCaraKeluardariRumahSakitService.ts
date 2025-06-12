import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import { formatDateToISO } from "../utils/functions";
import AppError from "../utils/errorHandler";
import { CaraKeluarDbRow, KunjunganRawatInap } from "../utils/interface";
import { EncounterResource } from "../utils/interfaceValidation";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataCaraKeluardariRumahSakitService(
    dataMasterPasien: KunjunganRawatInap,
    dataCaraKeluar: CaraKeluarDbRow[],
): Promise<object[] | AppError> {
    let jsonEncounterArray: object[] = [];

    if (Array.isArray(dataCaraKeluar) && dataCaraKeluar.length > 0) {
        dataCaraKeluar.forEach((item: CaraKeluarDbRow) => {
            const fhirEncounter: EncounterResource = item.data;

            // Ensure subject, participant (attender), and serviceProvider are correctly set
            const subjectReference = {
                reference: `Patient/${dataMasterPasien.patient_id}`,
                display: dataMasterPasien.patient_name,
            };

            const participantAttender = {
                type: [
                    {
                        coding: [
                            {
                                system: "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                code: "ATND",
                                display: "attender",
                            },
                        ],
                    },
                ],
                individual: {
                    reference: `Practitioner/${dataMasterPasien.practitioner_id}`,
                    display: dataMasterPasien.practitioner_name,
                },
            };

            // Merge or replace existing participants
            const participants =
                fhirEncounter.participant?.filter(
                    (p) =>
                        !p.type?.some((t) =>
                            t.coding?.some((c) => c.code === "ATND"),
                        ),
                ) || [];
            participants.push(participantAttender);

            const serviceProviderReference = {
                reference: `Organization/${dataMasterPasien.org_id}`,
            };

            const encounterResource: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    ...fhirEncounter, // Spread the original FHIR data
                    id: dataMasterPasien.encounter_id,
                    identifier: [
                        {
                            system: `http://sys-ids.kemkes.go.id/encounter/${dataMasterPasien.org_id}`,
                            value: item.fhir_id, // Fallback identifier
                        },
                    ],
                    status: fhirEncounter.status || "finished", // Default status
                    class: fhirEncounter.class, // Should be present in source data
                    subject: subjectReference,
                    participant: participants,
                    period: fhirEncounter.period
                        ? {
                              start: fhirEncounter.period.start
                                  ? dateTimeToUTC(fhirEncounter.period.start)
                                  : undefined,
                              end: fhirEncounter.period.end
                                  ? dateTimeToUTC(fhirEncounter.period.end)
                                  : undefined,
                          }
                        : undefined,
                    length: fhirEncounter.length,
                    location: fhirEncounter.location, // Assuming location data is correct in source
                    diagnosis: fhirEncounter.diagnosis, // Assuming diagnosis data is correct in source
                    statusHistory: fhirEncounter.statusHistory?.map(
                        (history) => ({
                            ...history,
                            period: {
                                start: formatDateToISO(history.period.start!), // formatDateToISO expects string
                                end: formatDateToISO(history.period.end!),
                            },
                        }),
                    ),
                    hospitalization: {
                        ...fhirEncounter.hospitalization, // Spread original hospitalization data
                        dischargeDisposition:
                            fhirEncounter.hospitalization?.dischargeDisposition, // This is the key field
                    },
                    serviceProvider: serviceProviderReference,
                    basedOn: fhirEncounter.basedOn,
                },
                request: {
                    method: "POST",
                    url: "Encounter",
                },
            };
            jsonEncounterArray.push(encounterResource);
        });
    }

    return jsonEncounterArray;
}

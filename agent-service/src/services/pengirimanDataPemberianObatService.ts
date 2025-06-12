import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import {
    DataPemberianObatFromRepo,
    KunjunganRawatInap,
    MedicationAdministrationPemberianObatDbRow,
} from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataPemberianObatService(
    dataMasterPasien: KunjunganRawatInap,
    dataPemberianObat: DataPemberianObatFromRepo,
): Promise<object[] | AppError> {
    let jsonMedicationAdministrationArray: object[] = [];

    if (
        dataPemberianObat &&
        Array.isArray(dataPemberianObat.medicationAdministration) &&
        dataPemberianObat.medicationAdministration.length > 0
    ) {
        dataPemberianObat.medicationAdministration.forEach(
            (item: MedicationAdministrationPemberianObatDbRow) => {
                const sourceFhirMedAdmin = item.data; // Original data from DB
                // Destructure to exclude 'request' from the properties to be spread
                const {
                    request: _removedRequestProperty,
                    ...fhirMedAdminPropertiesToSpread
                } = sourceFhirMedAdmin;

                const medicationAdministrationResource: object = {
                    fullUrl: `urn:uuid:${uuidv4()}`, // Use fhir_id from DB or generate new
                    resource: {
                        // Spread the FHIR MedicationAdministration data, excluding the 'request' property
                        ...fhirMedAdminPropertiesToSpread,
                        // Override or ensure core properties
                        status: sourceFhirMedAdmin.status, // Or a default like "completed"
                        category: sourceFhirMedAdmin.category, // Or a default category
                        medicationReference:
                            sourceFhirMedAdmin.medicationReference, // Ensure this is correctly populated in source
                        subject: {
                            reference: `Patient/${dataMasterPasien.patient_id}`,
                            display: dataMasterPasien.patient_name,
                        },
                        context: {
                            reference: `Encounter/${dataMasterPasien.encounter_id}`,
                            display:
                                sourceFhirMedAdmin.context?.display ||
                                `Pemberian obat terkait kunjungan ${dataMasterPasien.patient_name} pada ${new Date(dataMasterPasien.arrived).toLocaleDateString("id-ID")}`,
                        },
                        effectivePeriod: sourceFhirMedAdmin.effectivePeriod
                            ? {
                                  start: dateTimeToUTC(
                                      sourceFhirMedAdmin.effectivePeriod
                                          .start || new Date().toISOString(),
                                  ),
                                  end: dateTimeToUTC(
                                      sourceFhirMedAdmin.effectivePeriod.end ||
                                          new Date().toISOString(),
                                  ),
                              }
                            : undefined,
                        // If effectiveDateTime is used instead of effectivePeriod
                        // effectiveDateTime: sourceFhirMedAdmin.effectiveDateTime ? dateTimeToUTC(sourceFhirMedAdmin.effectiveDateTime) : undefined,
                        performer: [
                            {
                                actor: {
                                    reference:
                                        sourceFhirMedAdmin.performer?.[0]?.actor
                                            ?.reference ||
                                        `Practitioner/${dataMasterPasien.practitioner_id}`,
                                    display: dataMasterPasien.practitioner_name,
                                },
                            },
                        ],
                        reasonCode: sourceFhirMedAdmin.reasonCode,
                        // The 'request' field from sourceFhirMedAdmin is now omitted
                        dosage: sourceFhirMedAdmin.dosage,
                        // Conditionally include contained if sourceFhirMedAdmin.contained exists
                        ...(sourceFhirMedAdmin.contained && {
                            contained: {
                                ...sourceFhirMedAdmin.contained, // Spread original contained data
                                manufacturer: {
                                    reference: `Organization/${dataMasterPasien.org_id}`,
                                },
                            },
                        }),
                    },
                    request: {
                        method: "POST",
                        url: "MedicationAdministration",
                    },
                };
                jsonMedicationAdministrationArray.push(
                    medicationAdministrationResource,
                );
            },
        );
    }

    return jsonMedicationAdministrationArray;
}

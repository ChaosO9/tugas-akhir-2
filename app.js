const fs = require('fs');

const Registration_ID = "ABCD123";
const Encounter_id = "12345";
const Org_ID = "rs001";
const Patient_ID = "123";
const Patient_Name = "Rafi Enha";
const Practitioner_ID = "456";
const Practitioner_Name = "Dr. Alfan";
const Condition_DiagnosisPrimer = "001";
const DiagnosisPrimer_Text = "Usus Buntu";
const Condition_DiagnosisSekunder = "002";
const DiagnosisSekunder_Text = "Hipertensi";
const No_Rujukan_Pasien = "10";
const Location_Poli_id = "20";
const Location_Poli_Name = "Poli Bedah";
const Observation_Nadi = "70";
const Observation_Kesadaran = "Coma";
const CarePlan_RencanaRawat = "rencana_rawat";
const CarePlan_Instruksi = "instruksi";
const Procedure_PraRad = "prosedur_1";
const Observation_PraRad = "observasi_1";

const encounterData = {
    "resourceType": "Bundle",
    "type": "transaction",
    "entry": [
        {
            "fullUrl": `urn:uuid:${Encounter_id}`,
            "resource": {
                "resourceType": "Encounter",
                "identifier": [
                    {
                        "system": `http://sys-ids.kemkes.go.id/encounter/${Org_ID}`,
                        "value": Registration_ID
                    }
                ],
                "status": "finished",
                "statusHistory": [
                    {
                        "status": "arrived",
                        "period": {
                            "start": "2023-08-31T00:00:00+00:00",
                            "end": "2023-08-31T01:00:00+00:00"
                        }
                    },
                    {
                        "status": "in-progress",
                        "period": {
                            "start": "2023-08-31T01:00:00+00:00",
                            "end": "2023-08-31T04:05:00+00:00"
                        }
                    },
                    {
                        "status": "finished",
                        "period": {
                            "start": "2023-08-31T04:05:00+00:00",
                            "end": "2023-08-31T04:10:00+00:00"
                        }
                    }
                ],
                "class": {
                    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
                    "code": "AMB",
                    "display": "ambulatory"
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "participant": [
                    {
                        "type": [
                            {
                                "coding": [
                                    {
                                        "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
                                        "code": "ATND",
                                        "display": "attender"
                                    }
                                ]
                            }
                        ],
                        "individual": {
                            "reference": `Practitioner/${Practitioner_ID}`,
                            "display": Practitioner_Name
                        }
                    }
                ],
                "period": {
                    "start": "2023-08-31T00:00:00+00:00",
                    "end": "2023-08-31T02:00:00+00:00"
                },
                "diagnosis": [
                    {
                        "condition": {
                            "reference": `urn:uuid:${Condition_DiagnosisPrimer}`,
                            "display": DiagnosisPrimer_Text
                        },
                        "use": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                    "code": "DD",
                                    "display": "Discharge diagnosis"
                                }
                            ]
                        },
                        "rank": 1
                    },
                    {
                        "condition": {
                            "reference": `urn:uuid:${Condition_DiagnosisSekunder}`,
                            "display": DiagnosisSekunder_Text
                        },
                        "use": {
                            "coding": [
                                {
                                    "system": "http://terminology.hl7.org/CodeSystem/diagnosis-role",
                                    "code": "DD",
                                    "display": "Discharge diagnosis"
                                }
                            ]
                        },
                        "rank": 2
                    }
                ],
                "hospitalization": {
                    "dischargeDisposition": {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/discharge-disposition",
                                "code": "oth",
                                "display": "other-hcf"
                            }
                        ],
                        "text": `Rujukan ke RSUP Fatmawati dengan nomor rujukan ${No_Rujukan_Pasien}`
                    }
                },
                "location": [
                    {
                        "extension": [
                            {
                                "extension": [
                                    {
                                        "url": "value",
                                        "valueCodeableConcept": {
                                            "coding": [
                                                {
                                                    "system": "http://terminology.kemkes.go.id/CodeSystem/locationServiceClass-Outpatient",
                                                    "code": "reguler",
                                                    "display": "Kelas Reguler"
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "url": "upgradeClassIndicator",
                                        "valueCodeableConcept": {
                                            "coding": [
                                                {
                                                    "system": "http://terminology.kemkes.go.id/CodeSystem/locationUpgradeClass",
                                                    "code": "kelas-tetap",
                                                    "display": "Kelas Tetap Perawatan"
                                                }
                                            ]
                                        }
                                    }
                                ],
                                "url": "https://fhir.kemkes.go.id/r4/StructureDefinition/ServiceClass"
                            }
                        ],
                        "location": {
                            "reference": `Location/${Location_Poli_id}`,
                            "display": Location_Poli_Name
                        },
                        "period": {
                            "start": "2023-08-31T00:00:00+00:00",
                            "end": "2023-08-31T02:00:00+00:00"
                        }
                    }
                ],
                "serviceProvider": {
                    "reference": `Organization/${Org_ID}`
                }
            },
            "request": {
                "method": "POST",
                "url": "Encounter"
            }
        },
        {
            "fullUrl": "urn:uuid:c566d6e2-4da0-4895-9bcb-8051dd16548c",
            "resource": {
                "resourceType": "Condition",
                "clinicalStatus": {
                    "coding": [
                        {
                            "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
                            "code": "active",
                            "display": "Active"
                        }
                    ]
                },
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/condition-category",
                                "code": "problem-list-item",
                                "display": "Problem List Item"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "16932000",
                            "display": "Batuk darah"
                        }
                    ]
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "onsetDateTime": "2023-02-02T00:00:00+00:00",
                "recordedDate": "2023-08-31T01:00:00+00:00",
                "recorder": {
                    "reference": `Practitioner/${Practitioner_ID}`,
                    "display": Practitioner_Name
                },
                "note": [
                    {
                        "text": "Batuk Berdarah sejak 3bl yll"
                    }
                ]
            },
            "request": {
                "method": "POST",
                "url": "Condition"
            }
        },
        {
            "fullUrl": `urn:uuid:${Observation_Nadi}`,
            "resource": {
                "resourceType": "Observation",
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "vital-signs",
                                "display": "Vital Signs"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "8867-4",
                            "display": "Heart rate"
                        }
                    ]
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "effectiveDateTime": "2023-08-31T01:10:00+00:00",
                "issued": "2023-08-31T01:10:00+00:00",
                "performer": [
                    {
                        "reference": `Practitioner/${Practitioner_ID}`,
                        "display": Practitioner_Name
                    }
                ],
                "valueQuantity": {
                    "value": 80,
                    "unit": "{beats}/min",
                    "system": "http://unitsofmeasure.org",
                    "code": "{beats}/min"
                }
            },
            "request": {
                "method": "POST",
                "url": "Observation"
            }
        },
        {
            "fullUrl": `urn:uuid:${Observation_Kesadaran}`,
            "resource": {
                "resourceType": "Observation",
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "vital-signs",
                                "display": "Vital Signs"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "67775-7",
                            "display": "Level of responsiveness"
                        }
                    ]
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "effectiveDateTime": "2023-08-31T01:10:00+00:00",
                "issued": "2023-08-31T01:10:00+00:00",
                "performer": [
                    {
                        "reference": `Practitioner/${Practitioner_ID}`,
                        "display": Practitioner_Name
                    }
                ],
                "valueCodeableConcept": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "248234008",
                            "display": "Mentally alert"
                        }
                    ]
                }
            },
            "request": {
                "method": "POST",
                "url": "Observation"
            }
        },
        {
            "fullUrl": `urn:uuid:${CarePlan_RencanaRawat}`,
            "resource": {
                "resourceType": "CarePlan",
                "status": "active",
                "intent": "plan",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "736271009",
                                "display": "Outpatient care plan"
                            }
                        ]
                    }
                ],
                "title": "Rencana Rawat Pasien",
                "description": "Rencana Rawat Pasien",
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "created": "2023-08-31T01:20:00+00:00",
                "author": {
                    "reference": `Practitioner/${Practitioner_ID}`,
                    "display": Practitioner_Name
                }
            },
            "request": {
                "method": "POST",
                "url": "CarePlan"
            }
        },
        {
            "fullUrl": `urn:uuid:${CarePlan_Instruksi}`,
            "resource": {
                "resourceType": "CarePlan",
                "status": "active",
                "intent": "plan",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://snomed.info/sct",
                                "code": "736271009",
                                "display": "Outpatient care plan"
                            }
                        ]
                    }
                ],
                "title": "Instruksi Medik dan Keperawatan Pasien",
                "description": "Penanganan TB Pasien dilakukan dengan pemberian pengobatan TB.",
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "created": "2023-08-31T01:20:00+00:00",
                "author": {
                    "reference": `Practitioner/${Practitioner_ID}`
                }
            },
            "request": {
                "method": "POST",
                "url": "CarePlan"
            }
        },
        {
            "fullUrl": `urn:uuid:${Procedure_PraRad}`,
            "resource": {
                "resourceType": "Procedure",
                "status": "not-done",
                "category": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "103693007",
                            "display": "Diagnostic procedure"
                        }
                    ],
                    "text": "Prosedur diagnostik"
                },
                "code": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "792805006",
                            "display": "Fasting"
                        }
                    ]
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`,
                    "display": Patient_Name
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`
                },
                "performedPeriod": {
                    "start": "2023-07-04T09:30:00+00:00",
                    "end": "2023-07-04T09:30:00+00:00"
                },
                "performer": [
                    {
                        "actor": {
                            "reference": `Practitioner/${Practitioner_ID}`,
                            "display": Practitioner_Name
                        }
                    }
                ],
                "note": [
                    {
                        "text": "Tidak puasa sebelum pemeriksaan radiologi"
                    }
                ]
            },
            "request": {
                "method": "POST",
                "url": "Procedure"
            }
        },
        {
            "fullUrl": `urn:uuid:${Observation_PraRad}`,
            "resource": {
                "resourceType": "Observation",
                "status": "final",
                "category": [
                    {
                        "coding": [
                            {
                                "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                                "code": "survey",
                                "display": "Survey"
                            }
                        ]
                    }
                ],
                "code": {
                    "coding": [
                        {
                            "system": "http://loinc.org",
                            "code": "82810-3",
                            "display": "Pregnancy status"
                        }
                    ]
                },
                "subject": {
                    "reference": `Patient/${Patient_ID}`
                },
                "encounter": {
                    "reference": `urn:uuid:${Encounter_id}`,
                    "display": `Kunjungan ${Patient_Name} 4 Juli 2023`
                },
                "effectiveDateTime": "2023-07-04T09:30:00+00:00",
                "issued": "2023-07-04T09:30:00+00:00",
                "performer": [
                    {
                        "reference": `Practitioner/${Practitioner_ID}`
                    }
                ],
                "valueCodeableConcept": {
                    "coding": [
                        {
                            "system": "http://snomed.info/sct",
                            "code": "60001007",
                            "display": "Not pregnant"
                        }
                    ]
                }
            },
            "request": {
                "method": "POST",
                "url": "Observation"
            }
        }
    ]
};

const jsonContent = JSON.stringify(encounterData, null, 2);

fs.writeFile('encounter_bundle.json', jsonContent, (err) => {
    if (err) {
        console.error('Error menulis file:', err);
    } else {
        console.log('File encounter_bundle.json berhasil dibuat.');
    }
});

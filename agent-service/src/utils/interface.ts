export interface KunjunganRawatInap {
    registration_id: string;
    org_id: string;
    encounter_id: string;
    arrived: string;
    in_progress: string;
    finished: string;
    patient_id: string;
    patient_name: string;
    practitioner_id: string;
    practitioner_name: string;
    period_start: string;
    period_end: string;
    diagnosa: Diagnosa[] | ConditionRow[];
    location_poli_id: string;
    unit_nama: string; // Added missing semicolon
    processed_resource?: ProcessedResourcesBundle;
}

export interface Diagnosa {
    diagnosa_uuid: string;
    diagnosa_nama: string;
    diagnosa_type: string;
}

interface ConditionObject {
    condition_uuid: string;
    condition_nama: string;
    condition_kode: string;
    tanggal: string;
}

export interface ConditionRow {
    condition: ConditionObject[];
    patient_id: string;
    patient_name: string;
    pendaftaran_uuid: string;
}

interface AllergyIntoleranceRow {
    alergi_uuid: string;
    org_id: string;
    pasien_id: string;
    pasien_nama: string;
    clinical_status_system: string;
    clinical_status_code: string;
    clinicalstatus_display: string;
    verifikasi_status_system: string;
    verifikasi_status_code: string;
    verificationstatus_display: string;
    category: string;
    alergi_catatan: string;
    alergi_snomedct_system: string;
    alergi_snomedct_code: string;
    alergi_nama: string;
    alergi_created_date: string;
}

export interface dataAnamnesis {
    condition: ConditionRow[];
    allergyIntolerance: AllergyIntoleranceRow[];
}

export interface dataHasilPemeriksaanFisik {
    periksa_id: number;
    periksa_pendaftaran_id: number;
    systolic_blood_pressure_code: string;
    systolic_blood_pressure_value: string;
    body_temperature_code: string;
    body_temperature_value: number;
    heart_rate_code: string;
    heart_rate_value: number;
    respiratory_rate_code: string;
    respiratory_rate_value: number;
    periksa_created_date: Date;
    encounter: string;
    patient_id: string;
    patient_name: string;
    practitioner_id: string;
    practitioner_name: string;
}

export interface DiagnosaItem {
    icd_nama: string;
    icd_kode: string;
    diagnosa_jenis: string;
    diagnosa_uuid: string;
}

export interface dataRiwayatPerjalananPenyakit {
    encounter: string;
    patient_id: string;
    patient_name: string;
    practitioner_id: string;
    practitioner_name: string;
    clinicalimpression_uuid: string;
    deskripsi: string | null; // Allow nulls as the sample data suggests this might be missing
    investigasi: string | null; // Allow nulls
    kesimpulan: string | null; // Allow nulls
    diagnosa: DiagnosaItem[]; // Use an array of DiagnosaItem objects
    status_nama: string | null; // Allow nulls
    prognosis_nama: string | null; // Allow nulls
    prognosis_system: string | null; // Allow nulls
    prognosis_kode: string | null; // Allow nulls
}

export interface serviceRequestLab {
    org_id: string;
    pendaftaran_id: string;
    servicerequest_uuid: string;
    encounter: string;
    value: string | number; // Or string if it can be non-numeric
    text: string;
    system: string;
    code: string;
    display: string;
    practitioner_id: string;
    practitioner_nama: string;
    patient_id: string;
    patient_name: string;
    authoredon: string;
}

export interface specimenLab {
    org_id: string;
    specimen_uuid: string;
    servicerequest_uuid: string;
    encounter: string;
    value: string | number;
    spesimen_system: string;
    spesimen_kode: string;
    spesimen_nama: string;
    metode_system: string;
    metode_kode: string;
    metode_nama: string;
    practitioner_id: string;
    practitioner_nama: string;
    patient_id: string;
    patient_name: string;
    authoredon: Date;
}

export interface observationLab {
    pendaftaran_id: string;
    org_id: string;
    servicerequest_uuid: string;
    observation_uuid: string;
    encounter: string;
    value: number; // Or string if it can be non-numeric
    loinc_text: string;
    loinc_system: string;
    loinc_code: string;
    loinc_display: string;
    practitioner_id: string;
    practitioner_nama: string; // Consider renaming to practitioner_name
    patient_id: string;
    patient_name: string;
    authoredon: string; // Or Date
    hasil_lab: HasilLabItem[]; // An array of results
}

export interface HasilLabItem {
    valueQuantity_value: string | number | null; // Can be string, number, or null
    valueQuantity_unit: string | null;
    valueQuantity_system: string | null;
    valueQuantity_code: string | null;
    valueCodeableConcept_coding_system: string | null;
    valueCodeableConcept_coding_code: string | null;
    valueCodeableConcept_coding_display: string | null;
    referenceRange_low_value: string | number | null; // Can be string, number, or null
    referenceRange_low_unit: string | null;
    referenceRange_low_sytem: string | null; // Typo? Should probably be system
    referenceRange_low_code: string | null;
    referenceRange_high_value: string | number | null; // Can be string, number, or null
    referenceRange_high_unit: string | null;
    referenceRange_high_sytem: string | null; // Typo? Should probably be system
    referenceRange_high_code: string | null;
}

export interface diagnosticReport {
    pendaftaran_id: string;
    org_id: string;
    specimen_uuid: string;
    servicerequest_uuid: string;
    observation_uuid: string;
    medicationrequest_uuid: string;
    encounter: string;
    value: number; // Or string if it can be non-numeric
    loinc_text: string | null; // Allow nulls
    loinc_system: string | null; // Allow nulls
    loinc_code: string | null; // Allow nulls
    loinc_display: string | null; // Allow nulls
    category_link: string | null; // Allow nulls
    category_kode: string | null; // Allow nulls
    category_nama: string | null; // Allow nulls
    practitioner_id: string;
    practitioner_nama: string; // Consider renaming to practitioner_name
    patient_id: string;
    patient_name: string;
    pmedispasien_created_date_hasil: string; // Or Date
}

export interface dataPemeriksaanLab {
    serviceRequest: serviceRequestLab[];
    specimen: specimenLab[];
    observation: observationLab[];
    diagnosticReport: diagnosticReport[];
}

export interface medication {
    medication_uuid: string | null; // Can be null
    racikan: "y" | "t" | null; // "y" or "t" or null
    resepdet_id: number;
    resepdet_resep_id: number;
    identifier_value: string;
    code_coding_code: string;
    code_coding_display: string;
    form_coding_system: string | null; // Can be null
    form_coding_code: string | null; // Can be null
    form_coding_display: string | null; // Can be null
    ingredient_racikan: IngredientRacikan[] | null; // Array of ingredients or null
    itemCodeableConcept_coding_code: string | null; // Can be null
    itemCodeableConcept_coding_display: string | null; // Can be null
    ingredient_strength_denominator_value: number | null; // Can be null
    strength_denominator_system: string | null; // Can be null
    strength_denominator_code: string | null; // Can be null
}

export interface IngredientRacikan {
    ingredient_strength_value: number;
    ingredient_strength_kode: string;
    ingredient_strength_system: string;
    ingredient_denominator_value: number;
    ingredient_denominator_kode: string;
    ingredient_denominator_system: string;
}

export interface medicationRequest {
    medicationrequest_uuid: string;
    identifier_value_1: string;
    identifier_value_2: string;
    medicationreference_display: string;
    patient_id: string;
    patient_name: string;
    practitioner_id: string;
    practitioner_name: string;
    encounter: string;
    authoredon: string;
    dosageinstruction_sequence: number;
    dosageinstruction_text: string;
    dosageinstruction_sequence_timing_repeat_frequency: number | null;
    dosageinstruction_sequence_timing_repeat_period: number;
    dosageinstruction_sequence_timing_repeat_periodunit: string;
    route_coding_system: string;
    dosageinstruction_route_coding_code: string;
    dosageinstruction_route_coding_display: string;
    dosageinstruction_doseandrate_type_coding_system: string;
    dosageinstruction_doseandrate_type_coding_code: string;
    dosageinstruction_doseandrate_type_coding_display: string;
    dosageinstruction_doseandrate_dosequantity_unit: string;
    dosageinstruction_doseandrate_dosequantity_system: string;
    dosageinstruction_doseandrate_dosequantity_code: string;
    dispenserequest_dispenseinterval_value: number;
    dispenserequest_dispenseinterval_unit: string;
    dispenserequest_dispenseinterval_system: string;
    dispenserequest_dispenseinterval_code: string;
    dispenserequest_validityperiod_start: string;
    dispenserequest_validityperiod_end: string;
    dispenserequest_quantity_value: number;
    dispenserequest_quantity_unit: string;
    dispenserequest_quantity_system: string;
    dispenserequest_quantity_code: string;
    dispenserequest_expectedsupplyduration_unit: string | null;
    dispenserequest_expectedsupplyduration_system: string;
    dispenserequest_expectedsupplyduration_code: string | null;
    dispenserequest_expectedsupplyduration_value: number | null;
    org_id: string;
}

export interface dataPeresepanObat {
    medication: medication[];
    medicationRequest: medicationRequest[];
}

export interface medicationDispense {
    medicationrequest_uuid: string;
    identifier_value_1: string;
    identifier_value_2: string;
    medicationreference_display: string;
    patient_id: string;
    patient_name: string;
    practitioner_id: string;
    practitioner_name: string;
    encounter: string;
    authoredon: string; // Changed from authoredOn
    dosageinstruction_sequence: number;
    dosageinstruction_text: string;
    dosageinstruction_sequence_timing_repeat_frequency: number | null;
    dosageinstruction_sequence_timing_repeat_period: number;
    dosageinstruction_sequence_timing_repeat_periodunit: string;
    route_coding_system: string; // Changed from dosageInstruction_route_coding_system
    dosageinstruction_route_coding_code: string;
    dosageinstruction_route_coding_display: string;
    dosageinstruction_doseandrate_type_coding_system: string;
    dosageinstruction_doseandrate_type_coding_code: string;
    dosageinstruction_doseandrate_type_coding_display: string;
    dosageinstruction_doseandrate_dosequantity_unit: string;
    dosageinstruction_doseandrate_dosequantity_system: string;
    dosageinstruction_doseandrate_dosequantity_code: string;
    dispenserequest_dispenseinterval_value: number;
    dispenserequest_dispenseinterval_unit: string;
    dispenserequest_dispenseinterval_system: string;
    dispenserequest_dispenseinterval_code: string;
    dispenserequest_validityperiod_start: string;
    dispenserequest_validityperiod_end: string;
    dispenserequest_quantity_value: number;
    dispenserequest_quantity_unit: string;
    dispenserequest_quantity_system: string;
    dispenserequest_quantity_code: string;
    dispenserequest_expectedsupplyduration_unit: string | null;
    dispenserequest_expectedsupplyduration_system: string; // Was string | null
    dispenserequest_expectedsupplyduration_code: string | null;
    dispenserequest_expectedsupplyduration_value: number | null;
    org_id: string;
}

export interface dataPengeluaranObat {
    medication: medication[];
    medicationDispense: medicationDispense[];
}

// Interface for the message received from Redis Pub/Sub
export interface JobMessage {
    status: "new"; // Only expect 'new' status to trigger file reading
    filePath: string;
}

// Interface for the actual job data expected in the file and processed by the queue
export interface JobDetails {
    x: number;
    y: number;
    // Add other expected properties of your job data here
    description?: string; // Example optional field
}

import {
    Coding,
    SimpleQuantity,
    Identifier,
    Period,
    Reference, // Already imported, but good to note
    CodeableConcept,
    Annotation,
} from "./interfaceFHIR";
// Import FHIR resource types from interfaceValidation.ts
// These define the structure of the 'data' field in the DbRow interfaces
import {
    ObservationResource,
    CarePlanResource,
    ServiceRequestResource,
    DiagnosticReportResource,
    QuestionnaireResponseResource,
    RiskAssessmentResource,
    ClinicalImpressionResource, // Added for Prognosis
    CompositionResource, // Added for Resume Medis
    ProcedureResource, // Added for Tindakan/Prosedur Medis
    GoalResource, // Added for Tujuan Perawatan
    NutritionOrderResource,
    ConditionResource,
    MedicationAdministrationResource,
    MedicationResource,
    EncounterResource,
    resourceTemplate, // Added for Diet
} from "./interfaceValidation";

export interface DietDbRow {
    id: number;
    resource_type: "NutritionOrder";
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: NutritionOrderResource; // Parsed FHIR NutritionOrder resource
}

// Renaming EdukasiRow to EdukasiDbRow and aligning with DbRow pattern
export interface EdukasiDbRow {
    id: number;
    resource_type: "Procedure"; // Edukasi is often represented as a Procedure
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: ProcedureResource; // Parsed FHIR Procedure resource
}

// Renaming InstruksiMedikKeperawatanRow to InstruksiMedikKeperawatanDbRow
export interface InstruksiMedikKeperawatanDbRow {
    id: number;
    resource_type: "CarePlan"; // Instruksi Medik/Keperawatan often maps to CarePlan
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: CarePlanResource; // Parsed FHIR CarePlan resource
}

// Renaming InstruksiTindakLanjutRow to InstruksiTindakLanjutDbRow
export interface InstruksiTindakLanjutDbRow {
    id: number;
    resource_type: "ServiceRequest"; // Instruksi Tindak Lanjut often maps to ServiceRequest
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: ServiceRequestResource; // Parsed FHIR ServiceRequest resource
}

// Renaming KondisiSaatPulangRow to KondisiSaatPulangDbRow
export interface KondisiSaatPulangDbRow {
    id: number;
    resource_type: "Condition"; // Kondisi often maps to Condition
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: ConditionResource; // Parsed FHIR Condition resource
}

// This is the new DbRow structure for Medication Administration Pemberian Obat
export interface MedicationAdministrationPemberianObatDbRow {
    id: number;
    resource_type: "MedicationAdministration";
    fhir_id: string; // This would be the ID of the MedicationAdministration resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: MedicationAdministrationResource; // Parsed FHIR MedicationAdministration resource
    // The contained/referenced Medication would be part of data.contained or data.medicationReference
}

export interface MedicationPemberianObatDbRow {
    id: number;
    resource_type: "Medication";
    fhir_id: string; // This would be the ID of the MedicationAdministration resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: MedicationResource; // Parsed FHIR MedicationAdministration resource
    // The contained/referenced Medication would be part of data.contained or data.medicationReference
}

export interface DataPemberianObatFromRepo {
    medicationAdministration: MedicationAdministrationPemberianObatDbRow[];
    medication: MedicationPemberianObatDbRow[];
}

// Raw row structure for ServiceRequest data from the repository for Radiology
// These fields are assumed to be present in the rows returned by `dapatkanDataPemeriksaanPenunjangRadiologi`
// for resource_type = 'ServiceRequest' and module_tag LIKE '%Pemeriksaan Penunjang Radiologi%'.
// The actual column names from `_interoperability-agent` table should be mapped here.
export interface ServiceRequestRadiologiDbRow {
    id: number;
    resource_type: "ServiceRequest"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ServiceRequestResource; // Parsed FHIR ServiceRequest resource
}

// Renaming PemeriksaanFungsionalRow to PemeriksaanFungsionalDbRow
export interface PemeriksaanFungsionalDbRow {
    id: number;
    resource_type: "Observation"; // Pemeriksaan Fungsional often maps to Observation
    fhir_id: string;
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string;
    last_update: string;
    encounter_id: string;
    data: ObservationResource; // Parsed FHIR Observation resource
}

// Represents a row from the "_interoperability-agent" table for Tindakan/Prosedur Medis (ServiceRequest part)
export interface ServiceRequestTindakanDbRow {
    id: number;
    resource_type: "ServiceRequest"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ServiceRequestResource; // Parsed FHIR ServiceRequest resource
}

// Represents a row from the "_interoperability-agent" table for Tindakan/Prosedur Medis (Procedure part)
export interface ProcedureTindakanDbRow {
    id: number;
    resource_type: "Procedure"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    // ... other common columns ...
    data: ProcedureResource; // Parsed FHIR Procedure resource
}

// Represents a row from the "_interoperability-agent" table for Tindakan/Prosedur Medis (Observation part)
export interface ObservationTindakanDbRow {
    id: number;
    resource_type: "Observation"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    // ... other common columns ...
    data: ObservationResource; // Parsed FHIR Observation resource
}

export interface DataTindakanProsedurMedisFromRepo {
    serviceRequest: ServiceRequestTindakanDbRow[];
    procedure: ProcedureTindakanDbRow[];
    observation: ObservationTindakanDbRow[];
}

// Represents a row from the "_interoperability-agent" table for Tujuan Perawatan
export interface TujuanPerawatanDbRow {
    id: number;
    resource_type: "Goal"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string; // Though Goal is not directly tied to Encounter in FHIR, your table might have it
    data: GoalResource; // Parsed FHIR Goal resource
}

// Represents a row from the "_interoperability-agent" table for Resume Medis
export interface ResumeMedisDbRow {
    id: number;
    resource_type: "Composition"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: CompositionResource; // Parsed FHIR Composition resource
}

// Raw row structure for Observation data from the repository for Radiology
export interface ObservationRadiologiDbRow {
    id: number;
    resource_type: "Observation"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ObservationResource;
}

// Raw row structure for DiagnosticReport data from the repository for Radiology
export interface DiagnosticReportRadiologiDbRow {
    id: number;
    resource_type: "DiagnosticReport"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: DiagnosticReportResource; // Parsed FHIR DiagnosticReport resource
    // pemeriksaan_radiologi_correlation_id?: string; // For linking back to a ServiceRequest
}

// This interface represents the direct output of the
// `dapatkanDataPemeriksaanPenunjangRadiologi` repository.
// The `pengirimanDataPemeriksaanPenunjangRadiologiService` will consume this.
export interface DataPemeriksaanRadiologiFromRepo {
    serviceRequest: ServiceRequestRadiologiDbRow[];
    observation: ObservationRadiologiDbRow[];
    diagnosticReport: DiagnosticReportRadiologiDbRow[];
}

// Represents a row from the "_interoperability-agent" table for discharge Observations
export interface ObservationPemulanganDbRow {
    id: number;
    resource_type: "Observation"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date, depending on DB driver
    last_update: string; // Or Date
    encounter_id: string;
    data: ObservationResource; // Parsed FHIR Observation resource
    // Add any other columns selected by `SELECT *` from `_interoperability-agent` if needed
}

// Represents a row from the "_interoperability-agent" table for discharge CarePlans
export interface CarePlanPemulanganDbRow {
    id: number;
    resource_type: "CarePlan"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: CarePlanResource; // Parsed FHIR CarePlan resource
    // Add any other columns selected by `SELECT *` from `_interoperability-agent` if needed
}

// This interface represents the direct output of the
// `dapatkanDataPemulanganPasien` repository.
// The `pengirimanDataPemulanganPasienService` will consume this.
export interface DataPemulanganPasienFromRepo {
    observation: ObservationPemulanganDbRow[];
    carePlan: CarePlanPemulanganDbRow[];
}

// Represents a row from the "_interoperability-agent" table for Pengkajian Resep
export interface PengkajianResepDbRow {
    id: number;
    resource_type: "QuestionnaireResponse"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: QuestionnaireResponseResource; // Parsed FHIR QuestionnaireResponse resource
}

// Data structure for the service if it were to consume an array of these rows
// export interface DataPengkajianResepFromRepo {
//     questionnaireResponse: PengkajianResepDbRow[];
// }

// Represents a row from the "_interoperability-agent" table for Penilaian Risiko
export interface PenilaianRisikoDbRow {
    id: number;
    resource_type: "RiskAssessment"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: RiskAssessmentResource; // Parsed FHIR RiskAssessment resource
}

// Represents a row from the "_interoperability-agent" table for Prognosis
export interface PrognosisDbRow {
    id: number;
    resource_type: "ClinicalImpression"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ClinicalImpressionResource; // Parsed FHIR ClinicalImpression resource
}

// Represents a row from the "_interoperability-agent" table for Rasional Klinis
export interface RasionalKlinisDbRow {
    id: number;
    resource_type: "ClinicalImpression"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ClinicalImpressionResource; // Parsed FHIR ClinicalImpression resource
}

// Represents a row from the "_interoperability-agent" table for Rencana Tindak Lanjut
export interface RencanaTindakLanjutDbRow {
    id: number;
    resource_type: "ServiceRequest"; // Literal type
    fhir_id: string; // UUID of the FHIR resource
    patient_ihs_id: string;
    module_tag: string;
    create_db_at: string; // Or Date
    last_update: string; // Or Date
    encounter_id: string;
    data: ServiceRequestResource; // Parsed FHIR ServiceRequest resource
}

// Define the structure for the processed resources bundle
// This object will hold the results (arrays of resourceTemplate) from each service
export interface ProcessedResourcesBundle {
    kunjunganRawatInap?: resourceTemplate[]; // Assuming dataKunjunganRawatInapService returns resourceTemplate[] (even if it's just one item)
    anamnesis?: resourceTemplate[]; // Contains Condition and AllergyIntolerance
    pemeriksaanFisik?: resourceTemplate[]; // Contains Observation
    peresepanObat?: resourceTemplate[]; // Contains Medication and MedicationRequest
    pengeluaranObat?: resourceTemplate[]; // Contains Medication and MedicationDispense
    pemeriksaanLab?: resourceTemplate[]; // Contains ServiceRequest, Specimen, Observation, DiagnosticReport
    diagnosis?: resourceTemplate[]; // Contains Condition
    diet?: resourceTemplate[]; // Contains NutritionOrder
    edukasi?: resourceTemplate[]; // Contains Procedure
    instruksiMedikKeperawatan?: resourceTemplate[]; // Contains CarePlan
    instruksiTindakLanjutRujuk?: resourceTemplate[]; // Contains ServiceRequest
    kondisiSaatPulang?: resourceTemplate[]; // Contains Condition
    pemberianObat?: resourceTemplate[]; // Contains MedicationAdministration (and potentially contained Medication)
    pemeriksaanFungsional?: resourceTemplate[]; // Contains Observation
    pemeriksaanRadiologi?: resourceTemplate[]; // Contains ServiceRequest, Observation, DiagnosticReport
    pemulanganPasien?: resourceTemplate[]; // Contains Observation, CarePlan
    pengkajianResep?: resourceTemplate[]; // Contains QuestionnaireResponse
    penilaianRisiko?: resourceTemplate[]; // Contains RiskAssessment
    prognosis?: resourceTemplate[]; // Contains ClinicalImpression
    rasionalKlinis?: resourceTemplate[]; // Contains ClinicalImpression
    rencanaTindakLanjut?: resourceTemplate[]; // Contains ServiceRequest
    resumeMedis?: resourceTemplate[]; // Contains Composition
    tindakanProsedurMedis?: resourceTemplate[]; // Contains ServiceRequest, Procedure, Observation
    tujuanPerawatan?: resourceTemplate[]; // Contains Goal
    caraKeluarRumahSakit?: resourceTemplate[]; // Contains Encounter (Discharge)
}

// Add this to interface.ts
// if it's not already defined or if you need a specific one for this service.
// This assumes your DB stores a full Encounter resource in the 'data' column for these records.
export interface CaraKeluarDbRow {
    id: number; // Database primary key
    resource_type: "Encounter";
    fhir_id: string; // FHIR ID of this Encounter resource (e.g., from dataBundle.jsonc TS-27)
    patient_ihs_id: string;
    module_tag: string; // e.g., "Cara Keluar dari Rumah Sakit"
    create_db_at: string;
    last_update: string;
    encounter_id: string; // ID of the primary encounter this discharge is related to
    data: EncounterResource; // Parsed FHIR Encounter resource from DB
}

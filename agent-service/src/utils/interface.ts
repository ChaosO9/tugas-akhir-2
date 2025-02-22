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
    diagnosa: Diagnosa[];
    location_poli_id: string;
    unit_nama: string;
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
    medication_uuid: string | null;
    identifier_value_1: string | null;
    identifier_value_2: string | null;
    medicationReference_display: string | null; // Use camelCase for consistency
    patient_id: string | null;
    patient_name: string | null;
    practitioner_id: string | null;
    practitioner_name: string | null;
    encounter: string | null;
    authoredon: string | null; // Or Date
    dosageInstruction_sequence: number | null;
    dosageInstruction_text: string | null;
    dosageInstruction_sequence_timing_repeat_frequency: number | null;
    dosageInstruction_sequence_timing_repeat_period: number | null;
    dosageInstruction_sequence_timing_repeat_periodUnit: string | null; // Use camelCase
    route_coding_system: string | null; // Use camelCase for routeCodingSystem
    dosageInstruction_route_coding_code: string | null;
    dosageInstruction_route_coding_display: string | null;
    dosageInstruction_doseAndRate_type_coding_system: string | null; // Use camelCase
    dosageInstruction_doseAndRate_type_coding_code: string | null; // Use camelCase
    dosageInstruction_doseAndRate_type_coding_display: string | null; // Use camelCase
    dosageInstruction_doseAndRate_doseQuantity_unit: string | null; // Use camelCase
    dosageInstruction_doseAndRate_doseQuantity_system: string | null; // Use camelCase
    dosageInstruction_doseAndRate_doseQuantity_code: string | null; // Use camelCase
    dispenseRequest_dispenseInterval_value: number | null; // Use camelCase
    dispenseRequest_dispenseInterval_unit: string | null; // Use camelCase
    dispenseRequest_dispenseInterval_system: string | null; // Use camelCase
    dispenseRequest_dispenseInterval_code: string | null; // Use camelCase
    dispenseRequest_validityPeriod_start: string | null; // Use camelCase
    dispenseRequest_validityPeriod_end: string | null; // Use camelCase
    dispenseRequest_quantity_value: number | null; // Use camelCase
    dispenseRequest_quantity_unit: string | null; // Use camelCase
    dispenseRequest_quantity_system: string | null; // Use camelCase
    dispenseRequest_quantity_code: string | null; // Use camelCase
    dispenseRequest_expectedSupplyDuration_unit: string | null; // Use camelCase
    dispenseRequest_expectedSupplyDuration_system: string | null; // Use camelCase
    dispenseRequest_expectedSupplyDuration_code: string | null; // Use camelCase
    dispenseRequest_expectedSupplyDuration_value: number | null; // Use camelCase
    org_id: string;
}

export interface dataPeresepanObat {
    medication: medication[];
    medicationRequest: medicationRequest[];
}

export interface medicationDispense {
    medicationRequest_uuid: string | null;
    identifier_value_1: string | null;
    identifier_value_2: string | null;
    medicationReference_display: string | null;
    patient_id: string | null;
    patient_name: string | null;
    practitioner_id: string | null;
    practitioner_name: string | null;
    encounter: string | null; // Assuming this is a date string
    authoredOn: string | null; // Assuming this is a date string
    dosageInstruction_sequence: number | null;
    dosageInstruction_text: string | null;
    dosageInstruction_sequence_timing_repeat_frequency: number | null;
    dosageInstruction_sequence_timing_repeat_period: number | null;
    dosageInstruction_sequence_timing_repeat_periodUnit: string | null;
    dosageInstruction_route_coding_system: string | null;
    dosageInstruction_route_coding_code: string | null;
    dosageInstruction_route_coding_display: string | null;
    dosageInstruction_doseAndRate_type_coding_system: string | null;
    dosageInstruction_doseAndRate_type_coding_code: string | null;
    dosageInstruction_doseAndRate_type_coding_display: string | null;
    dosageInstruction_doseAndRate_doseQuantity_unit: string | null;
    dosageInstruction_doseAndRate_doseQuantity_system: string | null;
    dosageInstruction_doseAndRate_doseQuantity_code: string | null;
    dispenseRequest_dispenseInterval_value: number | null;
    dispenseRequest_dispenseInterval_unit: string | null;
    dispenseRequest_dispenseInterval_system: string | null;
    dispenseRequest_dispenseInterval_code: string | null;
    dispenseRequest_validityPeriod_start: string | null; // Assuming date string
    dispenseRequest_validityPeriod_end: string | null; // Assuming date string
    dispenseRequest_quantity_value: number | null;
    dispenseRequest_quantity_unit: string | null;
    dispenseRequest_quantity_system: string | null;
    dispenseRequest_quantity_code: string | null;
    dispenseRequest_expectedSupplyDuration_unit: string | null;
    dispenseRequest_expectedSupplyDuration_system: string | null;
    dispenseRequest_expectedSupplyDuration_code: string | null;
    dispenseRequest_expectedSupplyDuration_value: number | null;
    org_id: string | null;
}

export interface dataPengeluaranObat {
    medication: medication[];
    medicationDispense: medicationDispense[];
}

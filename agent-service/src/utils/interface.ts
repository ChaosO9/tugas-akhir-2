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

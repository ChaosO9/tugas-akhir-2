import {
    Age,
    Annotation,
    Attachment,
    CodeableConcept,
    Coding,
    ContactDetail,
    Dosage,
    Duration,
    Extension,
    Identifier,
    Period,
    Quantity,
    Ratio,
    Reference,
    SampledData,
    SimpleQuantity,
    Timing,
} from "./interfaceFHIR";

export interface resourceTemplate {
    fullUrl: string;
    resource:
        | EncounterResource
        | ObservationResource
        | MedicationResource
        | AllergyIntoleranceResource
        | ClinicalImpressionResource
        | ServiceRequestResource
        | SpecimenResource
        | DiagnosticReportResource
        | MedicationRequestResource
        | MedicationDispenseResource;
    request: requestHttp;
}

interface requestHttp {
    method: string;
    url: string;
}

// Observation
interface ObservationResource {
    identifier?: Identifier[]; // Identifier[]
    basedOn?: Reference[]; // Reference[]
    partOf?: Reference[]; // Reference[]
    status: string; // code
    category?: CodeableConcept[]; // CodeableConcept[]
    code: CodeableConcept; // CodeableConcept
    subject: Reference; // Reference
    focus?: Reference[]; // Reference[]
    encounter?: Reference; // Reference
    effectiveDateTime?: string; // dateTime
    effectivePeriod?: Period; // Period
    effectiveTiming?: Timing; // Timing
    effectiveInstant?: string; // instant
    issued?: string; // instant
    performer?: Reference[]; // Reference[]
    valueQuantity?: Quantity; // Quantity
    valueCodeableConcept?: CodeableConcept; // CodeableConcept
    valueString?: string; // string
    valueBoolean?: boolean; // boolean
    valueInteger?: number; // integer
    valueRange?: Range; // Range
    valueRatio?: Ratio; // Ratio
    valueSampledData?: SampledData; // SampledData
    valueTime?: string; // time
    valueDateTime?: string; // dateTime
    valuePeriod?: Period; // Period
    dataAbsentReason?: CodeableConcept; // CodeableConcept
    interpretation?: CodeableConcept[]; // CodeableConcept[]
    note?: Annotation[]; // Annotation[]
    bodySite?: CodeableConcept; // CodeableConcept
    method?: CodeableConcept; // CodeableConcept
    specimen?: Reference; // Reference
    device?: Reference; // Reference
    referenceRange?: ObservationReferenceRange[]; // ObservationReferenceRange[]
    hasMember?: Reference[]; // Reference[]
    derivedFrom?: Reference[]; // Reference[]
    component?: ObservationComponent[]; // ObservationComponent[]
}

// ObservationReferenceRange
interface ObservationReferenceRange {
    low?: SimpleQuantity; // SimpleQuantity
    high?: SimpleQuantity; // SimpleQuantity
    type?: CodeableConcept; // CodeableConcept
    appliesTo?: CodeableConcept[]; // CodeableConcept[]
    age?: Range; // Range
    text?: string; // string
}

// ObservationComponent
interface ObservationComponent {
    code: CodeableConcept; // CodeableConcept
    valueQuantity?: Quantity; // Quantity
    valueCodeableConcept?: CodeableConcept; // CodeableConcept
    valueString?: string; // string
    valueBoolean?: boolean; // boolean
    valueInteger?: number; // integer
    valueRange?: Range; // Range
    valueRatio?: Ratio; // Ratio
    valueSampledData?: SampledData; // SampledData
    valueTime?: string; // time
    valueDateTime?: string; // dateTime
    valuePeriod?: Period; // Period
    dataAbsentReason?: CodeableConcept; // CodeableConcept
    interpretation?: CodeableConcept[]; // CodeableConcept[]
    referenceRange?: ObservationReferenceRange[]; // ObservationReferenceRange[]
}

// Medication
interface MedicationResource {
    identifier?: Identifier[]; // Identifier[]
    code?: CodeableConcept; // CodeableConcept
    status?: string; // code
    manufacturer?: Reference; // Reference
    form?: CodeableConcept; // CodeableConcept
    amount?: Ratio; // Ratio
    ingredient?: MedicationIngredient[]; // MedicationIngredient[]
    batch?: MedicationBatch; // MedicationBatch
    extension?: Extension[]; // Extension[]
}

// MedicationIngredient
interface MedicationIngredient {
    itemCodeableConcept?: CodeableConcept; // CodeableConcept
    itemReference?: Reference; // Reference
    isActive?: boolean; // boolean
    strength?: Ratio; // Ratio
}

// MedicationBatch
interface MedicationBatch {
    lotNumber?: string; // string
    expirationDate?: string; // dateTime
}

// Encounter
export interface EncounterResource {
    resourceType: "Encounter";
    identifier?: Identifier[]; // Identifier[]
    status: string; // code
    statusHistory?: EncounterStatusHistory[]; // EncounterStatusHistory[]
    class: Coding; // Coding
    classHistory?: EncounterClassHistory[]; // EncounterClassHistory[]
    type?: CodeableConcept[]; // CodeableConcept[]
    serviceType?: CodeableConcept; // CodeableConcept
    priority?: CodeableConcept; // CodeableConcept
    subject: Reference; // Reference
    episodeOfCare?: Reference[]; // Reference[]
    basedOn?: Reference[]; // Reference[]
    participant?: EncounterParticipant[]; // EncounterParticipant[]
    appointment?: Reference[]; // Reference[]
    period?: Period; // Period
    length?: Duration; // Duration
    reasonCode?: CodeableConcept[]; // CodeableConcept[]
    reasonReference?: Reference[]; // Reference[]
    diagnosis?: EncounterDiagnosis[]; // EncounterDiagnosis[]
    account?: Reference[]; // Reference[]
    hospitalization?: EncounterHospitalization; // EncounterHospitalization
    location?: EncounterLocation[]; // EncounterLocation[]
    serviceProvider?: Reference; // Reference
    partOf?: Reference; // Reference
}

// EncounterStatusHistory
interface EncounterStatusHistory {
    status: string; // code
    period: Period; // Period
}

// EncounterClassHistory
interface EncounterClassHistory {
    class: Coding; // Coding
    period: Period; // Period
}

// EncounterParticipant
interface EncounterParticipant {
    type?: CodeableConcept[]; // CodeableConcept[]
    period?: Period; // Period
    individual?: Reference; // Reference
}

// EncounterDiagnosis
interface EncounterDiagnosis {
    condition: Reference; // Reference
    use?: CodeableConcept; // CodeableConcept
    rank?: number; // positiveInt
}

// EncounterHospitalization
interface EncounterHospitalization {
    preAdmissionIdentifier?: Identifier; // Identifier
    origin?: Reference; // Reference
    admitSource?: CodeableConcept; // CodeableConcept
    reAdmission?: CodeableConcept; // CodeableConcept
    dietPreference?: CodeableConcept[]; // CodeableConcept[]
    specialArrangement?: CodeableConcept[]; // CodeableConcept[]
    destination?: Reference; // Reference
    dischargeDisposition?: CodeableConcept; // CodeableConcept
}

// EncounterLocation
interface EncounterLocation {
    location: Reference; // Reference
    status?: string; // code
    physicalType?: CodeableConcept; // CodeableConcept
    period?: Period; // Period
}

// AllergyIntolerance
interface AllergyIntoleranceResource {
    identifier?: Identifier[]; // Identifier[]
    clinicalStatus?: CodeableConcept; // CodeableConcept
    verificationStatus?: CodeableConcept; // CodeableConcept
    type?: string; // code
    category: string[]; // code[]
    criticality?: string; // code
    code: CodeableConcept; // CodeableConcept
    patient: Reference; // Reference
    encounter?: Reference; // Reference
    onsetDateTime?: string; // dateTime
    onsetAge?: Age; // Age
    onsetPeriod?: Period; // Period
    onsetRange?: Range; // Range
    onsetString?: string; // string
    recordedDate?: string; // dateTime
    recorder?: Reference; // Reference
    asserter?: Reference; // Reference
    lastOccurrence?: string; // dateTime
    note?: Annotation[]; // Annotation[]
    reaction?: AllergyIntoleranceReaction[]; // AllergyIntoleranceReaction[]
}

// AllergyIntoleranceReaction
interface AllergyIntoleranceReaction {
    substance?: CodeableConcept; // CodeableConcept
    manifestation: CodeableConcept[]; // CodeableConcept[]
    description?: string; // string
    onset?: string; // dateTime
    severity?: string; // code
    exposureRoute?: CodeableConcept; // CodeableConcept
    note?: Annotation[]; // Annotation[]
}

// ClinicalImpression
interface ClinicalImpressionResource {
    identifier?: Identifier[]; // Identifier[]
    status: string; // code
    statusReason?: CodeableConcept; // CodeableConcept
    code?: CodeableConcept; // CodeableConcept
    description?: string; // string
    subject: Reference; // Reference
    encounter: Reference; // Reference
    effectiveDateTime?: string; // dateTime
    effectivePeriod?: Period; // Period
    date?: string; // dateTime
    assessor?: Reference; // Reference
    previous?: Reference; // Reference
    problem?: Reference[]; // Reference[]
    investigation?: ClinicalImpressionInvestigation[]; // ClinicalImpressionInvestigation[]
    protocol?: string[]; // uri[]
    summary?: string; // string
    finding?: ClinicalImpressionFinding[]; // ClinicalImpressionFinding[]
    prognosisCodeableConcept: CodeableConcept[]; // CodeableConcept[]
    prognosisReference?: Reference[]; // Reference[]
    supportingInfo?: Reference[]; // Reference[]
    note?: Annotation[]; // Annotation[]
}

// ClinicalImpressionInvestigation
interface ClinicalImpressionInvestigation {
    code: CodeableConcept; // CodeableConcept
    item?: Reference[]; // Reference[]
}

// ClinicalImpressionFinding
interface ClinicalImpressionFinding {
    itemCodeableConcept?: CodeableConcept; // CodeableConcept
    itemReference?: Reference; // Reference
    basis?: string; // string
}

// ServiceRequest
interface ServiceRequestResource {
    identifier?: Identifier[]; // Identifier[]
    instantiatesCanonical?: string[]; // canonical[]
    instantiatesUri?: string[]; // uri[]
    basedOn?: Reference[]; // Reference[]
    replaces?: Reference[]; // Reference[]
    requisition?: Identifier; // Identifier
    status: string; // code
    intent: string; // code
    category?: CodeableConcept[]; // CodeableConcept[]
    priority?: string; // code
    doNotPerform?: boolean; // boolean
    code: CodeableConcept; // CodeableConcept
    orderDetail?: CodeableConcept[]; // CodeableConcept[]
    quantityQuantity?: Quantity; // Quantity
    quantityRatio?: Ratio; // Ratio
    quantityRange?: Range; // Range
    subject: Reference; // Reference
    encounter: Reference; // Reference
    occurrenceDateTime: string; // dateTime
    occurrencePeriod?: Period; // Period
    occurrenceTiming?: Timing; // Timing
    asNeededBoolean?: boolean; // boolean
    asNeededCodeableConcept?: CodeableConcept; // CodeableConcept
    authoredOn?: string; // dateTime
    requester?: Reference; // Reference
    performerType?: CodeableConcept; // CodeableConcept
    performer?: Reference[]; // Reference[]
    locationCode?: CodeableConcept[]; // CodeableConcept[]
    locationReference?: Reference[]; // Reference[]
    reasonCode?: CodeableConcept[]; // CodeableConcept[]
    reasonReference?: Reference[]; // Reference[]
    insurance?: Reference[]; // Reference[]
    supportingInfo?: Reference[]; // Reference[]
    specimen?: Reference[]; // Reference[]
    bodySite?: CodeableConcept[]; // CodeableConcept[]
    note?: Annotation[]; // Annotation[]
    patientInstruction?: string; // string
    relevantHistory?: Reference[]; // Reference[]
}

// Specimen
interface SpecimenResource {
    identifier?: Identifier[]; // Identifier[]
    accessionIdentifier?: Identifier; // Identifier
    status: string; // code
    type: CodeableConcept; // CodeableConcept
    subject: Reference; // Reference
    receivedTime?: string; // dateTime
    parent?: Reference[]; // Reference[]
    request?: Reference[]; // Reference[]
    collection?: SpecimenCollection; // SpecimenCollection
    processing?: SpecimenProcessing[]; // SpecimenProcessing[]
    container?: SpecimenContainer[]; // SpecimenContainer[]
    condition?: CodeableConcept[]; // CodeableConcept[]
    note?: Annotation[]; // Annotation[]
    extension?: SpecimenExtension[]; // Extension[]
}

// SpecimenExtension
interface SpecimenExtension {
    transportedTime: string; // dateTime
    transportedPerson?: ContactDetail; // ContactDetail
    receivedPerson?: Reference; // Reference
}

// SpecimenCollection
interface SpecimenCollection {
    collector?: Reference; // Reference
    collectedDateTime?: string; // dateTime
    collectedPeriod?: Period; // Period
    duration?: Duration; // Duration
    quantity?: SimpleQuantity; // SimpleQuantity
    method?: CodeableConcept; // CodeableConcept
    bodySite?: CodeableConcept; // CodeableConcept
    fastingStatusCodeableConcept?: CodeableConcept; // CodeableConcept
    fastingStatusDuration?: Duration; // Duration
}

// SpecimenProcessing
interface SpecimenProcessing {
    description?: string; // string
    procedure?: CodeableConcept; // CodeableConcept
    additive?: Reference[]; // Reference[]
    timeDateTime?: string; // dateTime
    timePeriod?: Period; // Period
}

// SpecimenContainer
interface SpecimenContainer {
    identifier?: Identifier[]; // Identifier[]
    description?: string; // string
    type?: CodeableConcept; // CodeableConcept
    capacity?: SimpleQuantity; // SimpleQuantity
    specimenQuantity?: SimpleQuantity; // SimpleQuantity
    additiveCodeableConcept?: CodeableConcept; // CodeableConcept
    additiveReference?: Reference; // Reference
}

// DiagnosticReport
interface DiagnosticReportResource {
    identifier?: Identifier[]; // Identifier[]
    basedOn?: Reference[]; // Reference[]
    status: string; // code
    category?: CodeableConcept[]; // CodeableConcept[]
    code: CodeableConcept; // CodeableConcept
    subject: Reference; // Reference
    encounter: Reference; // Reference
    effectiveDateTime?: string; // dateTime
    effectivePeriod?: Period; // Period
    issued?: string; // instant
    performer?: Reference[]; // Reference[]
    resultInterpreter?: Reference[]; // Reference[]
    specimen?: Reference[]; // Reference[]
    result?: Reference[]; // Reference[]
    imagingStudy?: Reference[]; // Reference[]
    media?: DiagnosticReportMedia[]; // DiagnosticReportMedia[]
    conclusion?: string; // string
    conclusionCode?: CodeableConcept[]; // CodeableConcept[]
    presentedForm?: Attachment[]; // Attachment[]
}

// DiagnosticReportMedia
interface DiagnosticReportMedia {
    comment?: string; // string
    link: Reference; // Reference
}

// MedicationRequest
interface MedicationRequestResource {
    identifier?: Identifier[]; // Identifier[]
    status: string; // code
    statusReason?: CodeableConcept; // CodeableConcept
    intent: string; // code
    category?: CodeableConcept[]; // CodeableConcept[]
    priority?: string; // code
    reportedBoolean?: boolean; // boolean
    medicationReference?: Reference; // Reference
    subject: Reference; // Reference
    encounter?: Reference; // Reference
    authoredOn?: string; // dateTime
    requester?: Reference; // Reference
    performer?: Reference[]; // Reference[]
    performerType?: CodeableConcept; // CodeableConcept
    recorder?: Reference; // Reference
    reasonCode?: CodeableConcept[]; // CodeableConcept[]
    reasonReference?: Reference[]; // Reference[]
    basedOn?: Reference[]; // Reference[]
    courseOfTherapyType?: CodeableConcept; // CodeableConcept
    insurance?: Reference[]; // Reference[]
    note?: Annotation[]; // Annotation[]
    dosageInstruction?: Dosage[]; // Dosage[]
    dispenseRequest?: MedicationRequestDispenseRequest; //
    // MedicationRequestDispenseRequest
    substitution?: MedicationRequestSubstitution; // MedicationRequestSubstitution
}

// MedicationRequestDispenseRequest
interface MedicationRequestDispenseRequest {
    dispenseInterval?: Duration; // Duration
    validityPeriod?: Period; // Period
    numberOfRepeatsAllowed?: number; // unsignedInt
    quantity?: SimpleQuantity; // SimpleQuantity
    expectedSupplyDuration?: Duration; // Duration
}

// MedicationRequestSubstitution
interface MedicationRequestSubstitution {
    allowedBoolean?: boolean; // boolean
    allowedCodeableConcept?: CodeableConcept; // CodeableConcept
}

// MedicationDispense
interface MedicationDispenseResource {
    identifier?: Identifier[]; // Identifier[]
    partOf?: Reference[]; // Reference[]
    status: string; // code
    category?: CodeableConcept; // CodeableConcept
    medicationReference: Reference; // Reference
    subject: Reference; // Reference
    context?: Reference; // Reference
    performer?: MedicationDispensePerformer[]; // MedicationDispensePerformer[]
    location?: Reference; // Reference
    authorizingPrescription?: Reference[]; // Reference[]
    quantity?: SimpleQuantity; // SimpleQuantity
    daysSupply?: SimpleQuantity; // SimpleQuantity
    whenPrepared?: string; // dateTime
    whenHandedOver?: string; // dateTime
    dosageInstruction?: Dosage[]; // Dosage[]
    substitution?: MedicationDispenseSubstitution; // MedicationDispenseSubstitution
}

// MedicationDispensePerformer
interface MedicationDispensePerformer {
    function?: CodeableConcept; // CodeableConcept
    actor: Reference; // Reference
}

// MedicationDispenseSubstitution
interface MedicationDispenseSubstitution {
    wasSubstituted: boolean; // boolean
    type?: CodeableConcept; // CodeableConcept
    reason?: CodeableConcept[]; // CodeableConcept[]
    responsibleParty?: Reference[]; // Reference[]
}

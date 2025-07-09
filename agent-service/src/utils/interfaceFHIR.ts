// Tipe Data Umum

// Address
export interface Address {
    use: string; // code
    type: string; // code
    text?: string; // string
    line?: string[]; // string[]
    city?: string; // string
    district?: string; // string
    state?: string; // string
    postalCode?: string; // string
    country?: string; // string
    period?: Period; // period
}

// Age
export interface Age {
    value: number; // decimal
    unit: string; // string
    system: string; // uri
    code: string; // code
}

// Annotation
export interface Annotation {
    authorReference?: Reference; // reference
    authorString?: string; // string
    time?: string; // dateTime
    text: string; // markdown
}

// Attachment
export interface Attachment {
    contentType?: string; // code
    language?: string; // code
    data?: string; // base64Binary
    url?: string; // url
    size?: number; // unsignedInt
    hash?: string; // base64Binary
    title?: string; // string
    creation?: string; // dateTime
}

// CodeableConcept
export interface CodeableConcept {
    coding?: Coding[]; // coding[]
    text?: string; // string
}

// CodeableReference
export interface CodeableReference {
    concept?: CodeableConcept; // CodeableConcept
    reference?: Reference; // Reference
}

// Coding
export interface Coding {
    system?: string; // uri
    version?: string; // string
    code?: string; // code
    display?: string; // string
    userSelected?: boolean; // boolean
}

// ContactPoint
export interface ContactPoint {
    system?: string; // code
    value?: string; // string
    use?: string; // code
    rank?: number; // positiveInt
    period?: Period; // Period
}

// Count
export interface Count {
    value: number; // decimal
    unit: string; // string
    system: string; // uri
    code: string; // code
}

// Distance
export interface Distance {
    value: number; // decimal
    unit: string; // string
    system: string; // uri
    code: string; // code
}

// Duration
export interface Duration {
    value: number; // decimal
    unit: string; // string
    system: string; // uri
    code: string; // code
}

// HumanName
export interface HumanName {
    use?: string; // code
    text?: string; // string
    family?: string; // string
    given?: string[]; // string[]
    prefix?: string[]; // string[]
    suffix?: string[]; // string[]
    period?: Period; // Period
}

// Identifier
export interface Identifier {
    use?: string; // code
    type?: CodeableConcept; // CodeableConcept
    system?: string; // uri
    value?: string; // string
    period?: Period; // Period
    assigner?: Reference; // Reference
}

// Money
export interface Money {
    value: number; // decimal
    currency: string; // code
}

// MoneyQuantity
export interface MoneyQuantity {
    value: number; // decimal
    currency: string; // code
}

// Period
export interface Period {
    start?: string; // dateTime
    end?: string; // dateTime
}

// Quantity
export interface Quantity {
    value: number; // decimal
    comparator?: string; // code
    unit?: string; // string
    system?: string; // uri
    code?: string; // code
}

// Range
export interface Range {
    low?: SimpleQuantity; // SimpleQuantity
    high?: SimpleQuantity; // SimpleQuantity
}

// Ratio
export interface Ratio {
    numerator?: Quantity; // Quantity
    denominator?: Quantity; // Quantity
}

// RatioRange
export interface RatioRange {
    lowNumerator?: SimpleQuantity; // SimpleQuantity
    highNumerator?: SimpleQuantity; // SimpleQuantity
    denominator?: SimpleQuantity; // SimpleQuantity
}

// Reference
export interface Reference {
    reference?: string; // string
    type?: string; // uri
    identifier?: Identifier; // Identifier
    display?: string; // string
}

// SampledData
export interface SampledData {
    origin: SimpleQuantity; // SimpleQuantity
    period: number; // decimal
    factor?: number; // decimal
    lowerLimit?: number; // decimal
    upperLimit?: number; // decimal
    dimensions: number; // positiveInt
    data: string; // string
}

// Signature
export interface Signature {
    type: Coding[]; // Coding[]
    when: string; // instant
    who: Reference; // Reference
    onBehalfOf?: Reference; // Reference
    targetFormat?: string; // code
    sigFormat?: string; // code
    data?: string; // base64Binary
}

// SimpleQuantity
export interface SimpleQuantity {
    value: number; // decimal
    unit: string; // string
    system: string; // uri
    code: string; // code
}

// Timing
export interface Timing {
    event?: string[]; // dateTime[]
    repeat?: {
        boundsDuration?: Duration; // Duration
        boundsRange?: Range; // Range
        boundsPeriod?: Period; // Period
        count?: number; // positiveInt
        countMax?: number; // positiveInt
        duration?: number; // decimal
        durationMax?: number; // decimal
        durationUnit?: string; // code
        frequency?: number; // positiveInt
        frequencyMax?: number; // positiveInt
        period?: number; // decimal
        periodMax?: number; // decimal
        periodUnit?: string; // code
        dayOfWeek?: string[]; // code[]
        timeOfDay?: string[]; // time[]
        when?: string[]; // code[]
        offset?: number; // unsignedInt
    };
    code?: CodeableConcept; // CodeableConcept
}

// Tipe Data Metadata

// ContactDetail
export interface ContactDetail {
    name?: string; // string
    telecom?: ContactPoint[]; // ContactPoint[]
}

// Contributor
export interface Contributor {
    type: string; // code
    name: string; // string
    contact?: ContactDetail[]; // ContactDetail[]
}

// DataRequirement
export interface DataRequirement {
    type: string; // code
    profile?: string[]; // canonical[]
    subjectCodeableConcept?: CodeableConcept; // CodeableConcept
    subjectReference?: Reference; // Reference
    mustSupport?: string[]; // string[]
    codeFilter?: Element[]; // Element[]
    dateFilter?: Element[]; // Element[]
    limit?: number; // positiveInt
    sort?: Element[]; // Element[]
}

// Expression
export interface Expression {
    description?: string; // string
    name?: string; // id
    language: string; // code
    expression?: string; // string
    reference?: string; // uri
}

// ParameterDefinition
export interface ParameterDefinition {
    name?: string; // code
    use: string; // code
    min?: number; // integer
    max?: string; // string
    documentation?: string; // string
    type: string; // code
    profile?: string; // canonical
}

// RelatedArtifact
export interface RelatedArtifact {
    type: string; // code
    label?: string; // string
    display?: string; // string
    citation?: string; // markdown
    url?: string; // url
    document?: Attachment; // Attachment
    resource?: string; // canonical
}

// TriggerDefinition
export interface TriggerDefinition {
    type: string; // code
    name?: string; // string
    timingTiming?: Timing; // Timing
    timingReference?: Reference; // Reference
    timingDate?: string; // date
    timingDateTime?: string; // dateTime
    data?: DataRequirement[]; // DataRequirement[]
    condition?: Expression; // Expression
}

// UsageContext
export interface UsageContext {
    code: Coding; // Coding
    valueCodeableConcept?: CodeableConcept; // CodeableConcept
    valueQuantity?: Quantity; // Quantity
    valueRange?: Range; // Range
    valueReference?: Reference; // Reference
}

// Tipe Data Khusus

// CodeableReference
export interface CodeableReference {
    concept?: CodeableConcept; // CodeableConcept
    reference?: Reference; // Reference
}

// Dosage
export interface Dosage {
    sequence?: number; // integer
    text?: string; // string
    additionalInstruction?: CodeableConcept[]; // CodeableConcept[]
    patientInstruction?: string; // string
    timing?: Timing; // Timing
    asNeededBoolean?: boolean; // boolean
    asNeededCodeableConcept?: CodeableConcept; // CodeableConcept
    site?: CodeableConcept; // CodeableConcept
    route?: CodeableConcept; // CodeableConcept
    method?: CodeableConcept; // CodeableConcept
    doseAndRate?: {
        type?: CodeableConcept; // CodeableConcept
        doseRange?: Range; // Range
        doseQuantity?: SimpleQuantity; // SimpleQuantity
        rateRatio?: Ratio; // Ratio
        rateRange?: Range; // Range
        rateQuantity?: SimpleQuantity; // SimpleQuantity
    }[];
    maxDosePerPeriod?: Ratio; // Ratio
    maxDosePerAdministration?: SimpleQuantity; // SimpleQuantity
    maxDosePerLifetime?: SimpleQuantity; // SimpleQuantity
}

// Extension
export interface Extension {
    url: string; // uri
    value?: any; // any
    valueCodeableConcept?: CodeableConcept; // CodeableConcept
}

// Meta
export interface Meta {
    versionId?: string; // id
    lastUpdated?: string; // instant
    source?: string; // uri
    profile?: string[]; // canonical[]
    security?: Coding[]; // Coding[]
    tag?: Coding[]; // Coding[]
}

// Narrative
export interface Narrative {
    status: string; // code
    div: string; // xhtml
}

// Reference
export interface Reference {
    reference?: string; // string
    type?: string; // uri
    identifier?: Identifier; // Identifier
    display?: string; // string
}

// XHTML
type XHTML = string; // xhtml

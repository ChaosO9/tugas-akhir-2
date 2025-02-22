const Joi = require("joi");

// Define the schema for patient data, with validation and default values
const patientSchema = Joi.object({
    id: Joi.string().required(), // Required field
    name: Joi.string().required(), // Required field
    diagnosis: Joi.string().default(null), // Optional field with default value
    treatment: Joi.string().default(null), // Optional field with default value
    hospitalization: Joi.object({
        admitted: Joi.boolean().default(false), // Default is false
        duration: Joi.number().default(0), // Default is 0
    }).default({}), // Default empty object if not provided
});

// Function to validate and generate JSON
function generatePatientJson(patientData: Object) {
    // Validate the input and apply defaults
    const { error, value: validatedPatient } = patientSchema.validate(
        patientData,
        {
            abortEarly: false, // Return all validation errors
            allowUnknown: true, // Allow additional fields
            stripUnknown: true, // Remove any extra fields not in schema
        },
    );

    if (error) {
        throw new Error(
            "Invalid patient data: " +
                error.details.map((err: Error) => err.message).join(", "),
        );
    }

    // Return the validated data with default values
    return validatedPatient;
}

module.exports = { generatePatientJson };

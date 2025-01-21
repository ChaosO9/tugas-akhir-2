export const formatDateToISO = (dateString: string) => {
    const date = new Date(dateString); // Membuat objek Date dari string
    return date.toISOString(); // Mengonversi ke format ISO 8601
};

export function splitBloodPressure(bloodPressure: string | null): {
    systolic: number | null;
    diastolic: number | null;
} {
    if (
        bloodPressure === null ||
        bloodPressure === undefined ||
        bloodPressure.trim() === ""
    ) {
        return { systolic: null, diastolic: null };
    }

    const parts = bloodPressure.split("/");
    if (parts.length === 2) {
        const systolic = parseFloat(parts[0].trim());
        const diastolic = parseFloat(parts[1].trim());

        return {
            systolic: isNaN(systolic) ? null : systolic,
            diastolic: isNaN(diastolic) ? null : diastolic,
        };
    } else {
        return { systolic: null, diastolic: null };
    }
}

export function classifyBloodPressure(
    value: number | null,
    type: "systolic" | "diastolic",
): { code: string | null; display: string | null } {
    if (value === null) {
        return { code: null, display: null };
    }

    if (type === "systolic") {
        if (value < 90) {
            return { code: "LL", display: "Critical Low" };
        } else if (value < 120) {
            return { code: "N", display: "Normal" };
        } else if (value <= 129) {
            return { code: "N", display: "Normal" };
        } else if (value <= 139) {
            return { code: "H", display: "High" };
        } else if (value <= 159) {
            return { code: "HU", display: "Significantly High" };
        } else if (value <= 179) {
            return { code: "HH", display: "Critical High" };
        } else {
            return { code: "HH", display: "Critical High" };
        }
    } else {
        // diastolic
        if (value < 60) {
            return { code: "LL", display: "Critical Low" };
        } else if (value < 80) {
            return { code: "N", display: "Normal" };
        } else if (value <= 84) {
            // Normal (80-84)
            return { code: "N", display: "Normal" };
        } else if (value <= 89) {
            return { code: "H", display: "High" };
        } else if (value <= 99) {
            return { code: "HU", display: "Significantly High" };
        } else if (value <= 109) {
            return { code: "HH", display: "Critical High" };
        } else {
            return { code: "HH", display: "Critical High" };
        }
    }
}

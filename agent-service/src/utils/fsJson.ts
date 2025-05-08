import * as fsPromises from "fs/promises";
import path from "path";
import { KunjunganRawatInap } from "./interface";
import { format } from "date-fns";
import AppError from "./errorHandler";

const OUTPUT_BASE_DIR =
    process.env.OUTPUT_DIR || path.join(__dirname, "..", "..", "app/job_files");

export async function writeJSONBundlePasien(
    jsonData: any,
    dataMasterPasien: KunjunganRawatInap,
    filename?: string,
): Promise<void> {
    try {
        await fsPromises.mkdir(OUTPUT_BASE_DIR, { recursive: true });

        const finalFilename =
            filename ||
            `${dataMasterPasien.patient_id}_${dataMasterPasien.encounter_id}_${format(new Date(), "yyyyMMdd")}_NEW.json`;
        const filePath = path.join(OUTPUT_BASE_DIR, finalFilename);

        const jsonString = JSON.stringify(jsonData, null, 2); // Pretty print

        await fsPromises.writeFile(filePath, jsonString, "utf8");
    } catch (error) {
        console.error(`Error writing JSON file ${filename}:`, error);
        throw new AppError(
            `Failed to write bundle file ${filename}: ${error instanceof Error ? error.message : String(error)}`,
            500,
        );
    }
}

// Keep the writeJSON function as is, or update it similarly if needed
export async function writeJSON(
    jsonData: any | any[],
    fileName: string,
): Promise<void> {
    // This function already writes to a specific sub-directory ('json/patient')
    // You might want to make this configurable too, potentially relative to OUTPUT_BASE_DIR
    const specificOutputDir = path.join(OUTPUT_BASE_DIR, "json", "patient");
    const filePath = path.join(specificOutputDir, `${fileName}.json`);

    try {
        await fsPromises.mkdir(specificOutputDir, { recursive: true }); // Ensure dir exists
        await fsPromises.writeFile(
            filePath,
            JSON.stringify(jsonData, null, 2),
            "utf8",
        );
        console.log(`JSON file ${fileName} has been saved at ${filePath}!`);
    } catch (error) {
        console.error("Error writing JSON file:", error);
        throw error;
    }
}

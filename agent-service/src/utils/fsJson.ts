import { KunjunganRawatInap } from "./interface";
import path from "path";

const fs = require("fs");

export function writeJSONBundlePasien(
    jsonContent: Object,
    dataMasterPasien: KunjunganRawatInap,
) {
    fs.writeFile(
        `${dataMasterPasien.patient_id}_${dataMasterPasien.encounter_id}.json`,
        jsonContent,
        (err: Error) => {
            if (err) {
                console.error(
                    `Error menulis file ${dataMasterPasien.patient_id}_${dataMasterPasien.encounter_id}.json:`,
                    err,
                );
            } else {
                console.log(
                    `File ${dataMasterPasien.patient_id}._${dataMasterPasien.encounter_id} berhasil dibuat.`,
                );
            }
        },
    );
}

export async function writeJSON(
    jsonData: any | any[],
    fileName: string,
): Promise<void> {
    const filePath = path.join(
        __dirname,
        "../../json/patient",
        `${fileName}.json`,
    );

    try {
        await fs.promises.writeFile(
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

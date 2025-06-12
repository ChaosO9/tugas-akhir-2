import { dateTimeToUTC } from "../utils/dateTimeToUTC";
import AppError from "../utils/errorHandler";
import { DietDbRow, KunjunganRawatInap } from "../utils/interface";
import { v4 as uuidv4 } from "uuid";

export default async function pengirimanDataDietService(
    dataMasterPasien: KunjunganRawatInap,
    dataDiet: DietDbRow[],
): Promise<object[] | AppError> {
    let jsonNutritionOrder = [] as object[];

    if (Array.isArray(dataDiet) && dataDiet.length > 0) {
        dataDiet.forEach((dietItem) => {
            const nutritionOrderItem: object = {
                fullUrl: `urn:uuid:${uuidv4()}`,
                resource: {
                    resourceType: "NutritionOrder",
                    status: dietItem.data.status || "active",
                    intent: dietItem.data.intent || "proposal",
                    patient: {
                        reference: `Patient/${dataMasterPasien.patient_id}`,
                    },
                    encounter: {
                        reference: `Encounter/${dataMasterPasien.encounter_id}`,
                    },
                    dateTime: `${dateTimeToUTC(dietItem.data.dateTime)}`,
                    orderer: {
                        reference: `${dietItem.data.orderer?.reference}`,
                        ...(dietItem.data.orderer?.display && {
                            display: dietItem.data.orderer.display,
                        }),
                    },
                    ...(dietItem.data.excludeFoodModifier &&
                        dietItem.data.excludeFoodModifier.length > 0 && {
                            excludeFoodModifier:
                                dietItem.data.excludeFoodModifier.map(
                                    (efm) => ({
                                        coding: efm.coding?.map((c) => ({
                                            system: c.system,
                                            code: c.code,
                                            display: c.display,
                                        })),
                                    }),
                                ),
                        }),
                    ...(dietItem.data.oralDiet && {
                        // Check if oralDiet itself exists
                        oralDiet: {
                            ...(dietItem.data.oralDiet.type &&
                                dietItem.data.oralDiet.type.length > 0 && {
                                    type: dietItem.data.oralDiet.type.map(
                                        (odt) => ({
                                            coding: odt.coding?.map((c) => ({
                                                system: c.system,
                                                code: c.code,
                                                display: c.display,
                                            })),
                                            ...(odt.text && { text: odt.text }),
                                        }),
                                    ),
                                }),
                            ...(dietItem.data.oralDiet.nutrient &&
                                dietItem.data.oralDiet.nutrient.length > 0 && {
                                    nutrient:
                                        dietItem.data.oralDiet.nutrient.map(
                                            (n) => ({
                                                ...(n.modifier && {
                                                    modifier: {
                                                        coding: n.modifier.coding?.map(
                                                            (c) => ({
                                                                system: c.system,
                                                                code: c.code,
                                                                display:
                                                                    c.display,
                                                            }),
                                                        ),
                                                        ...(n.modifier.text && {
                                                            text: n.modifier
                                                                .text,
                                                        }),
                                                    },
                                                }),
                                                ...(n.amount && {
                                                    amount: {
                                                        value: n.amount.value,
                                                        unit: n.amount.unit,
                                                        system: n.amount.system,
                                                        code: n.amount.code,
                                                    },
                                                }),
                                            }),
                                        ),
                                }),
                        },
                    }),
                },
                request: {
                    method: "POST",
                    url: "NutritionOrder",
                },
            };
            jsonNutritionOrder.push(nutritionOrderItem);
        });
    }
    return jsonNutritionOrder;
}

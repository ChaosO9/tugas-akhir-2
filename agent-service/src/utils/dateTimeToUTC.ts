export const dateTimeToUTC = (input: string | Date) => {
    const date = new Date(input);
    const isoUtc = date.toISOString();
    return isoUtc;
};

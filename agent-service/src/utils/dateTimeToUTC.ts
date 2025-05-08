export const dateTimeToUTC = (input: string) => {
    const date = new Date(input);
    const isoUtc = date.toISOString();
    return isoUtc;
};

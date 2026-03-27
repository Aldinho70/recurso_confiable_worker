export function formatToISODateTimeUTC(timestamp) {
    if (!timestamp) return "NA";

    try {
        const date = new Date(timestamp * 1000);
        if (isNaN(date.getTime())) return "NA";

        return date.toISOString().slice(0, 19);
        // Resultado: YYYY-MM-DDTHH:mm:ss
    } catch (error) {
        return "NA";
    }
}
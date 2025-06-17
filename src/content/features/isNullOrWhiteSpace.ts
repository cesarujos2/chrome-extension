export const isNullOrWhiteSpace = (value: string | null | undefined): boolean => {
    if (value === null || value === undefined) {
        return true;
    }
    return value.trim().length === 0;
}
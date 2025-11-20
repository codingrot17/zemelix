export function isValidUrl(s?: string) {
    if (!s) return false;
    try {
        new URL(s);
        return true;
    } catch {
        return false;
    }
}

export function formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString();
}
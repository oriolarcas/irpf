export function formatCurrency(value: number | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    return new Intl.NumberFormat('ca-ES', { style: 'currency', currency: 'EUR' }).format(value);
}
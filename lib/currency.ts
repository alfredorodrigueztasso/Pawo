/**
 * Format an amount as currency using locale-aware formatting.
 * Automatically respects decimal places for each currency:
 * - CLP: 0 decimals (ISO 4217)
 * - ARS, MXN: 2 decimals
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
  }).format(amount);
}

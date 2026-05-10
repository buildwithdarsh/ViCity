/**
 * Format an amount stored in paisa (smallest currency unit) to a display string.
 * e.g. 1203600 → "₹12,036"
 *
 * Accepts optional currency code and locale. For server-side code that has access
 * to SiteConfig, pass config.currency. Client-side callers default to INR/en-IN.
 */
export function formatCurrency(
  paisa: number,
  currency: string = "INR",
  locale: string = "en-IN"
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

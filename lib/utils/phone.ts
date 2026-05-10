/**
 * Sanitize a phone number to exactly 10 digits.
 * Strips spaces, dashes, dots, parentheses, and common prefixes:
 *   +91, 91, 0  (Indian formats)
 *
 * Examples:
 *   "+91 98765 43210"  → "9876543210"
 *   "919876543210"     → "9876543210"
 *   "09876543210"      → "9876543210"
 *   "98765-43210"      → "9876543210"
 *   "9876543210"       → "9876543210"
 */
export function sanitizePhone(raw: string): string {
  // Strip all non-digit characters
  let digits = raw.replace(/\D/g, "");

  // Remove leading country code: +91 or 91 (only if result would be 10 digits)
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }

  // Remove leading 0 (trunk prefix)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

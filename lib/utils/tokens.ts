import { randomBytes } from "crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateBookingReference(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const random = randomBytes(4).toString("hex").toUpperCase();
  return `HTL-${dateStr}-${random}`;
}

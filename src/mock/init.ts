/**
 * Seeding guard + auto-login for demo user.
 *
 * On first load, seeds all stores in dependency order.
 * Always ensures the demo user (usr-001) is logged in.
 */

import type { JsonValue } from "@buildwithdarsh/sdk";
import { seed, clear, count, STORES, type StoreName } from "./db";

import usersSeed from "./seeds/users.seed";
import roomTypesSeed from "./seeds/roomTypes.seed";
import roomUnitsSeed from "./seeds/roomUnits.seed";
import amenitiesSeed from "./seeds/amenities.seed";
import bookingsSeed from "./seeds/bookings.seed";
import paymentsSeed from "./seeds/payments.seed";
import reviewsSeed from "./seeds/reviews.seed";
import couponsSeed from "./seeds/coupons.seed";
import notificationsSeed from "./seeds/notifications.seed";
import pricingRulesSeed from "./seeds/pricingRules.seed";
import auditLogsSeed from "./seeds/auditLogs.seed";
import contactsSeed from "./seeds/contacts.seed";
import settingsSeed from "./seeds/settings.seed";

const FLAG = "mockDB_seeded";

/** The demo user that is always logged in */
const DEMO_USER_ID = "usr-001";

// Dependency order: parents before children
const SEED_ORDER: { store: StoreName; data: JsonValue[] }[] = [
  { store: "users", data: usersSeed },
  { store: "roomTypes", data: roomTypesSeed },
  { store: "roomUnits", data: roomUnitsSeed },
  { store: "amenities", data: amenitiesSeed },
  { store: "bookings", data: bookingsSeed },
  { store: "payments", data: paymentsSeed },
  { store: "reviews", data: reviewsSeed },
  { store: "coupons", data: couponsSeed },
  { store: "notifications", data: notificationsSeed },
  { store: "pricingRules", data: pricingRulesSeed },
  { store: "auditLogs", data: auditLogsSeed },
  { store: "contacts", data: contactsSeed },
  { store: "settings", data: settingsSeed },
];

/**
 * Ensure the demo user is always authenticated.
 */
export function ensureDemoLogin(): void {
  const token = localStorage.getItem("tss-access-token");
  // If no token, or token isn't for the demo user → force login
  if (!token || !token.includes(DEMO_USER_ID)) {
    localStorage.setItem("tss-access-token", `mock-access-${DEMO_USER_ID}-${Date.now()}`);
    localStorage.setItem("tss-refresh-token", `mock-refresh-${DEMO_USER_ID}-${Date.now()}`);
  }
}

/**
 * Seeds all stores if the DB is empty (first visit).
 * Always ensures demo user is logged in.
 */
export async function initMockDB(): Promise<void> {
  if (typeof window === "undefined") return;

  // Seed if needed
  if (localStorage.getItem(FLAG) !== "true") {
    const userCount = await count("users");
    if (userCount === 0) {
      console.info("[MockDB] Seeding database...");
      for (const { store, data } of SEED_ORDER) {
        await seed(store, data as { id?: string }[]);
      }
      console.info("[MockDB] Seeding complete.");
    }
    localStorage.setItem(FLAG, "true");
  }

  // Always keep demo user logged in
  ensureDemoLogin();
}

/**
 * Clears all stores, removes the seeded flag, and re-seeds.
 */
export async function resetMockDB(): Promise<void> {
  console.info("[MockDB] Resetting database...");
  for (const store of STORES) {
    await clear(store);
  }
  localStorage.removeItem(FLAG);
  await initMockDB();
}

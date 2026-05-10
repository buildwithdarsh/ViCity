/**
 * Mock API router.
 *
 * Maps every (method, path) combination to an IndexedDB-backed handler.
 * Imported by lib/api.ts when mock mode is active.
 */

import type { JsonObject } from "@buildwithdarsh/sdk";
import {
  getAll,
  getById,
  query,
  create,
  update,
  remove,
} from "./db";
import {
  mockLogin,
  mockRegister,
  mockSendOtp,
  mockVerifyOtp,
  mockGetProfile,
  mockUpdateProfile,
  mockChangePassword,
  mockForgotPassword,
  mockResetPassword,
  mockLogout,
  mockCreateGuestToken,
  mockRefreshToken,
  extractUserIdFromToken,
} from "./auth";

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Realistic jitter delay */
async function delay(): Promise<void> {
  const ms = 80 + Math.random() * 120;
  return new Promise((r) => setTimeout(r, ms));
}

/** Error rate from env (default 0) */
const ERROR_RATE =
  typeof process !== "undefined"
    ? Number(process.env['NEXT_PUBLIC_MOCK_ERROR_RATE'] ?? 0)
    : 0;

function maybeError() {
  if (ERROR_RATE > 0 && Math.random() * 100 < ERROR_RATE) {
    const err = new Error("Mock random error") as Error & { status: number };
    err.status = 500;
    throw err;
  }
}

/** Extract current userId from localStorage mock token */
function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("tss-access-token");
  if (!token) return null;
  return extractUserIdFromToken(token);
}

// ── Pagination helper ───────────────────────────────────────────────────────

interface PaginatedResult<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

function paginate<T>(items: T[], page = 1, limit = 20): PaginatedResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    meta: { page, limit, total, totalPages },
  };
}

function parsePageParams(qs: URLSearchParams) {
  return {
    page: Math.max(1, Number(qs.get("page") ?? 1)),
    limit: Math.max(1, Math.min(100, Number(qs.get("limit") ?? 20))),
  };
}

// ── Route matcher ───────────────────────────────────────────────────────────

// Params always have the named keys populated by the route matcher
type Params = Record<string, string> & { id: string };

type Handler = (ctx: {
  method: string;
  path: string;
  body: JsonObject | null;
  params: Params;
  qs: URLSearchParams;
}) => Promise<unknown>;

interface Route {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
}

const routes: Route[] = [];

function route(method: string, pattern: string, handler: Handler) {
  const paramNames: string[] = [];
  const regexStr = pattern.replace(/:([^/]+)/g, (_m, name) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  routes.push({ method, pattern: new RegExp(`^${regexStr}$`), paramNames, handler });
}

// ── Helper: wrap { data } for admin hooks (useApi expects res.data) ─────────
function wrapData<T>(d: T) { return { data: d }; }

// ── Helper: SiteConfig (mirrors lib/config.ts DEFAULT_CONFIG) ───────────────
function getSiteConfigData() {
  return {
    config: {
      auth: { primary_login_id: "phone", require_phone_verification: true, require_email_verification: false, allow_guest_checkout: false, otp_length: 4, otp_expiry_minutes: 5, allow_social_login: false, google_login_enabled: false, facebook_login_enabled: false, password_min_length: 8, force_phone_for_orders: true },
      branding: { name: "ViCity", tagline: "Your City Escape", logo_url: "", favicon_url: "", og_image_url: "", primary_color: "#C9A96E", secondary_color: "#1A1A1A", accent_color: "#D4AF37", font_family: "Inter", currency: "INR", currency_symbol: "\u20B9", timezone: "Asia/Kolkata", country_code: "IN", date_format: "DD/MM/YYYY", dark_mode_enabled: false, powered_by_visible: true },
      catalog: { variant_types: ["default"], default_variant_type: "standard", show_calories: false, show_nutrition: false, show_allergens: false, show_diet_badges: false, diet_filter_default: "all", show_ratings: true, show_out_of_stock: true, items_per_page: 12, search_enabled: true },
      checkout: { cod_enabled: false, online_pay_enabled: true, min_order_amount: 0, packing_charges: 0, tip_enabled: false, tip_presets: [], instructions_enabled: true, scheduled_orders: false, promo_code_field: true, gift_wrap_enabled: false, gift_wrap_price: 0 },
      contact: { phone: "hello@build.withdarsh.com", email: "hello@build.withdarsh.com", address: "Abc, XYZ", instagram: "https://instagram.com/vicity", facebook: "", twitter: "", google_maps: "" },
      delivery: { enabled: false, fee: 0, free_above: 0, prep_time_minutes: 0, pickup_enabled: false, dine_in_enabled: false, live_tracking_enabled: false, max_distance_km: 0, contactless_default: false, slot_based_delivery: false },
      features: { coupons_enabled: true, promotions_enabled: false, referral_enabled: false, reviews_enabled: true, gift_cards_enabled: false, reservations_enabled: false, whatsapp_enabled: true, whatsapp_phone: "", blog_enabled: false, help_center_enabled: false, feedback_enabled: false, self_checkin_enabled: false, subscription_enabled: false, table_qr_enabled: false, student_pass_enabled: false, meal_plans_enabled: false },
      loyalty: { enabled: false, point_name: "points", point_name_plural: "points", point_value: 1, points_per_amount: 0, points_per_amount_threshold: 0, healthy_boost_multiplier: 1, redemption_min_points: 0, redemption_max_percent: 0, first_order_bonus: 0, welcome_bonus: 0, birthday_bonus: 0, review_bonus: 0, expiry_days: 365, tier_names: [], show_tier_progress: false },
      notifications: { booking_confirm_sms: true, booking_confirm_email: true, checkin_reminder: true, checkin_reminder_hours: 24 },
      orders: { prefix: "TSS", auto_confirm: false, auto_accept_minutes: 0, reorder_enabled: false, order_tracking_enabled: false, receipt_enabled: true, rating_enabled: true, rating_mandatory: false, token_display_enabled: false, order_types: ["booking"], cancel_allowed_minutes: 0, cancel_refund_enabled: true, cancel_refund_percent: 50, max_order_amount: 500000, max_items_per_order: 10 },
      tax: { rate: 18, label: "GST", inclusive: false, service_charge_enabled: false, service_charge_percent: 0 },
      payments: { cod_max_amount: 0, cod_min_amount: 0, online_discount: 0, partial_payment: true, partial_min_percent: 50, wallet_enabled: false, wallet_topup_enabled: false, upi_enabled: true, card_enabled: true, netbanking_enabled: true, emi_enabled: false, refund_auto: false, refund_enabled: true, refund_percentage: 100, refund_window_hours: 48, partial_refund_enabled: true, refund_to_wallet: false },
      seo: { meta_title: "", meta_description: "", canonical_url: "", og_type: "website", twitter_handle: "" },
      analytics: { google_analytics_id: "", facebook_pixel_id: "", gtm_id: "" },
      app: { pwa_enabled: false, app_store_url: "", play_store_url: "" },
      system: { maintenance_mode: false, maintenance_message: "", coming_soon: false },
      property: { check_in_time: "14:00", check_out_time: "11:00", tax_rate: 18, tax_label: "GST", booking_hold_minutes: 10, advance_payment_percent: 50, max_guests_included: 6, extra_guest_charge: 150000, min_nights: 1, max_nights: 21, max_guests_per_unit: 8, cancellation_hours: 48, cancellation_fee_percent: 25, advance_booking_days: 90, min_stay_nights: 1 },
      otp: {}, pos: {}, integrations: {}, email: {},
    },
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT AUTH ROUTES
// ──────────────────────────────────────────────────────────────────────────────

route("POST", "/storefront/auth/register", async ({ body }) => {
  const b = body as { name: string; phone: string; password: string; email?: string };
  return mockRegister(b);
});

route("POST", "/storefront/auth/login", async ({ body }) => {
  const b = body as { phone: string; password: string };
  return mockLogin(b.phone, b.password);
});

route("POST", "/storefront/auth/logout", async () => {
  return mockLogout();
});

route("GET", "/storefront/auth/me", async () => {
  const uid = currentUserId();
  if (!uid) { const e = new Error("Unauthorized") as Error & { status: number }; e.status = 401; throw e; }
  return mockGetProfile(uid);
});

route("POST", "/storefront/auth/refresh", async () => {
  const uid = currentUserId();
  if (!uid) return null;
  return mockRefreshToken(uid);
});

route("POST", "/storefront/auth/guest", async () => {
  return mockCreateGuestToken();
});

route("POST", "/storefront/auth/send-otp", async ({ body }) => {
  const b = body as { identifier: string; type: string };
  return mockSendOtp(b);
});

route("POST", "/storefront/auth/verify-otp", async ({ body }) => {
  const b = body as { identifier: string; type: string; otp: string };
  return mockVerifyOtp(b);
});

route("PATCH", "/storefront/auth/profile", async ({ body }) => {
  const uid = currentUserId();
  if (!uid) { const e = new Error("Unauthorized") as Error & { status: number }; e.status = 401; throw e; }
  return mockUpdateProfile(uid, body as Partial<{ name: string; email: string }>);
});

route("POST", "/storefront/auth/change-password", async ({ body }) => {
  const uid = currentUserId();
  if (!uid) { const e = new Error("Unauthorized") as Error & { status: number }; e.status = 401; throw e; }
  return mockChangePassword(uid, body as { currentPassword: string; newPassword: string });
});

route("POST", "/storefront/auth/forgot-password", async ({ body }) => {
  return mockForgotPassword(body as { identifier: string });
});

route("POST", "/storefront/auth/reset-password", async ({ body }) => {
  return mockResetPassword(body as { token: string; newPassword: string });
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT PROPERTY ROUTES
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/storefront/property/types", async () => {
  return getAll("roomTypes");
});

route("GET", "/storefront/property/types/:id", async ({ params }) => {
  const rt = await getById("roomTypes", params.id);
  if (!rt) { const e = new Error("Room type not found") as Error & { status: number }; e.status = 404; throw e; }
  return rt;
});

route("GET", "/storefront/property/availability", async ({ qs }) => {
  const startDate = qs.get("startDate") ?? "";
  const endDate = qs.get("endDate") ?? "";
  const propertyTypeId = qs.get("propertyTypeId");

  // Generate calendar days between start and end
  const days: { date: string; available: boolean; price: number; minStay: number }[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const cursor = new Date(start);

  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    const dayOfWeek = cursor.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const basePrice = 2500000;
    const price = isWeekend ? Math.round(basePrice * 1.25) : basePrice;
    // Make ~90% of days available
    const available = Math.sin(cursor.getTime() / 86400000) > -0.8;
    days.push({ date: dateStr, available, price, minStay: 1 });
    cursor.setDate(cursor.getDate() + 1);
  }

  if (propertyTypeId) {
    const totalPrice = days.filter((d) => d.available).reduce((sum, d) => sum + d.price, 0);
    return { available: days.some((d) => d.available), roomTypeId: propertyTypeId, dates: days, totalPrice };
  }

  return days;
});

route("POST", "/storefront/property/pricing/resolve", async ({ body }) => {
  const b = body as { propertyTypeId: string; checkInDate: string; checkOutDate: string; guestCount?: number; couponCode?: string };
  const rt = await getById<{ basePrice: number; maxGuests: number }>("roomTypes", b.propertyTypeId);
  const basePrice = rt?.basePrice ?? 2500000;
  const start = new Date(b.checkInDate);
  const end = new Date(b.checkOutDate);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const baseAmount = basePrice * nights;
  const taxRate = 0.18;
  const taxAmount = Math.round(baseAmount * taxRate);
  const guestCount = b.guestCount ?? 1;
  const maxIncluded = 6;
  const extraGuests = Math.max(0, guestCount - maxIncluded);
  const extraGuestCharge = extraGuests * 150000 * nights;

  let discountAmount = 0;
  if (b.couponCode) {
    const coupons = await query<{ code: string; discountType: string; discountValue: number; maxDiscountAmount: number; isActive: boolean }>("coupons", "by_code", b.couponCode);
    const coupon = coupons[0];
    if (coupon?.isActive) {
      if (coupon.discountType === "percentage") {
        discountAmount = Math.min(Math.round(baseAmount * coupon.discountValue / 100), coupon.maxDiscountAmount);
      } else {
        discountAmount = Math.min(coupon.discountValue, coupon.maxDiscountAmount);
      }
    }
  }

  const totalAmount = baseAmount + taxAmount + extraGuestCharge - discountAmount;
  return { baseAmount, taxAmount, discountAmount, extraGuestCharge, totalAmount, roomPrice: baseAmount, extraGuests, extraGuestPerNight: 150000 };
});

route("POST", "/storefront/property/availability/hold", async () => {
  return { holdId: "", expiresAt: new Date(Date.now() + 10 * 60_000).toISOString() };
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT BOOKING ROUTES
// ──────────────────────────────────────────────────────────────────────────────

route("POST", "/storefront/property/bookings", async ({ body }) => {
  const uid = currentUserId();
  const b = body as JsonObject;
  const start = new Date(b['checkInDate'] as string);
  const end = new Date(b['checkOutDate'] as string);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const rt = await getById<{ basePrice: number }>("roomTypes", b['propertyTypeId'] as string);
  const baseAmount = (rt?.basePrice ?? 2500000) * nights;
  const taxAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + taxAmount;

  const ref = `TSS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const booking = await create("bookings", {
    id: crypto.randomUUID(),
    bookingReference: ref,
    propertyTypeId: b['propertyTypeId'] as string,
    userId: uid ?? "guest-001",
    checkInDate: b['checkInDate'] as string,
    checkOutDate: b['checkOutDate'] as string,
    nights,
    guestCount: (b['guestCount'] as number) ?? 1,
    guestName: (b['guestName'] as string) ?? "Guest",
    guestPhone: (b['guestPhone'] as string) ?? "",
    guestEmail: (b['guestEmail'] as string) ?? null,
    baseAmount,
    taxAmount,
    discountAmount: 0,
    extraGuestCharge: 0,
    totalAmount,
    status: "confirmed",
    paymentStatus: "pending",
    specialRequests: (b['specialRequests'] as string) ?? null,
    createdAt: new Date().toISOString(),
  });
  return booking;
});

route("GET", "/storefront/property/bookings", async ({ qs }) => {
  const uid = currentUserId();
  if (!uid) return [];
  const { page, limit } = parsePageParams(qs);
  const bookings = await query<JsonObject>("bookings", "by_userId", uid);
  bookings.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  // The storefront service returns just array, not paginated
  return paginate(bookings, page, limit).data;
});

route("GET", "/storefront/property/bookings/lookup", async ({ qs }) => {
  const ref = qs.get("reference") ?? "";
  const results = await query("bookings", "by_reference", ref);
  if (results.length === 0) { const e = new Error("Booking not found") as Error & { status: number }; e.status = 404; throw e; }
  return results[0];
});

route("GET", "/storefront/property/bookings/:id", async ({ params }) => {
  const booking = await getById("bookings", params.id);
  if (!booking) { const e = new Error("Booking not found") as Error & { status: number }; e.status = 404; throw e; }
  return booking;
});

route("POST", "/storefront/property/bookings/:id/cancel", async ({ params, body }) => {
  const b = body as { reason?: string } | undefined;
  await update("bookings", params.id, { status: "cancelled", cancelReason: b?.reason ?? null, updatedAt: new Date().toISOString() });
  return { message: "Booking cancelled successfully" };
});

route("POST", "/storefront/property/bookings/:id/payment-order", async ({ params }) => {
  const booking = await getById<{ totalAmount: number }>("bookings", params.id);
  return {
    orderId: `order_mock_${Date.now()}`,
    amount: booking?.totalAmount ?? 0,
    currency: "INR",
    keyId: "rzp_mock_key",
    razorpayKeyId: "rzp_mock_key",
  };
});

route("POST", "/storefront/property/bookings/verify-payment", async ({ body }) => {
  const b = body as { bookingId: string; providerOrderId: string; providerPaymentId: string; providerSignature: string };
  await update("bookings", b.bookingId, { paymentStatus: "paid", updatedAt: new Date().toISOString() });
  // Create payment record
  await create("payments", {
    id: crypto.randomUUID(),
    bookingId: b.bookingId,
    amount: 0,
    currency: "INR",
    status: "paid",
    provider: "razorpay",
    providerOrderId: b.providerOrderId,
    providerPaymentId: b.providerPaymentId,
    method: "mock",
    refundedAmount: 0,
    webhookEvents: [],
    createdAt: new Date().toISOString(),
  });
  return { success: true };
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT REVIEWS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/storefront/reviews", async ({ qs }) => {
  let reviews = await getAll<JsonObject>("reviews");
  const status = qs.get("status");
  const catalogItemId = qs.get("catalogItemId");
  if (status) reviews = reviews.filter((r) => r['status'] === status);
  if (catalogItemId) reviews = reviews.filter((r) => r['catalogItemId'] === catalogItemId);
  reviews.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return reviews;
});

route("GET", "/storefront/reviews/my", async () => {
  const uid = currentUserId();
  if (!uid) return [];
  return query("reviews", "by_userId", uid);
});

route("POST", "/storefront/reviews", async ({ body }) => {
  const uid = currentUserId();
  const b = body as JsonObject;
  const user = uid ? await getById<{ name: string }>("users", uid) : null;
  return create("reviews", {
    id: crypto.randomUUID(),
    userId: uid ?? "anonymous",
    catalogItemId: (b['catalogItemId'] as string) ?? null,
    commerceOrderId: (b['commerceOrderId'] as string) ?? null,
    rating: b['rating'] as number,
    title: (b['title'] as string) ?? null,
    body: (b['body'] as string) ?? "",
    status: "pending",
    userName: user?.name ?? "Guest",
    roomTypeName: "",
    createdAt: new Date().toISOString(),
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT COUPONS
// ──────────────────────────────────────────────────────────────────────────────

route("POST", "/storefront/coupons/validate", async ({ body }) => {
  const b = body as { code: string; orderAmount: number; roomTypeId?: string };
  const coupons = await query<{ code: string; discountType: string; discountValue: number; maxDiscountAmount: number; minBookingValue: number; isActive: boolean; expiryDate: string | null; usageLimit: number | null; usedCount: number }>("coupons", "by_code", b.code);
  const c = coupons[0];
  if (!c || !c.isActive) return { valid: false, code: b.code, discountType: "percentage", discountValue: 0, discountAmount: 0, message: "Invalid or expired coupon" };
  if (c.expiryDate && new Date(c.expiryDate) < new Date()) return { valid: false, code: b.code, discountType: c.discountType, discountValue: 0, discountAmount: 0, message: "Coupon has expired" };
  if (c.usageLimit !== null && c.usedCount >= c.usageLimit) return { valid: false, code: b.code, discountType: c.discountType, discountValue: 0, discountAmount: 0, message: "Coupon usage limit reached" };
  if (b.orderAmount < c.minBookingValue) return { valid: false, code: b.code, discountType: c.discountType, discountValue: c.discountValue, discountAmount: 0, message: `Minimum booking value of \u20B9${(c.minBookingValue / 100).toLocaleString()} required` };

  let discountAmount = 0;
  if (c.discountType === "percentage") {
    discountAmount = Math.min(Math.round(b.orderAmount * c.discountValue / 100), c.maxDiscountAmount);
  } else {
    discountAmount = Math.min(c.discountValue, c.maxDiscountAmount);
  }
  return { valid: true, code: b.code, discountType: c.discountType, discountValue: c.discountValue, discountAmount, message: "Coupon applied!" };
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/storefront/notifications", async ({ qs }) => {
  const uid = currentUserId();
  if (!uid) return { data: [], total: 0, unreadCount: 0 };
  const { page, limit } = parsePageParams(qs);
  let notifs = await query<JsonObject>("notifications", "by_userId", uid);
  notifs.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  const unreadCount = notifs.filter((n) => !n['isRead']).length;
  const paged = paginate(notifs, page, limit);
  return { data: paged.data, total: paged.meta.total, unreadCount };
});

route("POST", "/storefront/notifications/:id/read", async ({ params }) => {
  await update("notifications", params.id, { isRead: true });
  return undefined;
});

route("POST", "/storefront/notifications/read-all", async () => {
  const uid = currentUserId();
  if (!uid) return undefined;
  const notifs = await query<{ id: string }>("notifications", "by_userId", uid);
  for (const n of notifs) {
    await update("notifications", n.id, { isRead: true });
  }
  return undefined;
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT CONFIG
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/storefront/config", async () => {
  return getSiteConfigData();
});

// ──────────────────────────────────────────────────────────────────────────────
// STOREFRONT CONTACT
// ──────────────────────────────────────────────────────────────────────────────

route("POST", "/storefront/contact", async ({ body }) => {
  const b = body as JsonObject;
  console.info("[MOCK EMAIL] Contact form submission:", b);
  await create("contacts", {
    id: crypto.randomUUID(),
    name: (b['name'] as string) ?? "",
    email: (b['email'] as string) ?? "",
    phone: (b['phone'] as string) ?? null,
    subject: (b['subject'] as string) ?? null,
    message: (b['message'] as string) ?? "",
    createdAt: new Date().toISOString(),
  });
  return { message: "Thank you for contacting us. We will get back to you shortly." };
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN AUTH (uses same auth but different path)
// ──────────────────────────────────────────────────────────────────────────────

route("POST", "/auth/login", async ({ body }) => {
  const b = body as { phone: string; password: string };
  const result = await mockLogin(b.phone, b.password);
  // Admin login wraps in { data: ... }
  return wrapData({ accessToken: result.accessToken, user: { ...result.user, role: result.user.role } });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN DASHBOARD STATS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/admin/stats", async () => {
  const bookings = await getAll<JsonObject>("bookings");
  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => (b['createdAt'] as string).startsWith(today));
  const monthBookings = bookings.filter((b) => (b['createdAt'] as string).startsWith(today.substring(0, 7)));
  const revenueToday = todayBookings.reduce((s, b) => s + ((b['totalAmount'] as number) ?? 0), 0);
  const revenueMonth = monthBookings.reduce((s, b) => s + ((b['totalAmount'] as number) ?? 0), 0);
  const units = await getAll<JsonObject>("roomUnits");
  const occupied = units.filter((u) => u['status'] === "occupied").length;
  const totalUnits = units.length;
  const checkedIn = bookings.filter((b) => b['status'] === "checked_in");
  const recent = bookings.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string)).slice(0, 10);

  return wrapData({
    totalBookingsToday: todayBookings.length,
    totalBookingsMonth: monthBookings.length,
    revenueToday,
    revenueMonth,
    occupancyRate: totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0,
    averageBookingValue: bookings.length > 0 ? Math.round(bookings.reduce((s, b) => s + ((b['totalAmount'] as number) ?? 0), 0) / bookings.length) : 0,
    pendingCheckIns: bookings.filter((b) => b['status'] === "confirmed" && b['checkInDate'] === today).length,
    pendingCheckOuts: checkedIn.filter((b) => b['checkOutDate'] === today).length,
    recentBookings: recent,
  });
});

route("GET", "/admin/stats/bookings-chart", async () => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return wrapData(labels.map((l, i) => ({ label: l, value: 3 + Math.round(Math.sin(i) * 2 + 2) })));
});

route("GET", "/admin/stats/revenue-chart", async () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return wrapData(months.map((l, i) => ({ label: l, value: Math.round(5000000 + Math.sin(i * 0.5) * 3000000) })));
});

route("GET", "/admin/stats/occupancy-chart", async () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return wrapData(months.map((l, i) => ({ label: l, value: Math.round(40 + Math.sin(i * 0.8) * 30) })));
});

route("GET", "/admin/stats/room-type-breakdown", async () => {
  const types = await getAll<JsonObject>("roomTypes");
  const bookings = await getAll<JsonObject>("bookings");
  const units = await getAll<JsonObject>("roomUnits");
  return wrapData(types.map((t) => ({
    id: t['id'],
    name: t['name'],
    roomCount: units.filter((u) => u['roomTypeId'] === t['id']).length,
    bookingCount: bookings.filter((b) => b['propertyTypeId'] === t['id']).length,
    basePrice: t['basePrice'],
  })));
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN BOOKINGS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/property/bookings", async ({ qs }) => {
  const { page, limit } = parsePageParams(qs);
  let bookings = await getAll<JsonObject>("bookings");
  const status = qs.get("status");
  const search = qs.get("search");
  if (status) bookings = bookings.filter((b) => b['status'] === status);
  if (search) {
    const s = search.toLowerCase();
    bookings = bookings.filter((b) =>
      (b['guestName'] as string)?.toLowerCase().includes(s) ||
      (b['bookingReference'] as string)?.toLowerCase().includes(s) ||
      (b['guestPhone'] as string)?.includes(s)
    );
  }
  bookings.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return paginate(bookings, page, limit);
});

route("GET", "/property/bookings/:id", async ({ params }) => {
  const booking = await getById("bookings", params.id);
  if (!booking) { const e = new Error("Booking not found") as Error & { status: number }; e.status = 404; throw e; }
  // Admin detail: include payment info
  const payments = await query("payments", "by_bookingId", params.id);
  return wrapData({ ...booking as JsonObject, payments });
});

route("PATCH", "/property/bookings/:id", async ({ params, body }) => {
  const updated = await update("bookings", params.id, { ...(body as JsonObject), updatedAt: new Date().toISOString() });
  return wrapData(updated);
});

route("POST", "/property/bookings/:id/cancel", async ({ params, body }) => {
  const b = body as { reason?: string } | undefined;
  await update("bookings", params.id, { status: "cancelled", cancelReason: b?.reason ?? null, updatedAt: new Date().toISOString() });
  return wrapData({ message: "Booking cancelled" });
});

route("POST", "/property/bookings/:id/check-in", async ({ params }) => {
  await update("bookings", params.id, { status: "checked_in", updatedAt: new Date().toISOString() });
  return wrapData({ message: "Checked in" });
});

route("POST", "/property/bookings/:id/check-out", async ({ params }) => {
  await update("bookings", params.id, { status: "checked_out", updatedAt: new Date().toISOString() });
  return wrapData({ message: "Checked out" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN PAYMENTS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/payments", async ({ qs }) => {
  const { page, limit } = parsePageParams(qs);
  let payments = await getAll<JsonObject>("payments");
  const status = qs.get("status");
  const search = qs.get("search");
  if (status) payments = payments.filter((p) => p['status'] === status);
  if (search) {
    const s = search.toLowerCase();
    payments = payments.filter((p) =>
      (p['providerPaymentId'] as string)?.toLowerCase().includes(s) ||
      (p['bookingId'] as string)?.toLowerCase().includes(s)
    );
  }
  payments.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return paginate(payments, page, limit);
});

route("GET", "/payments/:id", async ({ params }) => {
  const p = await getById("payments", params.id);
  if (!p) { const e = new Error("Payment not found") as Error & { status: number }; e.status = 404; throw e; }
  return wrapData(p);
});

route("POST", "/payments/:id/refunds", async ({ params, body }) => {
  const b = body as { amount: number; reason?: string };
  const payment = await getById<JsonObject>("payments", params.id);
  if (!payment) { const e = new Error("Payment not found") as Error & { status: number }; e.status = 404; throw e; }
  const refundedAmount = ((payment['refundedAmount'] as number) ?? 0) + b.amount;
  await update("payments", params.id, { refundedAmount, status: "refunded", updatedAt: new Date().toISOString() });
  console.info("[MOCK REFUND]", { paymentId: params.id, amount: b.amount, reason: b.reason });
  return wrapData({ message: "Refund processed", chargeId: `ch_mock_${Date.now()}`, status: "succeeded" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN USERS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/users", async ({ qs }) => {
  const { page, limit } = parsePageParams(qs);
  let users = await getAll<JsonObject>("users");
  const search = qs.get("search");
  const role = qs.get("role");
  if (role) users = users.filter((u) => u['role'] === role);
  if (search) {
    const s = search.toLowerCase();
    users = users.filter((u) =>
      (u['name'] as string)?.toLowerCase().includes(s) ||
      (u['email'] as string)?.toLowerCase().includes(s) ||
      (u['phone'] as string)?.includes(s)
    );
  }
  // Remove passwords before returning
  const safe = users.map(({ password: _p, ...rest }) => rest);
  return paginate(safe, page, limit);
});

route("GET", "/users/:id", async ({ params }) => {
  const u = await getById<JsonObject>("users", params.id);
  if (!u) { const e = new Error("User not found") as Error & { status: number }; e.status = 404; throw e; }
  const { password: _p, ...safe } = u;
  return wrapData(safe);
});

route("PATCH", "/users/:id/block", async ({ params, body }) => {
  const b = body as { reason?: string } | undefined;
  await update("users", params.id, { blocked: true, blockReason: b?.reason ?? null });
  return wrapData({ message: "User blocked" });
});

route("PATCH", "/users/:id/unblock", async ({ params }) => {
  await update("users", params.id, { blocked: false, blockReason: null });
  return wrapData({ message: "User unblocked" });
});

route("PATCH", "/users/:id/role", async ({ params, body }) => {
  const b = body as { role: string };
  await update("users", params.id, { role: b.role });
  return wrapData({ message: "Role updated" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN ROOM TYPES
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/property/types", async () => {
  const types = await getAll("roomTypes");
  return wrapData(types);
});

route("POST", "/property/types", async ({ body }) => {
  const b = body as JsonObject;
  const created = await create("roomTypes", {
    id: crypto.randomUUID(),
    slug: (b['name'] as string)?.toLowerCase().replace(/\s+/g, "-") ?? "",
    amenities: [],
    images: [],
    ...b,
    createdAt: new Date().toISOString(),
  });
  return wrapData(created);
});

route("PATCH", "/property/types/:id", async ({ params, body }) => {
  const updated = await update("roomTypes", params.id, { ...(body as JsonObject), updatedAt: new Date().toISOString() });
  return wrapData(updated);
});

route("DELETE", "/property/types/:id", async ({ params }) => {
  await remove("roomTypes", params.id);
  return wrapData({ message: "Deleted" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN ROOM UNITS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/property/units", async () => {
  return wrapData(await getAll("roomUnits"));
});

route("POST", "/property/units", async ({ body }) => {
  const created = await create("roomUnits", { id: crypto.randomUUID(), ...(body as JsonObject) });
  return wrapData(created);
});

route("PATCH", "/property/units/:id", async ({ params, body }) => {
  return wrapData(await update("roomUnits", params.id, body as JsonObject));
});

route("PATCH", "/property/units/:id/housekeeping", async ({ params, body }) => {
  const b = body as { housekeepingStatus: string };
  return wrapData(await update("roomUnits", params.id, { housekeepingStatus: b.housekeepingStatus }));
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN PRICING
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/property/pricing", async () => {
  return wrapData(await getAll("pricingRules"));
});

route("POST", "/property/pricing", async ({ body }) => {
  return wrapData(await create("pricingRules", { id: crypto.randomUUID(), ...(body as JsonObject), createdAt: new Date().toISOString() }));
});

route("PATCH", "/property/pricing/:id", async ({ params, body }) => {
  return wrapData(await update("pricingRules", params.id, body as JsonObject));
});

route("DELETE", "/property/pricing/:id", async ({ params }) => {
  await remove("pricingRules", params.id);
  return wrapData({ message: "Deleted" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN AVAILABILITY
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/availability/calendar", async ({ qs }) => {
  const startDate = qs.get("startDate") ?? "";
  const endDate = qs.get("endDate") ?? "";
  const units = await getAll<JsonObject>("roomUnits");
  const types = await getAll<JsonObject>("roomTypes");
  const days: JsonObject[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const cursor = new Date(start);
  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    for (const t of types) {
      const typeUnits = units.filter((u) => u['roomTypeId'] === t['id']);
      const available = typeUnits.filter((u) => u['status'] === "available").length;
      days.push({ date: dateStr, roomTypeId: t['id'] as string, roomTypeName: t['name'] as string, totalUnits: typeUnits.length, available, blocked: false });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return wrapData(days);
});

route("PATCH", "/availability/block", async ({ body }) => {
  const b = body as { roomTypeId: string; startDate: string; endDate: string; isBlocked: boolean };
  console.info("[MOCK] Availability block:", b);
  return wrapData({ message: b.isBlocked ? "Dates blocked" : "Dates unblocked" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN AMENITIES
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/property/amenities", async () => {
  return wrapData(await getAll("amenities"));
});

route("POST", "/property/amenities", async ({ body }) => {
  return wrapData(await create("amenities", { id: crypto.randomUUID(), ...(body as JsonObject) }));
});

route("PATCH", "/property/amenities/:id", async ({ params, body }) => {
  return wrapData(await update("amenities", params.id, body as JsonObject));
});

route("DELETE", "/property/amenities/:id", async ({ params }) => {
  await remove("amenities", params.id);
  return wrapData({ message: "Deleted" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN COUPONS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/coupons", async () => {
  return wrapData(await getAll("coupons"));
});

route("POST", "/coupons", async ({ body }) => {
  return wrapData(await create("coupons", { id: crypto.randomUUID(), usedCount: 0, ...(body as JsonObject), createdAt: new Date().toISOString() }));
});

route("PATCH", "/coupons/:id", async ({ params, body }) => {
  return wrapData(await update("coupons", params.id, body as JsonObject));
});

route("DELETE", "/coupons/:id", async ({ params }) => {
  await remove("coupons", params.id);
  return wrapData({ message: "Deleted" });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN REVIEWS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/reviews", async ({ qs }) => {
  let reviews = await getAll<JsonObject>("reviews");
  const status = qs.get("status");
  if (status) reviews = reviews.filter((r) => r['status'] === status);
  reviews.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return wrapData(reviews);
});

route("PATCH", "/reviews/:id/status", async ({ params, body }) => {
  const b = body as { status: string; reason?: string };
  return wrapData(await update("reviews", params.id, { status: b.status, moderationReason: b.reason ?? null, updatedAt: new Date().toISOString() }));
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/notifications", async ({ qs }) => {
  const { page, limit } = parsePageParams(qs);
  let notifs = await getAll<JsonObject>("notifications");
  const channel = qs.get("channel");
  const status = qs.get("status");
  if (channel) notifs = notifs.filter((n) => n['channel'] === channel);
  if (status) notifs = notifs.filter((n) => n['status'] === status);
  notifs.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return paginate(notifs, page, limit);
});

route("GET", "/notifications/:id", async ({ params }) => {
  const n = await getById("notifications", params.id);
  if (!n) { const e = new Error("Notification not found") as Error & { status: number }; e.status = 404; throw e; }
  return wrapData(n);
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN AUDIT LOGS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/audit", async ({ qs }) => {
  const { page, limit } = parsePageParams(qs);
  let logs = await getAll<JsonObject>("auditLogs");
  const action = qs.get("action");
  const dateFrom = qs.get("dateFrom");
  const dateTo = qs.get("dateTo");
  if (action) logs = logs.filter((l) => l['action'] === action);
  if (dateFrom) logs = logs.filter((l) => (l['createdAt'] as string) >= dateFrom);
  if (dateTo) logs = logs.filter((l) => (l['createdAt'] as string) <= dateTo);
  logs.sort((a, b) => (b['createdAt'] as string).localeCompare(a['createdAt'] as string));
  return paginate(logs, page, limit);
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN REPORTS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/admin/reports/:reportType", async ({ params, qs }) => {
  const bookings = await getAll<JsonObject>("bookings");
  const payments = await getAll<JsonObject>("payments");
  const startDate = qs.get("startDate") ?? "";
  const endDate = qs.get("endDate") ?? "";

  const filteredBookings = bookings.filter((b) => {
    const d = (b['createdAt'] as string).slice(0, 10);
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });
  const filteredPayments = payments.filter((p) => {
    const d = (p['createdAt'] as string).slice(0, 10);
    return (!startDate || d >= startDate) && (!endDate || d <= endDate);
  });

  const totalRevenue = filteredPayments.filter((p) => p['status'] === "paid").reduce((s, p) => s + ((p['amount'] as number) ?? 0), 0);
  const totalBookings = filteredBookings.length;
  const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return wrapData({
    reportType: params['reportType'],
    period: { startDate, endDate },
    summary: { totalRevenue, totalBookings, avgBookingValue, occupancyRate: 65 },
    data: filteredBookings.slice(0, 20),
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// ADMIN SETTINGS
// ──────────────────────────────────────────────────────────────────────────────

route("GET", "/settings", async () => {
  const all = await getAll("settings");
  return wrapData(all[0] ?? {});
});

route("PATCH", "/settings", async ({ body }) => {
  const all = await getAll<{ id: string }>("settings");
  const first = all[0];
  if (first) {
    return wrapData(await update("settings", first.id, { ...(body as JsonObject), updatedAt: new Date().toISOString() }));
  }
  return wrapData(await create("settings", { id: "settings-001", ...(body as JsonObject), updatedAt: new Date().toISOString() }));
});

// ──────────────────────────────────────────────────────────────────────────────
// MOCK ROUTER — entrypoint called from lib/api.ts
// ──────────────────────────────────────────────────────────────────────────────

export async function mockRequest<T>(
  method: string,
  path: string,
  body?: JsonObject | null,
): Promise<T> {
  await delay();
  maybeError();

  // Strip query string from path for matching
  const qIdx = path.indexOf("?");
  const pathname = qIdx >= 0 ? path.slice(0, qIdx) : path;
  const qs = new URLSearchParams(qIdx >= 0 ? path.slice(qIdx + 1) : "");

  for (const r of routes) {
    if (r.method !== method) continue;
    const match = pathname.match(r.pattern);
    if (!match) continue;

    const params: Record<string, string> = {};
    r.paramNames.forEach((name, i) => {
      params[name] = match[i + 1] ?? "";
    });

    const result = await r.handler({ method, path: pathname, body: body ?? null, params: params as Params, qs });
    return result as T;
  }

  // No route matched — log and return empty
  console.warn(`[MockDB] No handler for ${method} ${pathname}`);
  return {} as T;
}

/** Returns true if we have a handler for the given path (used for blob downloads) */
export function hasRoute(method: string, path: string): boolean {
  const qIdx = path.indexOf("?");
  const pathname = qIdx >= 0 ? path.slice(0, qIdx) : path;
  return routes.some((r) => r.method === method && r.pattern.test(pathname));
}

/** Export for server-side usage (no IDB needed) */
export { getSiteConfigData };

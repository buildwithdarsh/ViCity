/**
 * Seed data for the "auditLogs" store.
 * 35 audit log entries spanning different actions and users.
 */

const auditLogs = [
  { id: "al-001", action: "user.login", userId: "usr-admin-001", targetType: "user", targetId: "usr-admin-001", details: { ip: "103.21.58.100", userAgent: "Mozilla/5.0" }, createdAt: "2025-03-17T08:00:00.000Z" },
  { id: "al-002", action: "user.login", userId: "usr-admin-002", targetType: "user", targetId: "usr-admin-002", details: { ip: "103.21.58.101" }, createdAt: "2025-03-17T07:30:00.000Z" },
  { id: "al-003", action: "booking.create", userId: "usr-001", targetType: "booking", targetId: "bk-001", details: { bookingReference: "TSS-2025-0001" }, createdAt: "2025-03-10T09:00:00.000Z" },
  { id: "al-004", action: "booking.create", userId: "usr-002", targetType: "booking", targetId: "bk-002", details: { bookingReference: "TSS-2025-0002" }, createdAt: "2025-03-11T14:30:00.000Z" },
  { id: "al-005", action: "payment.success", userId: "usr-001", targetType: "payment", targetId: "pay-001", details: { amount: 8850000, method: "upi" }, createdAt: "2025-03-10T09:02:00.000Z" },
  { id: "al-006", action: "payment.success", userId: "usr-002", targetType: "payment", targetId: "pay-002", details: { amount: 2832000, method: "card" }, createdAt: "2025-03-11T14:32:00.000Z" },
  { id: "al-007", action: "booking.cancel", userId: "usr-016", targetType: "booking", targetId: "bk-021", details: { reason: "Plans changed" }, createdAt: "2025-02-28T15:00:00.000Z" },
  { id: "al-008", action: "payment.refund", userId: "usr-admin-001", targetType: "payment", targetId: "pay-017", details: { amount: 8850000 }, createdAt: "2025-03-02T10:00:00.000Z" },
  { id: "al-009", action: "review.submit", userId: "usr-001", targetType: "review", targetId: "rev-001", details: { rating: 5 }, createdAt: "2025-02-16T10:00:00.000Z" },
  { id: "al-010", action: "review.approve", userId: "usr-admin-001", targetType: "review", targetId: "rev-001", details: {}, createdAt: "2025-02-16T12:00:00.000Z" },
  { id: "al-011", action: "review.reject", userId: "usr-admin-002", targetType: "review", targetId: "rev-015", details: { reason: "Irrelevant content" }, createdAt: "2025-03-04T10:00:00.000Z" },
  { id: "al-012", action: "user.register", userId: "usr-019", targetType: "user", targetId: "usr-019", details: { phone: "9876543228" }, createdAt: "2025-03-05T16:30:00.000Z" },
  { id: "al-013", action: "user.register", userId: "usr-024", targetType: "user", targetId: "usr-024", details: { phone: "9876543233" }, createdAt: "2025-03-15T11:45:00.000Z" },
  { id: "al-014", action: "user.profile_update", userId: "usr-001", targetType: "user", targetId: "usr-001", details: { fields: ["name", "email"] }, createdAt: "2025-03-08T14:00:00.000Z" },
  { id: "al-015", action: "user.password_change", userId: "usr-010", targetType: "user", targetId: "usr-010", details: {}, createdAt: "2025-03-12T14:00:00.000Z" },
  { id: "al-016", action: "booking.checkin", userId: "usr-admin-001", targetType: "booking", targetId: "bk-012", details: {}, createdAt: "2025-03-16T14:00:00.000Z" },
  { id: "al-017", action: "booking.checkin", userId: "usr-admin-001", targetType: "booking", targetId: "bk-013", details: {}, createdAt: "2025-03-15T14:00:00.000Z" },
  { id: "al-018", action: "booking.checkout", userId: "usr-admin-002", targetType: "booking", targetId: "bk-019", details: {}, createdAt: "2025-03-09T11:00:00.000Z" },
  { id: "al-019", action: "coupon.create", userId: "usr-admin-001", targetType: "coupon", targetId: "cpn-024", details: { code: "FLASH50" }, createdAt: "2025-03-17T00:00:00.000Z" },
  { id: "al-020", action: "coupon.update", userId: "usr-admin-002", targetType: "coupon", targetId: "cpn-010", details: { fields: ["usageLimit"] }, createdAt: "2025-03-16T10:00:00.000Z" },
  { id: "al-021", action: "settings.update", userId: "usr-admin-001", targetType: "settings", targetId: "settings-001", details: { fields: ["check_in_time", "check_out_time"] }, createdAt: "2025-03-15T09:00:00.000Z" },
  { id: "al-022", action: "room.type_create", userId: "usr-admin-001", targetType: "roomType", targetId: "rt-005", details: { name: "The Penthouse Terrace" }, createdAt: "2024-06-01T10:00:00.000Z" },
  { id: "al-023", action: "room.unit_create", userId: "usr-admin-002", targetType: "roomUnit", targetId: "ru-013", details: { roomNumber: "PH-501" }, createdAt: "2024-06-01T10:30:00.000Z" },
  { id: "al-024", action: "pricing.create", userId: "usr-admin-001", targetType: "pricingRule", targetId: "pr-013", details: { type: "special_event" }, createdAt: "2025-03-01T00:00:00.000Z" },
  { id: "al-025", action: "availability.block", userId: "usr-admin-001", targetType: "roomType", targetId: "rt-005", details: { startDate: "2025-03-01", endDate: "2025-06-30", reason: "Maintenance" }, createdAt: "2025-02-28T10:00:00.000Z" },
  { id: "al-026", action: "payment.failed", userId: "usr-014", targetType: "payment", targetId: "pay-020", details: { reason: "UPI timeout" }, createdAt: "2025-03-16T06:03:00.000Z" },
  { id: "al-027", action: "user.login", userId: "usr-001", targetType: "user", targetId: "usr-001", details: { ip: "49.36.128.50" }, createdAt: "2025-03-16T08:00:00.000Z" },
  { id: "al-028", action: "user.login", userId: "usr-003", targetType: "user", targetId: "usr-003", details: { ip: "103.82.12.45" }, createdAt: "2025-03-15T10:00:00.000Z" },
  { id: "al-029", action: "booking.create", userId: "usr-006", targetType: "booking", targetId: "bk-037", details: { bookingReference: "TSS-2025-0037" }, createdAt: "2025-03-16T15:00:00.000Z" },
  { id: "al-030", action: "user.block", userId: "usr-admin-001", targetType: "user", targetId: "usr-018", details: { reason: "Suspicious activity" }, createdAt: "2025-03-15T16:00:00.000Z" },
  { id: "al-031", action: "user.unblock", userId: "usr-admin-002", targetType: "user", targetId: "usr-018", details: {}, createdAt: "2025-03-16T09:00:00.000Z" },
  { id: "al-032", action: "amenity.create", userId: "usr-admin-001", targetType: "amenity", targetId: "am-025", details: { name: "Mini Bar" }, createdAt: "2025-03-10T10:00:00.000Z" },
  { id: "al-033", action: "room.housekeeping_update", userId: "usr-admin-002", targetType: "roomUnit", targetId: "ru-004", details: { from: "clean", to: "dirty" }, createdAt: "2025-03-17T06:00:00.000Z" },
  { id: "al-034", action: "booking.cancel", userId: "usr-017", targetType: "booking", targetId: "bk-022", details: { reason: "Travel plans changed" }, createdAt: "2025-03-01T09:00:00.000Z" },
  { id: "al-035", action: "notification.send", userId: "usr-admin-001", targetType: "notification", targetId: "ntf-020", details: { type: "promotion", recipients: 25 }, createdAt: "2025-03-15T10:00:00.000Z" },
];

export default auditLogs;

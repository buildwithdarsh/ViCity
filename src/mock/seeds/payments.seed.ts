/**
 * Seed data for the "payments" store.
 * One or more payments per booking, covering all payment statuses.
 */

const payments = [
  // ── Paid bookings ─────────────────────────────────────────────────────────
  { id: "pay-001", bookingId: "bk-001", amount: 8850000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_001", providerPaymentId: "pay_mock_001", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-10T09:02:00.000Z" },
  { id: "pay-002", bookingId: "bk-002", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_002", providerPaymentId: "pay_mock_002", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-11T14:32:00.000Z" },
  { id: "pay-003", bookingId: "bk-003", amount: 844000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_003", providerPaymentId: "pay_mock_003", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-12T11:02:00.000Z" },
  { id: "pay-004", bookingId: "bk-004", amount: 11450000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_004", providerPaymentId: "pay_mock_004", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-05T16:02:00.000Z" },
  { id: "pay-005", bookingId: "bk-005", amount: 1180000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_005", providerPaymentId: "pay_mock_005", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-14T08:32:00.000Z" },
  { id: "pay-006", bookingId: "bk-006", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_006", providerPaymentId: "pay_mock_006", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-08T12:17:00.000Z" },
  { id: "pay-007", bookingId: "bk-007", amount: 1888000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_007", providerPaymentId: "pay_mock_007", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-15T10:02:00.000Z" },
  { id: "pay-008", bookingId: "bk-012", amount: 8100000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_012", providerPaymentId: "pay_mock_012", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-01T10:02:00.000Z" },
  { id: "pay-009", bookingId: "bk-013", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_013", providerPaymentId: "pay_mock_013", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-02T14:02:00.000Z" },
  { id: "pay-010", bookingId: "bk-014", amount: 590000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_014", providerPaymentId: "pay_mock_014", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-10T18:02:00.000Z" },

  // ── Checked-out bookings ──────────────────────────────────────────────────
  { id: "pay-011", bookingId: "bk-015", amount: 11100000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_015", providerPaymentId: "pay_mock_015", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-01-20T09:05:00.000Z" },
  { id: "pay-012", bookingId: "bk-016", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_016", providerPaymentId: "pay_mock_016", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-05T16:05:00.000Z" },
  { id: "pay-013", bookingId: "bk-017", amount: 1770000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_017", providerPaymentId: "pay_mock_017", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2025-01-02T11:35:00.000Z" },
  { id: "pay-014", bookingId: "bk-018", amount: 1888000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_018", providerPaymentId: "pay_mock_018", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-15T08:05:00.000Z" },
  { id: "pay-015", bookingId: "bk-019", amount: 11800000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_019", providerPaymentId: "pay_mock_019", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-20T13:05:00.000Z" },
  { id: "pay-016", bookingId: "bk-020", amount: 3888000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_020", providerPaymentId: "pay_mock_020", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-25T10:35:00.000Z" },

  // ── Refunded payments ─────────────────────────────────────────────────────
  { id: "pay-017", bookingId: "bk-021", amount: 8850000, currency: "INR", status: "refunded", provider: "razorpay", providerOrderId: "order_mock_021", providerPaymentId: "pay_mock_021", method: "card", refundedAmount: 8850000, webhookEvents: [{ event: "payment.refunded", timestamp: "2025-03-02T10:00:00.000Z" }], createdAt: "2025-02-28T15:02:00.000Z" },
  { id: "pay-018", bookingId: "bk-022", amount: 1888000, currency: "INR", status: "refunded", provider: "razorpay", providerOrderId: "order_mock_022", providerPaymentId: "pay_mock_022", method: "upi", refundedAmount: 1888000, webhookEvents: [{ event: "payment.refunded", timestamp: "2025-03-03T10:00:00.000Z" }], createdAt: "2025-03-01T09:02:00.000Z" },
  { id: "pay-019", bookingId: "bk-023", amount: 1180000, currency: "INR", status: "refunded", provider: "razorpay", providerOrderId: "order_mock_023", providerPaymentId: "pay_mock_023", method: "netbanking", refundedAmount: 1180000, webhookEvents: [{ event: "payment.refunded", timestamp: "2025-03-07T10:00:00.000Z" }], createdAt: "2025-03-05T12:02:00.000Z" },

  // ── Failed payment ────────────────────────────────────────────────────────
  { id: "pay-020", bookingId: "bk-039", amount: 590000, currency: "INR", status: "failed", provider: "razorpay", providerOrderId: "order_mock_039", providerPaymentId: null, method: "upi", refundedAmount: 0, webhookEvents: [{ event: "payment.failed", timestamp: "2025-03-16T06:03:00.000Z" }], createdAt: "2025-03-16T06:02:00.000Z" },

  // ── Partial payments (two payments for one booking) ────────────────────────
  { id: "pay-021", bookingId: "bk-034", amount: 2124000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_034a", providerPaymentId: "pay_mock_034a", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-14T16:02:00.000Z" },

  // ── No-show bookings (paid but didn't show up) ────────────────────────────
  { id: "pay-022", bookingId: "bk-025", amount: 590000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_025", providerPaymentId: "pay_mock_025", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-15T11:05:00.000Z" },
  { id: "pay-023", bookingId: "bk-026", amount: 1888000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_026", providerPaymentId: "pay_mock_026", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-02-20T16:35:00.000Z" },

  // ── Older bookings ────────────────────────────────────────────────────────
  { id: "pay-024", bookingId: "bk-027", amount: 13500000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_027", providerPaymentId: "pay_mock_027", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2024-11-15T10:05:00.000Z" },
  { id: "pay-025", bookingId: "bk-028", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_028", providerPaymentId: "pay_mock_028", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2024-10-20T08:05:00.000Z" },
  { id: "pay-026", bookingId: "bk-029", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_029", providerPaymentId: "pay_mock_029", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2024-09-15T14:05:00.000Z" },
  { id: "pay-027", bookingId: "bk-030", amount: 1770000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_030", providerPaymentId: "pay_mock_030", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2024-08-10T09:35:00.000Z" },
  { id: "pay-028", bookingId: "bk-031", amount: 15050000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_031", providerPaymentId: "pay_mock_031", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2024-07-20T11:05:00.000Z" },
  { id: "pay-029", bookingId: "bk-032", amount: 4248000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_032", providerPaymentId: "pay_mock_032", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2024-06-15T07:05:00.000Z" },
  { id: "pay-030", bookingId: "bk-033", amount: 8850000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_033", providerPaymentId: "pay_mock_033", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-15T14:05:00.000Z" },

  // ── Payments for demo user usr-001 bookings ────────────────────────────────
  { id: "pay-d01", bookingId: "bk-d01", amount: 3888000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d01", providerPaymentId: "pay_mock_d01", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2024-04-15T09:05:00.000Z" },
  { id: "pay-d02", bookingId: "bk-d02", amount: 2832000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d02", providerPaymentId: "pay_mock_d02", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2024-06-25T14:05:00.000Z" },
  { id: "pay-d03", bookingId: "bk-d03", amount: 1080000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d03", providerPaymentId: "pay_mock_d03", method: "netbanking", refundedAmount: 0, webhookEvents: [], createdAt: "2024-08-10T11:05:00.000Z" },
  { id: "pay-d04", bookingId: "bk-d04", amount: 13800000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d04", providerPaymentId: "pay_mock_d04", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2024-09-20T16:05:00.000Z" },
  { id: "pay-d05", bookingId: "bk-d05", amount: 4248000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d05", providerPaymentId: "pay_mock_d05", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2024-11-30T08:05:00.000Z" },
  { id: "pay-d06", bookingId: "bk-d06", amount: 2592000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d06", providerPaymentId: "pay_mock_d06", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2024-12-20T10:35:00.000Z" },
  { id: "pay-d07", bookingId: "bk-d07", amount: 8850000, currency: "INR", status: "refunded", provider: "razorpay", providerOrderId: "order_mock_d07", providerPaymentId: "pay_mock_d07", method: "card", refundedAmount: 8850000, webhookEvents: [{ event: "payment.refunded", timestamp: "2025-02-12T10:00:00.000Z" }], createdAt: "2025-02-10T09:05:00.000Z" },
  { id: "pay-d08", bookingId: "bk-d08", amount: 1770000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d08", providerPaymentId: "pay_mock_d08", method: "upi", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-05T12:05:00.000Z" },
  { id: "pay-d09", bookingId: "bk-d09", amount: 14050000, currency: "INR", status: "paid", provider: "razorpay", providerOrderId: "order_mock_d09", providerPaymentId: "pay_mock_d09", method: "card", refundedAmount: 0, webhookEvents: [], createdAt: "2025-03-01T15:05:00.000Z" },
];

export default payments;


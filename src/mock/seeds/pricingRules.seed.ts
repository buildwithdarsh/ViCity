/**
 * Seed data for the "pricingRules" store.
 */

const pricingRules = [
  // Weekend surcharge for all room types
  { id: "pr-001", roomTypeId: "rt-001", type: "weekend", price: 0, multiplier: 1.25, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 10, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "pr-002", roomTypeId: "rt-002", type: "weekend", price: 0, multiplier: 1.2, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 10, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "pr-003", roomTypeId: "rt-003", type: "weekend", price: 0, multiplier: 1.15, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 10, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "pr-004", roomTypeId: "rt-004", type: "weekend", price: 0, multiplier: 1.1, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 10, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },

  // Peak season pricing (April-June)
  { id: "pr-005", roomTypeId: "rt-001", type: "seasonal", price: 3000000, multiplier: null, startDate: "2025-04-01", endDate: "2025-06-30", daysOfWeek: [], minStay: null, maxStay: null, priority: 20, isActive: true, createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "pr-006", roomTypeId: "rt-002", type: "seasonal", price: 1500000, multiplier: null, startDate: "2025-04-01", endDate: "2025-06-30", daysOfWeek: [], minStay: null, maxStay: null, priority: 20, isActive: true, createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "pr-007", roomTypeId: "rt-003", type: "seasonal", price: 1000000, multiplier: null, startDate: "2025-04-01", endDate: "2025-06-30", daysOfWeek: [], minStay: null, maxStay: null, priority: 20, isActive: true, createdAt: "2025-01-01T00:00:00.000Z" },

  // Monsoon discount (July-September)
  { id: "pr-008", roomTypeId: "rt-001", type: "seasonal", price: 0, multiplier: 0.8, startDate: "2025-07-01", endDate: "2025-09-30", daysOfWeek: [], minStay: null, maxStay: null, priority: 20, isActive: true, createdAt: "2025-01-01T00:00:00.000Z" },
  { id: "pr-009", roomTypeId: "rt-002", type: "seasonal", price: 0, multiplier: 0.85, startDate: "2025-07-01", endDate: "2025-09-30", daysOfWeek: [], minStay: null, maxStay: null, priority: 20, isActive: true, createdAt: "2025-01-01T00:00:00.000Z" },

  // Long-stay discount (7+ nights)
  { id: "pr-010", roomTypeId: "rt-001", type: "long_stay", price: 0, multiplier: 0.9, startDate: null, endDate: null, daysOfWeek: [], minStay: 7, maxStay: null, priority: 30, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },
  { id: "pr-011", roomTypeId: "rt-002", type: "long_stay", price: 0, multiplier: 0.92, startDate: null, endDate: null, daysOfWeek: [], minStay: 7, maxStay: null, priority: 30, isActive: true, createdAt: "2024-01-01T00:00:00.000Z" },

  // Diwali special (inactive — past)
  { id: "pr-012", roomTypeId: "rt-001", type: "special_event", price: 3500000, multiplier: null, startDate: "2024-10-29", endDate: "2024-11-03", daysOfWeek: [], minStay: 2, maxStay: null, priority: 50, isActive: false, createdAt: "2024-09-01T00:00:00.000Z" },

  // New Year special
  { id: "pr-013", roomTypeId: "rt-001", type: "special_event", price: 4000000, multiplier: null, startDate: "2025-12-28", endDate: "2026-01-02", daysOfWeek: [], minStay: 3, maxStay: null, priority: 50, isActive: true, createdAt: "2025-03-01T00:00:00.000Z" },
  { id: "pr-014", roomTypeId: "rt-002", type: "special_event", price: 1800000, multiplier: null, startDate: "2025-12-28", endDate: "2026-01-02", daysOfWeek: [], minStay: 2, maxStay: null, priority: 50, isActive: true, createdAt: "2025-03-01T00:00:00.000Z" },

  // Mid-week discount
  { id: "pr-015", roomTypeId: "rt-004", type: "midweek", price: 0, multiplier: 0.85, startDate: null, endDate: null, daysOfWeek: [1, 2, 3], minStay: null, maxStay: null, priority: 5, isActive: true, createdAt: "2025-01-15T00:00:00.000Z" },

  // Last-minute pricing (inactive)
  { id: "pr-016", roomTypeId: "rt-003", type: "last_minute", price: 600000, multiplier: null, startDate: "2025-03-15", endDate: "2025-03-20", daysOfWeek: [], minStay: null, maxStay: 2, priority: 40, isActive: false, createdAt: "2025-03-14T00:00:00.000Z" },

  // Penthouse special (maintenance room — disabled)
  { id: "pr-017", roomTypeId: "rt-005", type: "weekend", price: 0, multiplier: 1.3, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 10, isActive: false, createdAt: "2024-01-01T00:00:00.000Z" },

  // Heritage room weekend surcharge (additional)
  { id: "pr-018", roomTypeId: "rt-004", type: "weekend", price: 600000, multiplier: null, startDate: null, endDate: null, daysOfWeek: [5, 6], minStay: null, maxStay: null, priority: 15, isActive: true, createdAt: "2025-02-01T00:00:00.000Z" },

  // Summer special for cabana
  { id: "pr-019", roomTypeId: "rt-003", type: "seasonal", price: 900000, multiplier: null, startDate: "2025-04-15", endDate: "2025-05-31", daysOfWeek: [], minStay: null, maxStay: null, priority: 25, isActive: true, createdAt: "2025-03-01T00:00:00.000Z" },

  // Zero-value edge case
  { id: "pr-020", roomTypeId: "rt-004", type: "promotional", price: 0, multiplier: 1.0, startDate: null, endDate: null, daysOfWeek: [], minStay: null, maxStay: null, priority: 0, isActive: false, createdAt: "2025-01-01T00:00:00.000Z" },
];

export default pricingRules;

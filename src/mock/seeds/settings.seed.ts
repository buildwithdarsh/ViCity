/**
 * Seed data for the "settings" store.
 * Single settings record for the property.
 */

const settings = [
  {
    id: "settings-001",
    name: "ViCity",
    address: "Abc, XYZ",
    phone: "hello@build.withdarsh.com",
    email: "hello@build.withdarsh.com",
    check_in_time: "14:00",
    check_out_time: "11:00",
    booking_hold_minutes: 10,
    advance_payment_percent: 50,
    currency: "INR",
    currency_symbol: "\u20B9",
    timezone: "Asia/Kolkata",
    tax_rate: 18,
    tax_label: "GST",
    max_guests_included: 6,
    extra_guest_charge: 150000,
    min_nights: 1,
    max_nights: 21,
    updatedAt: "2025-03-15T09:00:00.000Z",
  },
];

export default settings;

/**
 * Shared types for ViCity — import from SDK where possible,
 * extend only for fields the SDK doesn't yet cover.
 */
import type { EndUser, PropertyBooking } from '@buildwithdarsh/sdk';

// ─── Storefront User (extends SDK EndUser with hospitality fields) ──────────
export interface User extends Pick<EndUser, 'id' | 'name' | 'email' | 'phone' | 'isPhoneVerified' | 'isEmailVerified'> {
  isGuest: boolean;
}

// ─── Booking (mirrors SDK PropertyBooking) ──────────────────────────────────
export type Booking = PropertyBooking;

// ─── Booking Detail (extends Booking with payments/check-in data) ───────────
export interface BookingDetail extends PropertyBooking {
  roomType?: { id: string; name: string };
  checkedInAt?: string;
  checkedOutAt?: string;
  bookingRooms?: Array<{ id: string; roomUnit?: { roomNumber: string; floor: number } | null }>;
  payments?: Array<{ id: string; amount: number; status: string; method?: string | null; createdAt: string }>;
}

// ─── Admin Types ────────────────────────────────────────────────────────────

export interface AdminBooking {
  id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  status: string;
}

export interface AdminBookingDetail extends BookingDetail {
  guestCount: number;
}

export interface AdminPayment {
  id: string;
  bookingId: string;
  booking: { bookingReference: string; guestName: string };
  amount: number;
  method: string | null;
  status: string;
  createdAt: string;
}

export interface AdminPaymentDetail {
  id: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amount: number;
  currency: string;
  method: string | null;
  status: string;
  createdAt: string;
  booking: { id: string; reference: string; guestName: string; guestEmail: string };
  webhookEvents: Array<{ id: string; eventType: string; createdAt: string }>;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isBlocked: boolean;
  createdAt: string;
  _count?: { bookings: number };
}

export interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  bookings?: Array<{
    id: string;
    bookingReference: string;
    status: string;
    totalAmount: number;
    checkInDate: string;
  }>;
}

// ─── Re-export SDK types for convenience ────────────────────────────────────
export type { EndUser, PropertyBooking } from '@buildwithdarsh/sdk';

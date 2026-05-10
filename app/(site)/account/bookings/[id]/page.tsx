"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiArrowLeft,
  FiCalendar,
  FiCreditCard,
  FiLogIn,
  FiLogOut,
  FiMoon,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiUser,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { formatCurrency } from "@/lib/utils/currency";
import { motion } from "framer-motion";
import { useAuth } from "../../../hooks/useAuth";
import { TZ } from "@/lib/tz";
import type { BookingDetail } from "@/lib/types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(time24: string) {
  const parts = time24.split(":").map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getNights(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

const journeySteps = [
  { key: "booked", label: "Booked", icon: FiCalendar },
  { key: "payment", label: "Payment", icon: FiCreditCard },
  { key: "check_in", label: "Check-in", icon: FiLogIn },
  { key: "stay", label: "Staying", icon: FiMoon },
  { key: "check_out", label: "Check-out", icon: FiLogOut },
];

function getActiveStep(status: string): number {
  switch (status) {
    case "pending": return 0;
    case "payment_pending": return 1;
    case "confirmed": return 2;
    case "checked_in": return 3;
    case "checked_out": return 4;
    default: return -1;
  }
}

function BookingTimeline({ status }: { status: string }) {
  const isCancelled = status === "cancelled";
  const activeStep = getActiveStep(status);
  const isComplete = status === "checked_out";

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2.5 py-3 px-4 bg-red-50 rounded-lg">
        <FiXCircle size={16} className="text-red-400 shrink-0" />
        <span className="text-sm text-red-600 font-medium">Booking Cancelled</span>
      </div>
    );
  }

  return (
    <div className="relative my-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-3 left-3 right-3 h-[2px] bg-zinc-100" />
        {activeStep >= 0 && (
          <div
            className="absolute top-3 left-3 h-[2px] bg-gold transition-all duration-700 ease-out"
            style={{ width: `calc(${(Math.min(activeStep, journeySteps.length - 1) / (journeySteps.length - 1)) * 100}% - 1.5rem)` }}
          />
        )}
        {journeySteps.map((step, i) => {
          const isDone = i < activeStep || isComplete;
          const isActive = i === activeStep;
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1" style={{ width: "20%" }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${isDone ? "bg-gold text-white shadow-sm" : isActive ? "bg-gold text-white shadow-md shadow-gold/30 ring-2 ring-gold/10" : "bg-zinc-100 text-zinc-300"}`}>
                <Icon size={11} />
              </div>
              <span className={`text-[7px] font-medium tracking-wide uppercase leading-tight text-center ${isDone || isActive ? "text-charcoal" : "text-zinc-300"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getMapEmbedUrl(address: string) {
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function getDirectionsUrl(address: string) {
  const dest = encodeURIComponent(address);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { openLoginModal, token: authToken } = useAuth();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");
  const [hotelAddress, setHotelAddress] = useState("");

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();

    // Try lookup credentials from sessionStorage (for public booking lookup)
    const lookupData = sessionStorage.getItem("booking_lookup");
    const lookup = lookupData ? JSON.parse(lookupData) : null;
    const isLookup = lookup && lookup.bookingId === id;

    if (!token && !isLookup) { openLoginModal(true); return; }

    const fetchBooking = isLookup
      ? TZ.storefront.property.lookupBooking(lookup.bookingReference)
      : TZ.storefront.property.getBooking(id);

    fetchBooking
      .then((b) => setBooking(b as unknown as BookingDetail))
      .catch(() => router.push(isLookup ? "/lookup-booking" : "/account/bookings"))
      .finally(() => setLoading(false));

    TZ.storefront.config.get()
      .then((config) => {
        const cfg = config as unknown as Record<string, Record<string, string>>;
        if (cfg['property']?.['check_in_time']) setCheckInTime(cfg['property']['check_in_time']);
        if (cfg['property']?.['check_out_time']) setCheckOutTime(cfg['property']['check_out_time']);
        if (cfg['contact']?.['address']) setHotelAddress(cfg['contact']['address']);
      })
      .catch(() => {});
  }, [id, authToken, openLoginModal, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-cream flex flex-col">
        <div className="flex-1 bg-zinc-200 animate-pulse" />
        <div className="bg-white rounded-t-3xl p-5 space-y-4 animate-pulse" style={{ minHeight: "40vh" }}>
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
          <div className="h-5 w-40 bg-zinc-100 rounded" />
          <div className="h-3 w-52 bg-zinc-50 rounded" />
          <div className="flex gap-3 mt-4">
            <div className="flex-1 bg-cream rounded-lg h-16" />
            <div className="flex-1 bg-cream rounded-lg h-16" />
          </div>
          <div className="flex justify-between mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-zinc-100" />
                <div className="h-2 w-8 bg-zinc-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const nights = getNights(booking.checkInDate, booking.checkOutDate);
  const isCancelled = booking.status === "cancelled";
  const paidAmount = booking.payments?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0) ?? 0;
  const outstandingBalance = booking.totalAmount - paidAmount;
  const hasBalance = outstandingBalance > 0 && !isCancelled && booking.status !== "checked_out";

  return (
    <div className="fixed inset-0 flex flex-col bg-cream">
      {/* Back button overlay */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-charcoal hover:bg-white transition-colors"
        >
          <FiArrowLeft size={18} />
        </button>
      </div>

      {/* Map Section — shows villa location */}
      <div className="flex-1 relative bg-zinc-200 min-h-[30vh]">
        {hotelAddress ? (
          <iframe
            src={getMapEmbedUrl(hotelAddress)}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Villa location"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <FiMapPin size={24} className="text-zinc-300 mx-auto" />
              <p className="text-sm text-zinc-400">Map unavailable</p>
            </div>
          </div>
        )}

        {/* Get Directions — opens native maps app */}
        {hotelAddress && (
          <a
            href={getDirectionsUrl(hotelAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-gold text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-gold/90 transition-colors"
          >
            <FiNavigation size={14} />
            Get Directions
          </a>
        )}
      </div>

      {/* Booking Detail Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white rounded-t-3xl -mt-4 z-10 overflow-y-auto"
        style={{ maxHeight: "60vh", minHeight: "40vh" }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 bg-white pt-3 pb-2 rounded-t-3xl z-10">
          <div className="w-10 h-1 bg-zinc-200 rounded-full mx-auto" />
        </div>

        <div className="px-5 pb-28">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0">
              <h2 className="text-lg text-charcoal font-serif">{booking.roomType?.name || "ViCity"}</h2>
              <p className="text-zinc-400 text-[10px] font-mono tracking-wider mt-0.5">{booking.bookingReference}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-charcoal font-semibold text-lg">{formatCurrency(booking.totalAmount)}</p>
              <p className="text-zinc-400 text-[10px] mt-0.5">{nights} {nights === 1 ? "night" : "nights"}</p>
            </div>
          </div>

          {/* Date Blocks */}
          <div className="flex items-center gap-2 mt-4">
            <div className="flex items-center gap-1.5 bg-cream/80 rounded-lg px-2.5 py-2 flex-1 min-w-0">
              <FiMapPin size={12} className="text-gold shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Check-in</p>
                <p className="text-xs text-charcoal font-medium whitespace-nowrap">{formatDate(booking.checkInDate)}</p>
                <p className="text-[10px] text-zinc-400">{formatTime(checkInTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 text-zinc-300 shrink-0">
              <div className="w-3 h-[1px] bg-zinc-200" />
              <FiClock size={10} />
              <div className="w-3 h-[1px] bg-zinc-200" />
            </div>
            <div className="flex items-center gap-1.5 bg-cream/80 rounded-lg px-2.5 py-2 flex-1 min-w-0">
              <FiMapPin size={12} className="text-gold shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium">Check-out</p>
                <p className="text-xs text-charcoal font-medium whitespace-nowrap">{formatDate(booking.checkOutDate)}</p>
                <p className="text-[10px] text-zinc-400">{formatTime(checkOutTime)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-3">
            <BookingTimeline status={booking.status} />
          </div>

          {/* Guest Info */}
          <div className="mt-4 space-y-2">
            <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Guest Details</h3>
            <div className="bg-cream/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-charcoal">
                <FiUser size={13} className="text-gold shrink-0" />
                <span>{booking.guestName}</span>
              </div>
              {booking.guestEmail && (
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <FiMail size={13} className="text-gold shrink-0" />
                  <span className="truncate">{booking.guestEmail}</span>
                </div>
              )}
              {booking.guestPhone && (
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <FiPhone size={13} className="text-gold shrink-0" />
                  <span>{booking.guestPhone}</span>
                </div>
              )}
              {booking.guestCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-charcoal">
                  <FiUser size={13} className="text-gold shrink-0" />
                  <span>{booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="mt-4 space-y-2">
            <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Payment</h3>
            <div className="bg-cream/60 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Total</span>
                <span className="text-charcoal font-medium">{formatCurrency(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Paid</span>
                <span className="text-green-600 font-medium">{formatCurrency(paidAmount)}</span>
              </div>
              {hasBalance && (
                <div className="flex justify-between text-sm pt-1.5 border-t border-sand/20">
                  <span className="text-amber-600 font-medium">Balance Due</span>
                  <span className="text-amber-600 font-medium">{formatCurrency(outstandingBalance)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Outstanding Balance CTA */}
          {hasBalance && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <Link
                href={`/booking?balanceBookingId=${booking.id}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gold text-white hover:bg-gold/90 transition-colors text-sm font-medium tracking-wide"
              >
                <FiCreditCard size={15} />
                Pay Balance — {formatCurrency(outstandingBalance)}
              </Link>
            </motion.div>
          )}

          {/* Notes */}
          {booking.specialRequests && (
            <div className="mt-4 space-y-2">
              <h3 className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Notes</h3>
              <p className="text-sm text-charcoal bg-cream/60 rounded-xl p-3">{booking.specialRequests}</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCalendar, FiArrowLeft, FiCreditCard, FiLogIn, FiLogOut, FiMoon, FiXCircle, FiClock, FiMapPin, FiNavigation, FiAlertCircle } from "react-icons/fi";
import { formatCurrency } from "@/lib/utils/currency";
import { useAuth } from "../../hooks/useAuth";
import { TZ } from "@/lib/tz";
import type { Booking } from "@/lib/types";

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
    <div className="relative mt-6 mb-2">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 h-[2px] bg-zinc-100" />
        {/* Active track */}
        {activeStep >= 0 && (
          <div
            className="absolute top-3 sm:top-4 left-3 sm:left-4 h-[2px] bg-gold transition-all duration-700 ease-out"
            style={{ width: `calc(${(Math.min(activeStep, journeySteps.length - 1) / (journeySteps.length - 1)) * 100}% - 1.5rem)` }}
          />
        )}

        {journeySteps.map((step, i) => {
          const isDone = i < activeStep || isComplete;
          const isActive = i === activeStep;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1" style={{ width: "20%" }}>
              <div
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-500
                  ${isDone
                    ? "bg-gold text-white shadow-sm"
                    : isActive
                      ? "bg-gold text-white shadow-md shadow-gold/30 ring-2 sm:ring-4 ring-gold/10"
                      : "bg-zinc-100 text-zinc-300"
                  }
                `}
              >
                <Icon size={11} className="sm:hidden" />
                <Icon size={14} className="hidden sm:block" />
              </div>
              <span className={`text-[8px] sm:text-[10px] font-medium tracking-wide uppercase leading-tight text-center ${isDone || isActive ? "text-charcoal" : "text-zinc-300"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyBookingsPage() {
  const { openLoginModal, token: authToken } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();
    if (!token) { openLoginModal(true); return; }
    TZ.storefront.property.listBookings()
      .then((res) => { setBookings(((res as unknown as { data: Booking[] }).data || []) as Booking[]); setLoading(false); })
      .catch(() => openLoginModal(true));
    TZ.storefront.config.get()
      .then((config) => {
        const cfg = config as unknown as Record<string, unknown>;
        const prop = cfg['property'] as Record<string, string> | undefined;
        if (prop?.['check_in_time']) setCheckInTime(prop['check_in_time']);
        if (prop?.['check_out_time']) setCheckOutTime(prop['check_out_time']);
      })
      .catch(() => {});
  }, [openLoginModal, authToken]);

  return (
    <div className="pt-20 sm:pt-28 pb-24 sm:pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <div>
          <Link href="/account" className="hidden sm:inline-flex items-center gap-2 text-zinc-500 hover:text-charcoal text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to Account
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-5 sm:mb-8">My Bookings</h1>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden">
                {/* Header skeleton */}
                <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-5 w-36 bg-zinc-100 rounded" />
                      <div className="h-3 w-44 bg-zinc-50 rounded" />
                    </div>
                    <div className="space-y-1.5 text-right">
                      <div className="h-5 w-20 bg-zinc-100 rounded ml-auto" />
                      <div className="h-3 w-12 bg-zinc-50 rounded ml-auto" />
                    </div>
                  </div>
                </div>
                {/* Date blocks skeleton */}
                <div className="px-4 sm:px-6 py-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex-1 bg-cream/80 rounded-lg px-3 py-3">
                      <div className="h-2 w-14 bg-zinc-100 rounded mb-2" />
                      <div className="h-4 w-24 bg-zinc-100 rounded mb-1.5" />
                      <div className="h-2.5 w-14 bg-zinc-50 rounded" />
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <div className="w-3 sm:w-6 h-[1px] bg-zinc-200" />
                      <div className="w-3 h-3 rounded-full bg-zinc-100" />
                      <div className="w-3 sm:w-6 h-[1px] bg-zinc-200" />
                    </div>
                    <div className="flex-1 bg-cream/80 rounded-lg px-3 py-3">
                      <div className="h-2 w-16 bg-zinc-100 rounded mb-2" />
                      <div className="h-4 w-24 bg-zinc-100 rounded mb-1.5" />
                      <div className="h-2.5 w-14 bg-zinc-50 rounded" />
                    </div>
                  </div>
                </div>
                {/* Timeline skeleton */}
                <div className="px-4 sm:px-6 mt-4 mb-2">
                  <div className="flex items-center justify-between">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="flex flex-col items-center gap-1.5" style={{ width: "20%" }}>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-zinc-100" />
                        <div className="h-2 w-8 sm:w-10 bg-zinc-50 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pb-5" />
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div>
            <div className="bg-white rounded-3xl p-12 text-center">
              <FiCalendar size={32} className="text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500">No bookings yet</p>
              <Link href="/gallery" className="mt-4 inline-block text-gold-600 hover:text-gold-700 text-sm font-medium">
                Explore the Villa
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const nights = getNights(b.checkInDate, b.checkOutDate);
              const isCancelled = b.status === "cancelled";
              const hasBalance = b.paymentStatus !== "paid" && !isCancelled && b.status !== "checked_out";

              return (
                <Link key={b.id} href={`/account/bookings/${b.id}`} className="block">
                  <div className={`bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-lg hover:shadow-zinc-200/50 ${isCancelled ? "opacity-70" : ""}`}>
                    {/* Header */}
                    <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg text-charcoal font-serif">ViCity</h2>
                            {!isCancelled && (
                              <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
                                <FiNavigation size={13} className="text-gold" />
                              </div>
                            )}
                          </div>
                          <p className="text-zinc-400 text-[10px] sm:text-xs mt-0.5 font-mono tracking-wider truncate">{b.bookingReference}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-charcoal font-semibold text-base sm:text-lg">{formatCurrency(b.totalAmount)}</p>
                          <p className="text-zinc-400 text-[10px] sm:text-xs mt-0.5">{nights} {nights === 1 ? "night" : "nights"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Date Blocks */}
                    <div className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-cream/80 rounded-lg px-2.5 sm:px-3 py-2 flex-1 min-w-0">
                          <FiMapPin size={12} className="text-gold shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Check-in</p>
                            <p className="text-xs sm:text-sm text-charcoal font-medium whitespace-nowrap">{formatDate(b.checkInDate)}</p>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400">{formatTime(checkInTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 text-zinc-300 shrink-0">
                          <div className="w-3 sm:w-6 h-[1px] bg-zinc-200" />
                          <FiClock size={10} className="sm:hidden" />
                          <FiClock size={12} className="hidden sm:block" />
                          <div className="w-3 sm:w-6 h-[1px] bg-zinc-200" />
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-cream/80 rounded-lg px-2.5 sm:px-3 py-2 flex-1 min-w-0">
                          <FiMapPin size={12} className="text-gold shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Check-out</p>
                            <p className="text-xs sm:text-sm text-charcoal font-medium whitespace-nowrap">{formatDate(b.checkOutDate)}</p>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400">{formatTime(checkOutTime)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="px-4 sm:px-6">
                      <BookingTimeline status={b.status} />
                    </div>

                    {/* Outstanding Balance + Pay Button */}
                    {hasBalance && (
                      <div className="px-4 sm:px-6 pb-5 pt-2">
                        <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FiAlertCircle size={16} className="text-amber-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-amber-800">Balance: {formatCurrency(b.totalAmount)}</p>
                              <p className="text-[11px] text-amber-600">Due before check-in</p>
                            </div>
                          </div>
                          <Link
                            href={`/booking?balanceBookingId=${b.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gold text-charcoal hover:bg-gold/90 transition-colors text-xs font-semibold tracking-wide shrink-0"
                          >
                            <FiCreditCard size={13} />
                            Pay Balance
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Bottom padding when no outstanding balance */}
                    {!hasBalance && <div className="pb-5" />}
                  </div>
                </Link>
              );
            })}

            {/* No-cancellation policy notice */}
            <div className="text-center pt-4">
              <p className="text-xs text-zinc-400">
                All bookings are final. For any queries, please{" "}
                <Link href="/contact" className="text-gold hover:underline">contact us</Link>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

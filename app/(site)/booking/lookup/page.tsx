"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FiSearch, FiCalendar, FiUser, FiCreditCard } from "react-icons/fi";


import { formatCurrency } from "@/lib/utils/currency";
import { TZ } from "@/lib/tz";
import type { BookingDetail } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  checked_in: "bg-blue-100 text-blue-800",
  checked_out: "bg-zinc-100 text-zinc-800",
  cancelled: "bg-red-100 text-red-800",
};

function BookingLookupContent() {
  const defaultRef = useSearchParams().get("ref") || "";
  const [ref, setRef] = useState(defaultRef);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(!!defaultRef);

  const handleSearch = async () => {
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await TZ.storefront.property.lookupBooking(ref) as unknown as BookingDetail;
      setBooking(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking not found");
      setBooking(null);
    }
    setLoading(false);
  };

  // Auto-search if ref from URL
  useEffect(() => { if (defaultRef) handleSearch(); }, []);

  return (
    <div className="pt-32 pb-20 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-6">
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-charcoal">Check Your Booking</h1>
            <p className="mt-2 text-zinc-500">Enter your booking reference to view details</p>
          </div>

          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={ref}
              onChange={(e) => setRef(e.target.value.toUpperCase())}
              placeholder="e.g. VEL-ABC123"
              className="flex-1 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-mono bg-white focus:border-gold-500 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-gold-500 text-white px-6 py-3 rounded-xl hover:bg-gold-600 transition-all disabled:opacity-60"
            >
              <FiSearch size={18} />
            </button>
          </div>

          {loading && <div className="animate-pulse bg-white rounded-3xl h-48" />}

          {error && searched && (
            <div className="bg-white rounded-3xl p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {booking && (
            <div className="bg-white rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider">Booking Reference</p>
                  <p className="text-xl font-mono text-gold-600">{booking.bookingReference}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[booking.status] || "bg-zinc-100 text-zinc-600"}`}>
                  {booking.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 py-3 border-b border-zinc-100">
                  <FiUser size={14} className="text-zinc-400" />
                  <div>
                    <p className="text-zinc-400 text-xs">Guest</p>
                    <p className="text-charcoal">{booking.guestName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-zinc-100">
                  <FiCalendar size={14} className="text-zinc-400" />
                  <div>
                    <p className="text-zinc-400 text-xs">Stay</p>
                    <p className="text-charcoal">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <FiCreditCard size={14} className="text-zinc-400" />
                  <div>
                    <p className="text-zinc-400 text-xs">Total Amount</p>
                    <p className="text-charcoal font-medium">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingLookupPage() {
  return <Suspense><BookingLookupContent /></Suspense>;
}

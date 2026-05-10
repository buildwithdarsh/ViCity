"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiSearch, FiHash, FiPhone } from "react-icons/fi";
import { TZ } from "@/lib/tz";

export default function LookupBookingPage() {
  const router = useRouter();
  const [bookingReference, setBookingReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bookingReference.trim() || !phone.trim()) {
      setError("Please fill in both fields");
      return;
    }

    setLoading(true);

    try {
      const booking = await TZ.storefront.property.lookupBooking(bookingReference.trim().toUpperCase()) as unknown as { id: string };

      // Store lookup credentials in sessionStorage for the detail page
      sessionStorage.setItem(
        "booking_lookup",
        JSON.stringify({
          bookingReference: bookingReference.trim().toUpperCase(),
          phone: phone.trim(),
          bookingId: booking.id,
        })
      );

      router.push(`/account/bookings/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <FiSearch size={20} className="text-gold" />
          </div>
          <h1 className="text-2xl font-serif text-charcoal">Lookup Booking</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Enter your booking reference and phone number to view your booking details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1.5 block">
              Booking Reference
            </label>
            <div className="relative">
              <FiHash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={bookingReference}
                onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                placeholder="e.g. VLR-2025-XXXX"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand/30 bg-white text-charcoal placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm tracking-wider font-mono"
                autoComplete="off"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1.5 block">
              Phone Number
            </label>
            <div className="relative">
              <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone used during booking"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand/30 bg-white text-charcoal placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-all text-sm"
                autoComplete="tel"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-charcoal text-sm tracking-wide uppercase px-6 py-3.5 rounded-xl hover:bg-gold/90 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
            ) : (
              <>
                <FiSearch size={16} />
                Find My Booking
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

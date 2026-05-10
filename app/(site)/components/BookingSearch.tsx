"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiCalendar, FiUsers, FiSearch } from "react-icons/fi";
import DateRangePicker from "./DateRangePicker";
import { TZ } from "@/lib/tz";

export default function BookingSearch({ variant = "hero" }: { variant?: "hero" | "inline" }) {
  const router = useRouter();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split("T")[0]!);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split("T")[0]!);
  const [guests, setGuests] = useState("2");
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [minNights, setMinNights] = useState(1);
  const [maxNights, setMaxNights] = useState(21);
  const [basePriceLabel, setBasePriceLabel] = useState("");

  const fetchBlockedDates = useCallback(async () => {
    try {
      const now = new Date();
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const futureMonth = new Date(now.getFullYear(), now.getMonth() + 6, 0);
      const end = `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, "0")}-${futureMonth.getDate()}`;

      const calData = await TZ.storefront.property.checkAvailability({ propertyTypeId: '', checkIn: start, checkOut: end }) as unknown as Record<string, { dates: { date: string; available: number; isBlocked: boolean }[] }>;
      if (calData) {
        const blocked = new Set<string>();
        for (const entry of Object.values(calData) as { dates: { date: string; available: number; isBlocked: boolean }[] }[]) {
          for (const d of entry.dates) {
            if (d.isBlocked || d.available === 0) {
              blocked.add(d.date);
            }
          }
        }
        setBlockedDates(blocked);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchBlockedDates();
    TZ.storefront.config.get()
      .then((config) => {
        const cfg = config as unknown as Record<string, unknown>;
        const prop = cfg['property'] as Record<string, number> | undefined;
        if (prop?.['min_nights'] != null) setMinNights(prop['min_nights']);
        if (prop?.['max_nights'] != null) setMaxNights(prop['max_nights']);
      })
      .catch(() => {});
    TZ.storefront.property.getTypes()
      .then((types) => {
        if (types.length > 0 && types[0]?.basePrice) {
          const rupees = Math.round(types[0]!.basePrice / 100).toLocaleString("en-IN");
          setBasePriceLabel(`Starting at \u20B9${rupees}/night`);
        }
      })
      .catch(() => {});
  }, [fetchBlockedDates]);

  const handleSearch = () => {
    const params = new URLSearchParams({ checkIn, checkOut, guests });
    router.push(`/booking?${params.toString()}`);
  };

  const formatDisplay = (s: string) => {
    if (!s) return "Select date";
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y!, m! - 1, d!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const openCalendar = () => {
    setCalendarOpen(true);
    fetchBlockedDates();
  };

  const isHero = variant === "hero";

  const fieldClass = isHero
    ? "bg-white/10 text-white border border-white/20 hover:border-white/30"
    : "bg-zinc-50 text-charcoal border border-zinc-200 hover:border-zinc-300";

  const labelClass = `text-xs text-left uppercase tracking-wider mb-1.5 block ${isHero ? "text-white/70" : "text-zinc-500"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={
        isHero
          ? "glass-dark rounded-2xl p-6 md:p-8 max-w-4xl mx-auto border border-white/10"
          : "bg-white rounded-2xl p-6 border border-sand/50 max-w-4xl mx-auto"
      }
    >
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Check-in */}
        <div>
          <label className={labelClass}>
            <FiCalendar className="inline mr-1.5" size={12} />
            Check-in
          </label>
          <button
            type="button"
            onClick={openCalendar}
            className={`w-full rounded-lg px-3 py-2.5 text-sm text-left transition-colors outline-none cursor-pointer ${fieldClass}`}
          >
            {formatDisplay(checkIn)}
          </button>
        </div>

        {/* Check-out */}
        <div>
          <label className={labelClass}>
            <FiCalendar className="inline mr-1.5" size={12} />
            Check-out
          </label>
          <button
            type="button"
            onClick={openCalendar}
            className={`w-full rounded-lg px-3 py-2.5 text-sm text-left transition-colors outline-none cursor-pointer ${fieldClass}`}
          >
            {formatDisplay(checkOut)}
          </button>
        </div>

        {/* Guests */}
        <div>
          <label htmlFor="booking-guests" className={labelClass}>
            <FiUsers className="inline mr-1.5" size={12} />
            Guests
          </label>
          <select
            id="booking-guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className={`w-full rounded-lg px-3 py-2.5 text-sm transition-colors outline-none ${fieldClass}`}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n} className="text-charcoal">
                {n} {n === 1 ? "Guest" : "Guests"}
              </option>
            ))}
            {[7, 8, 9, 10].map((n) => (
              <option key={n} value={n} className="text-charcoal">
                {n} Guests (extra charges apply)
              </option>
            ))}
          </select>
        </div>

        {/* Book Now */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="w-full bg-gold hover:bg-gold/90 text-charcoal px-6 py-3 md:py-2.5 rounded-lg text-sm uppercase tracking-wider font-medium transition-all duration-300 hover:shadow-lg hover:shadow-gold/25 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FiSearch size={16} />
            Book Now
          </button>
        </div>

        {/* Calendar Dropdown — headless DateRangePicker */}
        <div className="md:absolute md:bottom-full md:left-0 md:mb-2 z-50">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            blockedDates={blockedDates}
            onOpen={fetchBlockedDates}
            headless
            isOpen={calendarOpen}
            onClose={() => setCalendarOpen(false)}
            dropDirection="up"
            minNights={minNights}
            maxNights={maxNights}
          />
        </div>
      </div>
      {basePriceLabel && (
        <p className={`text-xs mt-4 text-center ${isHero ? "text-white/60" : "text-zinc-400"}`}>
          {basePriceLabel}
        </p>
      )}
    </motion.div>
  );
}

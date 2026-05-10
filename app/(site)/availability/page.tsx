"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { TZ } from "@/lib/tz";

interface DayData {
  date: string;
  available: number;
  total: number;
  isBlocked: boolean;
}

interface RoomTypeCalendar {
  roomType: { id: string; name: string };
  dates: DayData[];
}

interface NightPrice {
  date: string;
  price: number;
  ruleType: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Format paisa to short display: 1250000 → "₹12,500" */
function shortPrice(paisa: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paisa / 100);
}

export default function AvailabilityPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [calendar, setCalendar] = useState<RoomTypeCalendar[]>([]);
  const [prices, setPrices] = useState<Map<string, NightPrice>>(new Map());
  const [loading, setLoading] = useState(true);

  const todayStr = toDateStr(now);

  const fetchData = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const startDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const endMonth = m === 11 ? 0 : m + 1;
    const endYear = m === 11 ? y + 1 : y;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, "0")}-01`;

    try {
      const [availData, priceData] = await Promise.all([
        TZ.storefront.property.checkAvailability({ propertyTypeId: '', checkIn: startDate, checkOut: endDate }) as unknown as Record<string, unknown>,
        TZ.storefront.property.resolvePrice({ propertyTypeId: '', checkIn: startDate, checkOut: endDate }) as unknown as Record<string, unknown>,
      ]);

      if (availData) {
        setCalendar(Object.values(availData) as RoomTypeCalendar[]);
      }

      const nights = (priceData as unknown as { nights?: NightPrice[] }).nights;
      if (nights) {
        const map = new Map<string, NightPrice>();
        for (const n of nights) {
          map.set(n.date, n);
        }
        setPrices(map);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(year, month);
  }, [year, month, fetchData]);

  const goToPrev = () => {
    const nowMonth = now.getMonth();
    const nowYear = now.getFullYear();
    if (year === nowYear && month === nowMonth) return;
    if (month === 0) { setYear(year - 1); setMonth(11); } else { setMonth(month - 1); }
  };

  const goToNext = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); } else { setMonth(month + 1); }
  };

  const isPrevDisabled = year === now.getFullYear() && month === now.getMonth();

  // Build availability lookup
  const availabilityMap = new Map<string, DayData>();
  if (calendar.length > 0) {
    for (const day of calendar[0]!.dates) {
      availabilityMap.set(day.date.split("T")[0]!, day);
    }
  }

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const handleDayClick = (dateStr: string) => {
    router.push(`/booking?checkIn=${dateStr}`);
  };

  // Find base price to detect special pricing
  const allPrices = Array.from(prices.values());
  const basePriceEntry = allPrices.find((p) => p.ruleType === "base");
  const basePrice = basePriceEntry?.price;

  return (
    <div className="min-h-screen bg-cream pt-28 pb-16 px-5">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-serif text-charcoal">Check Availability</h1>
          <p className="text-sm text-zinc-500 mt-2">
            Tap on an available date to start your booking.
          </p>
        </motion.div>

        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={goToPrev}
            disabled={isPrevDisabled}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed text-charcoal hover:bg-charcoal/5"
          >
            <FiChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-serif text-charcoal tracking-wide">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal hover:bg-charcoal/5 transition-all"
          >
            <FiChevronRight size={20} />
          </button>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-2xl border border-sand/20 overflow-hidden"
        >
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-sand/15">
            {DAY_LABELS.map((d) => (
              <div key={d} className="py-3 text-center text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1;
              const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;

              if (!isValidDay) {
                return <div key={i} className="aspect-square" />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
              const isPast = dateStr < todayStr;
              const isToday = dateStr === todayStr;
              const dayData = availabilityMap.get(dateStr);
              const isBlocked = dayData?.isBlocked ?? false;
              const availableUnits = dayData?.available ?? 0;
              const isAvailable = !isPast && !isToday && !isBlocked && availableUnits > 0;
              const isUnavailable = !isPast && !isToday && (isBlocked || availableUnits === 0);

              const nightPrice = prices.get(dateStr);
              const hasSpecialPrice = nightPrice && basePrice && nightPrice.price !== basePrice;
              const isHigher = hasSpecialPrice && nightPrice.price > basePrice;

              return (
                <button
                  key={i}
                  disabled={!isAvailable || loading}
                  onClick={() => isAvailable && handleDayClick(dateStr)}
                  className={`aspect-[1/1.15] flex flex-col items-center justify-center gap-0 border-b border-r border-sand/8 transition-all relative px-0.5 ${
                    isAvailable
                      ? "hover:bg-gold/8 cursor-pointer group"
                      : "cursor-default"
                  } ${isPast || isToday ? "opacity-30" : ""}`}
                >
                  <span
                    className={`text-sm font-medium leading-none ${
                      isAvailable
                        ? "text-charcoal group-hover:text-gold"
                        : isUnavailable
                        ? "text-zinc-300"
                        : "text-zinc-400"
                    } ${isToday ? "underline underline-offset-2" : ""}`}
                  >
                    {dayNum}
                  </span>

                  {/* Price */}
                  {!loading && !isPast && !isToday && nightPrice && (
                    <span
                      className={`text-[8px] leading-tight mt-0.5 font-medium ${
                        isUnavailable
                          ? "text-zinc-300 line-through"
                          : isHigher
                          ? "text-amber-600"
                          : hasSpecialPrice
                          ? "text-emerald-600"
                          : "text-zinc-400"
                      }`}
                    >
                      {shortPrice(nightPrice.price)}
                    </span>
                  )}

                  {/* Loading placeholder */}
                  {loading && !isPast && !isToday && (
                    <span className="w-6 h-2 rounded bg-zinc-100 animate-pulse mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-5 text-[11px] text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-400" />
            Base price
          </span>
          {allPrices.some((p) => p.ruleType !== "base" && basePrice && p.price > basePrice) && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              Peak / weekend
            </span>
          )}
          {allPrices.some((p) => p.ruleType !== "base" && basePrice && p.price < basePrice) && (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              Discounted
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-200" />
            Unavailable
          </span>
        </motion.div>

        {/* Room type summary */}
        {!loading && calendar.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 bg-white rounded-xl border border-sand/20 p-4 space-y-3"
          >
            {calendar.map((rt) => {
              const futureDates = rt.dates.filter(
                (d) => !d.isBlocked && d.available > 0 && d.date.split("T")[0]! >= todayStr
              );
              const futurePrices = futureDates
                .map((d) => prices.get(d.date.split("T")[0]!))
                .filter(Boolean) as NightPrice[];
              const minPrice = futurePrices.length > 0
                ? Math.min(...futurePrices.map((p) => p.price))
                : null;

              return (
                <div key={rt.roomType.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal font-medium">{rt.roomType.name}</span>
                    <span className="text-xs text-zinc-500">
                      {futureDates.length} {futureDates.length === 1 ? "day" : "days"} available
                    </span>
                  </div>
                  {minPrice != null && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Starting from <span className="text-gold font-medium">{shortPrice(minPrice)}</span> / night
                    </p>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX } from "react-icons/fi";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  blockedDates?: Set<string>;
  minDate?: Date;
  onOpen?: () => void;
  variant?: "default" | "hero";
  /** When true, only render the calendar dropdown (no trigger). Controlled externally. */
  headless?: boolean;
  /** External open state for headless mode */
  isOpen?: boolean;
  /** Called when the calendar wants to close (date selected or outside click) */
  onClose?: () => void;
  /** Direction the desktop dropdown opens. Default "down". */
  dropDirection?: "up" | "down";
  /** Minimum nights required for a booking. Dates too close to check-in are blocked when selecting check-out. */
  minNights?: number;
  /** Maximum nights allowed for a booking. Dates beyond this range are blocked when selecting check-out. */
  maxNights?: number;
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

function formatDisplay(s: string) {
  if (!s) return "Select";
  const d = parseDate(s);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  blockedDates = new Set(),
  minDate,
  onOpen,
  variant = "default",
  headless = false,
  isOpen: externalOpen,
  onClose,
  dropDirection = "down",
  minNights,
  maxNights,
}: DateRangePickerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = headless ? (externalOpen ?? false) : internalOpen;
  const setOpen = (v: boolean) => {
    if (headless) {
      if (!v) onClose?.();
    } else {
      setInternalOpen(v);
    }
  };
  const [selectingCheckOut, setSelectingCheckOut] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate || new Date(today.getTime() + 86400000);

  const [viewMonth, setViewMonth] = useState(() => {
    if (checkIn) {
      const d = parseDate(checkIn);
      return { year: d.getFullYear(), month: d.getMonth() };
    }
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleDateClick = useCallback((dateStr: string) => {
    if (!selectingCheckOut) {
      // Selecting check-in — blocked dates cannot be check-in
      if (blockedDates.has(dateStr)) return;
      onCheckInChange(dateStr);
      onCheckOutChange("");
      setSelectingCheckOut(true);
    } else {
      // Selecting check-out
      if (dateStr <= checkIn) {
        // Clicked before/on check-in — restart selection
        if (blockedDates.has(dateStr)) return; // can't use blocked as new check-in
        onCheckInChange(dateStr);
        onCheckOutChange("");
      } else {
        // Check if any night between check-in and check-out is blocked
        // (checkout date itself is fine — guest departs that morning)
        const start = parseDate(checkIn);
        const end = parseDate(dateStr);
        let hasBlockedBetween = false;
        const cursor = new Date(start);
        while (cursor < end) {
          if (blockedDates.has(toDateStr(cursor))) {
            hasBlockedBetween = true;
            break;
          }
          cursor.setDate(cursor.getDate() + 1);
        }
        if (hasBlockedBetween) {
          // Can't span across blocked nights — restart with this date as check-in
          if (blockedDates.has(dateStr)) return; // can't use blocked as new check-in
          onCheckInChange(dateStr);
          onCheckOutChange("");
        } else {
          // Valid checkout (even if checkout date is blocked — you just depart that day)
          onCheckOutChange(dateStr);
          setSelectingCheckOut(false);
          setTimeout(() => setOpen(false), 500);
        }
      }
    }
  }, [selectingCheckOut, checkIn, blockedDates, onCheckInChange, onCheckOutChange]);

  const nextMonth = { year: viewMonth.month === 11 ? viewMonth.year + 1 : viewMonth.year, month: (viewMonth.month + 1) % 12 };

  function renderMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    return (
      <div className="w-full md:w-[280px]">
        <div className="text-center text-sm font-semibold text-charcoal mb-2">{monthName}</div>
        <div className="grid grid-cols-7 text-center text-[10px] text-warm-brown/40 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} className="h-9" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const d = new Date(year, month, day);
            const isPast = d < min;
            const isBlocked = blockedDates.has(dateStr);
            const isCheckIn = dateStr === checkIn;
            const isCheckOut = dateStr === checkOut;
            // Blocked dates can be selected as checkout (guest departs that morning)
            const isCheckoutEligible = isBlocked && selectingCheckOut && !!checkIn && dateStr > checkIn;
            // Below min nights when selecting check-out
            const nightsFromCheckIn = selectingCheckOut && !!checkIn
              ? Math.ceil((d.getTime() - parseDate(checkIn).getTime()) / 86400000)
              : 0;
            const isBelowMin = selectingCheckOut && !!checkIn && minNights
              ? nightsFromCheckIn > 0 && nightsFromCheckIn < minNights
              : false;
            // Beyond max nights range when selecting check-out
            const isBeyondMax = selectingCheckOut && !!checkIn && maxNights
              ? nightsFromCheckIn > maxNights
              : false;
            const isDisabled = isPast || isBelowMin || isBeyondMax || (isBlocked && !isCheckoutEligible);

            // Range highlighting
            let inRange = false;
            if (checkIn && (checkOut || hoveredDate)) {
              const endStr = checkOut || hoveredDate!;
              if (endStr > checkIn) {
                inRange = dateStr > checkIn && dateStr < endStr;
              }
            }

            const hasRange = !!(checkIn && checkOut && checkOut > checkIn);
            const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
            const isRowStart = dayOfWeek === 0;
            const isRowEnd = dayOfWeek === 6;
            const isFirstOfMonth = day === 1;
            const isLastOfMonth = day === daysInMonth;

            let className = "h-9 w-full text-xs relative flex items-center justify-center transition-colors ";
            if (isCheckIn && hasRange) {
              className += "bg-gold text-charcoal font-semibold rounded-l-full z-10 ";
            } else if (isCheckOut && hasRange) {
              className += "bg-gold text-charcoal font-semibold rounded-r-full z-10 ";
            } else if (isCheckIn || isCheckOut) {
              className += "bg-gold text-charcoal font-semibold rounded-full z-10 ";
            } else if (inRange && !isBlocked) {
              let rangeRounding = "";
              if (isRowStart || isFirstOfMonth) rangeRounding += "rounded-l-full ";
              if (isRowEnd || isLastOfMonth) rangeRounding += "rounded-r-full ";
              className += `bg-gold/10 text-charcoal ${rangeRounding}`;
            } else if (isCheckoutEligible) {
              className += "text-warm-brown/30 hover:bg-gold/10 cursor-pointer ";
            } else if (isBelowMin || isBeyondMax) {
              className += "text-warm-brown/15 cursor-not-allowed ";
            } else if (isBlocked) {
              className += "text-warm-brown/20 cursor-not-allowed ";
            } else if (isPast) {
              className += "text-warm-brown/15 cursor-not-allowed ";
            } else {
              className += "text-charcoal hover:bg-gold/10 cursor-pointer ";
            }

            return (
              <button
                key={dateStr}
                disabled={isDisabled}
                onClick={() => handleDateClick(dateStr)}
                onMouseEnter={() => selectingCheckOut && !isDisabled && setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                className={className}
              >
                <span className={isBlocked && !isCheckIn && !isCheckOut ? "line-through decoration-warm-brown/30 decoration-[1.5px]" : ""}>
                  {day}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut
    ? Math.ceil((parseDate(checkOut).getTime() - parseDate(checkIn).getTime()) / 86400000)
    : 0;

  return (
    <div className="relative" ref={ref}>
      {/* Trigger — hidden in headless mode */}
      {!headless && (
        <div
          onClick={() => {
            const willOpen = !open;
            setOpen(willOpen);
            if (willOpen) {
              setSelectingCheckOut(!!checkIn && !checkOut);
              onOpen?.();
            }
          }}
          className={`relative rounded-lg cursor-pointer transition-colors ${
            variant === "hero"
              ? "border border-white/20 bg-white/10 hover:border-white/30"
              : "border border-sand/40 bg-cream/30 hover:border-gold/50"
          }`}
        >
          {/* Desktop: side by side */}
          <div className="hidden sm:flex items-stretch">
            <div className="flex-1 px-3 py-2.5">
              <div className={`text-[10px] uppercase tracking-wider ${variant === "hero" ? "text-white/50" : "text-charcoal/50"}`}>Check-in</div>
              <div className={`text-sm font-medium flex items-center gap-1.5 ${variant === "hero" ? "text-white" : "text-charcoal"}`}>
                <FiCalendar size={12} className="text-gold" />
                {formatDisplay(checkIn)}
              </div>
            </div>
            <div className={`w-px ${variant === "hero" ? "bg-white/15" : "bg-sand/30"}`} />
            <div className="flex-1 px-3 py-2.5">
              <div className={`text-[10px] uppercase tracking-wider ${variant === "hero" ? "text-white/50" : "text-charcoal/50"}`}>Check-out</div>
              <div className={`text-sm font-medium flex items-center gap-1.5 ${variant === "hero" ? "text-white" : "text-charcoal"}`}>
                <FiCalendar size={12} className="text-gold" />
                {formatDisplay(checkOut)}
                {nights > 0 && (
                  <span className="ml-auto bg-gold/15 text-gold text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {nights} night{nights > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Mobile: stacked with arrow */}
          <div className="sm:hidden flex flex-col">
            <div className="px-3 py-2.5">
              <div className={`text-[10px] uppercase tracking-wider ${variant === "hero" ? "text-white/50" : "text-charcoal/50"}`}>Check-in</div>
              <div className={`text-sm font-medium flex items-center gap-1.5 ${variant === "hero" ? "text-white" : "text-charcoal"}`}>
                <FiCalendar size={12} className="text-gold" />
                {formatDisplay(checkIn)}
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 ${variant === "hero" ? "border-white/15" : "border-sand/30"}`}>
              <div className={`flex-1 h-px ${variant === "hero" ? "bg-white/15" : "bg-sand/30"}`} />
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={variant === "hero" ? "text-white/40" : "text-warm-brown/30"}>
                <path d="M8 3v10m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className={`flex-1 h-px ${variant === "hero" ? "bg-white/15" : "bg-sand/30"}`} />
            </div>
            <div className="px-3 py-2.5">
              <div className={`text-[10px] uppercase tracking-wider ${variant === "hero" ? "text-white/50" : "text-charcoal/50"}`}>Check-out</div>
              <div className={`text-sm font-medium flex items-center gap-1.5 ${variant === "hero" ? "text-white" : "text-charcoal"}`}>
                <FiCalendar size={12} className="text-gold" />
                {formatDisplay(checkOut)}
                {nights > 0 && (
                  <span className="ml-auto bg-gold/15 text-gold text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {nights} night{nights > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown — desktop: opens upward, mobile: full-screen modal */}
      {open && (
        <>
          {/* Mobile: full-screen modal */}
          <div className="md:hidden fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="md:hidden fixed inset-x-4 bottom-4 z-[100] bg-white rounded-2xl shadow-2xl p-5 pb-6 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-charcoal">
                {selectingCheckOut ? "Select check-out date" : "Select check-in date"}
              </span>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-cream rounded-lg transition-colors">
                <FiX size={18} className="text-charcoal" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="p-1.5 hover:bg-cream rounded transition-colors">
                <FiChevronLeft size={18} className="text-charcoal" />
              </button>
              <button onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="p-1.5 hover:bg-cream rounded transition-colors">
                <FiChevronRight size={18} className="text-charcoal" />
              </button>
            </div>
            <div className="flex flex-col gap-6">
              {renderMonth(viewMonth.year, viewMonth.month)}
              {renderMonth(nextMonth.year, nextMonth.month)}
            </div>
            {/* Selected summary */}
            {checkIn && (
              <div className="mt-4 pt-3 border-t border-sand/20 text-sm text-charcoal">
                <span className="font-medium">{formatDisplay(checkIn)}</span>
                {checkOut && <span> &mdash; <span className="font-medium">{formatDisplay(checkOut)}</span> ({nights} night{nights > 1 ? "s" : ""})</span>}
              </div>
            )}
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-warm-brown/40">
              <span className="flex items-center gap-1"><span className="text-warm-brown/20 line-through decoration-warm-brown/30 decoration-[1.5px]">00</span> Not Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gold" /> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gold/10" /> Range</span>
            </div>
          </div>

          {/* Desktop: opens upward */}
          <div className={`hidden md:block ${headless ? "" : `absolute left-0 z-50 ${dropDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"}`} bg-white rounded-xl border border-sand/30 shadow-lg p-4`}>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setViewMonth((v) => v.month === 0 ? { year: v.year - 1, month: 11 } : { ...v, month: v.month - 1 })} className="p-1 hover:bg-cream rounded transition-colors">
                <FiChevronLeft size={16} className="text-charcoal" />
              </button>
              <span className="text-xs text-warm-brown/50">
                {selectingCheckOut ? "Select check-out date" : "Select check-in date"}
              </span>
              <button onClick={() => setViewMonth((v) => v.month === 11 ? { year: v.year + 1, month: 0 } : { ...v, month: v.month + 1 })} className="p-1 hover:bg-cream rounded transition-colors">
                <FiChevronRight size={16} className="text-charcoal" />
              </button>
            </div>
            <div className="flex gap-6">
              {renderMonth(viewMonth.year, viewMonth.month)}
              {renderMonth(nextMonth.year, nextMonth.month)}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-sand/20 text-[10px] text-warm-brown/40">
              <span className="flex items-center gap-1"><span className="text-warm-brown/20 line-through decoration-warm-brown/30 decoration-[1.5px]">00</span> Not Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gold" /> Selected</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gold/10" /> Range</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { get, patch } from "@/lib/admin/api";
import PageHeader from "../components/PageHeader";
import { useToast } from "../components/Toast";
import { SkeletonForm } from "../components/Skeleton";

/** UI-only calendar day shape — SDK PropertyAvailability has price instead of isBlocked, and
 *  admin.property.calendar returns unknown[]. Keep as UI-specific type. */
interface CalendarDay {
  date: string;
  available: number;
  total: number;
  isBlocked: boolean;
}

/** UI-only calendar entry grouping days by room type — not represented in SDK.
 *  Keep as UI-specific type. */
interface CalendarEntry {
  roomType: { id: string; name: string };
  dates: CalendarDay[];
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const [year, m] = month.split("-").map(Number);
      const startDate = `${year}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(year!, m!, 0).getDate();
      const endDate = `${year}-${String(m).padStart(2, "0")}-${lastDay}`;

      const res = await get<{ data: CalendarEntry[] }>(
        `/availability/calendar?startDate=${startDate}&endDate=${endDate}`
      );
      setCalendar(res.data);

      // Auto-select first room type (the villa)
      const rts = res.data.map((e) => e.roomType);
      if (rts.length > 0 && !selectedRoomType) {
        setSelectedRoomType(rts[0]!.id);
      }
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to load calendar", "error");
    }
    setLoading(false);
  }, [month, toast, selectedRoomType]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const currentEntry = calendar.find((e) => e.roomType.id === selectedRoomType);

  const handleDateClick = (date: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const handleBlockDates = async (block: boolean) => {
    if (selectedDates.size === 0 || !selectedRoomType) return;
    setSaving(true);
    try {
      const sortedDates = Array.from(selectedDates).sort();
      const startDate = sortedDates[0]!;
      const endDate = sortedDates[sortedDates.length - 1]!;

      // We need to add 1 day to endDate since the API uses exclusive end
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);

      await patch("/availability/block", {
        roomTypeId: selectedRoomType,
        startDate,
        endDate: end.toISOString().split("T")[0],
        isBlocked: block,
      });
      toast(block ? "Dates blocked" : "Dates unblocked");
      setSelectedDates(new Set());
      await fetchCalendar();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to update", "error");
    }
    setSaving(false);
  };

  // Build calendar grid
  const [year, m] = month.split("-").map(Number);
  const firstDayOfMonth = new Date(year!, m! - 1, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year!, m!, 0).getDate();
  const today = new Date().toISOString().split("T")[0]!;

  // Map date strings to CalendarDay for quick lookup
  const dateMap = new Map<string, CalendarDay>();
  if (currentEntry) {
    for (const d of currentEntry.dates) {
      dateMap.set(d.date, d);
    }
  }

  return (
    <div>
      <PageHeader
        title="Availability Calendar"
        description="View and manage villa availability. Block or unblock dates."
      />

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1">Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => { setMonth(e.target.value); setSelectedDates(new Set()); }}
            className="px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
        {selectedDates.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBlockDates(true)}
              disabled={saving}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Block {selectedDates.size} date{selectedDates.size > 1 ? "s" : ""}
            </button>
            <button
              onClick={() => handleBlockDates(false)}
              disabled={saving}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              Unblock {selectedDates.size} date{selectedDates.size > 1 ? "s" : ""}
            </button>
            <button
              onClick={() => setSelectedDates(new Set())}
              className="px-4 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Blocked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Fully Booked</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300" /> Selected</span>
      </div>

      {loading ? (
        <SkeletonForm />
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-zinc-400 border-b border-zinc-100">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-zinc-50 h-20" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const info = dateMap.get(dateStr);
              const isBlocked = info?.isBlocked ?? false;
              const isFullyBooked = info ? info.available === 0 && !isBlocked : false;
              const isAvailable = info ? info.available > 0 && !isBlocked : true;
              const isPast = dateStr < today;
              const isSelected = selectedDates.has(dateStr);

              let bgClass = "bg-white";
              if (isSelected) bgClass = "bg-blue-50 ring-2 ring-blue-400 ring-inset";
              else if (isBlocked) bgClass = "bg-red-50";
              else if (isFullyBooked) bgClass = "bg-amber-50";
              else if (isAvailable && info) bgClass = "bg-green-50/50";

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && handleDateClick(dateStr)}
                  disabled={isPast}
                  className={`relative border-b border-r border-zinc-100 h-20 p-1.5 text-left transition-colors hover:bg-zinc-50 ${bgClass} ${isPast ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span className={`text-xs font-medium ${dateStr === today ? "text-blue-600" : "text-zinc-700"}`}>
                    {day}
                  </span>
                  {info && (
                    <div className="mt-1">
                      {isBlocked ? (
                        <span className="text-[10px] font-medium text-red-600 uppercase">Blocked</span>
                      ) : isFullyBooked ? (
                        <span className="text-[10px] font-medium text-amber-600 uppercase">Booked</span>
                      ) : (
                        <span className="text-[10px] text-zinc-400">{info.available}/{info.total} avail</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

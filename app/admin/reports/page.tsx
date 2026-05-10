"use client";

import { useState } from "react";
import { useApi } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import { Select, Input } from "../components/FormField";
import FormField from "../components/FormField";
import { SkeletonChart } from "../components/Skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  FiBook, FiCheckCircle, FiClock, FiLogIn, FiLogOut, FiXCircle,
  FiDollarSign, FiCreditCard, FiHash,
  FiHome, FiPercent,
  FiSlash, FiRotateCcw,
} from "react-icons/fi";
import { IconType } from "react-icons";

type ReportType = "bookings" | "revenue" | "occupancy" | "cancellations";

interface ReportData {
  summary: Record<string, number>;
  chart: Array<{ label: string; value: number }>;
  rows: Array<Record<string, string | number>>;
}

interface RawReportPayload {
  totalBookings?: number;
  statusBreakdown?: Record<string, number>;
  bookings?: Record<string, string | number>[];
  totalRevenue?: number;
  totalTransactions?: number;
  methodBreakdown?: Record<string, number>;
  dailyRevenue?: Array<{ date: string; amount: number }>;
  payments?: Record<string, string | number>[];
  roomTypes?: Array<{ roomType: string; occupancyRate: number; [k: string]: string | number }>;
  totalCancellations?: number;
  totalRefunds?: number;
  reasonBreakdown?: Record<string, number>;
  cancellations?: Record<string, string | number>[];
}

function transformReport(type: ReportType, raw: RawReportPayload): ReportData {
  switch (type) {
    case "bookings": {
      const summary: Record<string, number> = { totalBookings: raw.totalBookings ?? 0 };
      if (raw.statusBreakdown) Object.assign(summary, raw.statusBreakdown);
      const chart = raw.statusBreakdown
        ? Object.entries(raw.statusBreakdown).map(([label, value]) => ({ label, value: value as number }))
        : [];
      return { summary, chart, rows: raw.bookings ?? [] };
    }
    case "revenue": {
      const summary: Record<string, number> = {
        totalRevenue: raw.totalRevenue ?? 0,
        totalTransactions: raw.totalTransactions ?? 0,
      };
      if (raw.methodBreakdown) Object.assign(summary, raw.methodBreakdown);
      const chart = raw.dailyRevenue
        ? raw.dailyRevenue.map((d: { date: string; amount: number }) => ({ label: d.date, value: d.amount }))
        : [];
      return { summary, chart, rows: raw.payments ?? [] };
    }
    case "occupancy": {
      const roomTypes = raw.roomTypes ?? [];
      const avgOccupancy = roomTypes.length
        ? Math.round(roomTypes.reduce((s: number, r: { occupancyRate: number }) => s + r.occupancyRate, 0) / roomTypes.length)
        : 0;
      const summary: Record<string, number> = {
        averageOccupancy: avgOccupancy,
        villaTypes: roomTypes.length,
      };
      const chart = roomTypes.map((r: { roomType: string; occupancyRate: number }) => ({ label: r.roomType, value: r.occupancyRate }));
      return { summary, chart, rows: roomTypes };
    }
    case "cancellations": {
      const summary: Record<string, number> = {
        totalCancellations: raw.totalCancellations ?? 0,
        totalRefunds: raw.totalRefunds ?? 0,
      };
      const chart = raw.reasonBreakdown
        ? Object.entries(raw.reasonBreakdown).map(([label, value]) => ({ label, value: value as number }))
        : [];
      return { summary, chart, rows: raw.cancellations ?? [] };
    }
  }
}

function formatLabel(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

import { formatCurrency } from "@/lib/utils/currency";
// API_BASE_URL, ORG_SLUG, getToken no longer needed in mock mode

const summaryIcons: Record<string, IconType> = {
  totalBookings: FiBook,
  checked_in: FiLogIn,
  confirmed: FiCheckCircle,
  pending: FiClock,
  checked_out: FiLogOut,
  cancelled: FiXCircle,
  totalRevenue: FiDollarSign,
  totalTransactions: FiCreditCard,
  averageOccupancy: FiPercent,
  villaTypes: FiHome,
  totalCancellations: FiSlash,
  totalRefunds: FiRotateCcw,
};
const DefaultIcon = FiHash;

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("bookings");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const params = startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : "";
  // TODO: BE has no reports endpoint yet — `/admin/reports/${reportType}` needs to be implemented
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: raw, loading } = useApi<any>(params ? `/admin/reports/${reportType}${params}` : null);
  const data = raw ? transformReport(reportType, raw) : null;

  const handleExport = async (format: string) => {
    // TODO: BE has no reports export endpoint yet — `/admin/reports/${reportType}?format=...` needs to be implemented
    // File downloads need the raw Response (blob), so we use fetch directly
    // with API_BASE_URL (which already includes /api/v1).
    // Mock mode: generate a simple CSV/text blob from the current report data
    const rows = data?.rows ?? [];
    const csvContent = rows.length > 0
      ? [Object.keys(rows[0] ?? {}).join(","), ...rows.map((r) => Object.values(r).join(","))].join("\n")
      : "No data";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report.${format === "excel" ? "xlsx" : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Reports" description="Generate and download business reports" />

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <FormField label="Report Type">
            <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              <option value="bookings">Booking Report</option>
              <option value="revenue">Revenue Report</option>
              <option value="occupancy">Occupancy Report</option>
              <option value="cancellations">Cancellation Report</option>
            </Select>
          </FormField>
          <FormField label="Start Date">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </FormField>
          <FormField label="End Date">
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </FormField>
        </div>
        {startDate && endDate && (
          <div className="flex gap-2">
            <button onClick={() => handleExport("csv")} className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Export CSV</button>
            <button onClick={() => handleExport("excel")} className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Export Excel</button>
            <button onClick={() => handleExport("pdf")} className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Export PDF</button>
          </div>
        )}
      </div>

      {loading ? <SkeletonChart /> : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          {data.summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.summary).map(([key, value]) => {
                const Icon = summaryIcons[key] ?? DefaultIcon;
                return (
                  <div key={key} className="border border-zinc-200 rounded bg-white flex items-stretch overflow-hidden">
                    <div className="flex items-center justify-center px-4 bg-zinc-100 text-zinc-600">
                      <Icon size={20} />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-zinc-500">{formatLabel(key)}</p>
                      <p className="text-xl font-semibold text-zinc-900 mt-1">
                        {key.toLowerCase().includes("revenue") || key.toLowerCase().includes("amount") || key.toLowerCase().includes("refund")
                          ? formatCurrency(value)
                          : value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chart */}
          {data.chart && data.chart.length > 0 && (
            <div className="border border-zinc-200 rounded bg-white p-5">
              <h2 className="text-sm font-medium text-zinc-700 mb-4 capitalize">{reportType} Overview</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={formatLabel} />
                  <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v: number) => { if (reportType !== "revenue" && reportType !== "cancellations") return String(v); const rupees = v / 100; return rupees >= 100000 ? `₹${(rupees / 100000).toFixed(1)}L` : rupees >= 1000 ? `₹${(rupees / 1000).toFixed(0)}k` : `₹${rupees}`; }} />
                  <Tooltip formatter={(v) => (reportType === "revenue" || reportType === "cancellations") ? formatCurrency(v as number) : v} />
                  <Bar dataKey="value" fill="#18181b" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Data Table */}
          {data.rows && data.rows.length > 0 && (
            <div className="border border-zinc-200 rounded bg-white overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200">
                    {Object.keys(data.rows[0]!).map((key) => (
                      <th key={key} className="px-4 py-3 text-left font-medium text-zinc-600 whitespace-nowrap">
                        {formatLabel(key)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i} className="border-t border-zinc-100 hover:bg-zinc-50">
                      {Object.entries(row).map(([key, val], j) => (
                        <td key={j} className="px-4 py-3 whitespace-nowrap">
                          {val == null ? "—" : (key.toLowerCase().includes("amount") || key.toLowerCase().includes("revenue") || key.toLowerCase().includes("refund")) && typeof val === "number"
                            ? formatCurrency(val)
                            : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="border border-zinc-200 rounded bg-white p-12 text-center">
          <p className="text-zinc-400">Select a date range to generate a report</p>
        </div>
      )}
    </div>
  );
}

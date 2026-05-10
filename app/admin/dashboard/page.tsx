"use client";

import { useApi } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import StatsCard from "../components/StatsCard";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";
import Badge from "../components/Badge";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface Overview {
  totalBookingsToday: number;
  totalBookingsMonth: number;
  revenueToday: number;
  revenueMonth: number;
  occupancyRate: number;
  averageBookingValue: number;
  pendingCheckIns: number;
  pendingCheckOuts: number;
  recentBookings: Array<{
    id: string;
    reference: string;
    guestName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    status: string;
  }>;
}

interface ChartPoint {
  label: string;
  value: number;
}

interface RoomTypeBreakdown {
  id: string;
  name: string;
  roomCount: number;
  bookingCount: number;
  basePrice: number;
}

const PIE_COLORS = ["#18181b", "#3f3f46", "#71717a", "#a1a1aa", "#d4d4d8"];

import { formatCurrency } from "@/lib/utils/currency";

export default function DashboardPage() {
  const { data: overview, loading: loadingOverview } = useApi<Overview>("/admin/stats");
  // TODO: BE has no bookings-chart endpoint yet — needs `/admin/stats/bookings-chart` or similar
  const { data: bookingsChart, loading: loadingBookings } = useApi<ChartPoint[]>("/admin/stats/bookings-chart?period=daily");
  // TODO: BE has no revenue-chart endpoint yet — needs `/admin/stats/revenue-chart` or similar
  const { data: revenueChart, loading: loadingRevenue } = useApi<ChartPoint[]>("/admin/stats/revenue-chart?period=monthly");
  // TODO: BE has no occupancy-chart endpoint yet — needs `/admin/stats/occupancy-chart` or similar
  const { data: occupancyChart, loading: loadingOccupancy } = useApi<ChartPoint[]>("/admin/stats/occupancy-chart");
  // TODO: BE has no room-type-breakdown endpoint yet — needs `/admin/stats/room-type-breakdown` or similar
  const { data: roomBreakdown, loading: loadingBreakdown } = useApi<RoomTypeBreakdown[]>("/admin/stats/room-type-breakdown");

  return (
    <div>
      <PageHeader title="Dashboard" description="Villa performance overview" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {loadingOverview ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : overview ? (
          <>
            <StatsCard label="Bookings Today" value={overview.totalBookingsToday} subtitle={`${overview.totalBookingsMonth} this month`} />
            <StatsCard label="Revenue Today" value={formatCurrency(overview.revenueToday)} subtitle={`${formatCurrency(overview.revenueMonth)} this month`} />
            <StatsCard label="Occupancy Rate" value={`${overview.occupancyRate}%`} />
            <StatsCard label="Avg Booking Value" value={formatCurrency(overview.averageBookingValue)} />
            <StatsCard label="Pending Check-ins" value={overview.pendingCheckIns} />
            <StatsCard label="Pending Check-outs" value={overview.pendingCheckOuts} />
          </>
        ) : null}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {loadingBookings ? <SkeletonChart /> : (
          <div className="border border-zinc-200 rounded p-5 bg-white">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Daily Bookings (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bookingsChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <Tooltip />
                <Bar dataKey="value" fill="#18181b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {loadingRevenue ? <SkeletonChart /> : (
          <div className="border border-zinc-200 rounded p-5 bg-white">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Monthly Revenue (Last 12 Months)</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v: number) => { const rupees = v / 100; return rupees >= 100000 ? `₹${(rupees / 100000).toFixed(1)}L` : rupees >= 1000 ? `₹${(rupees / 1000).toFixed(0)}k` : `₹${rupees}`; }} />
                <Tooltip formatter={(v) => formatCurrency(v as number)} />
                <Bar dataKey="value" fill="#18181b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {loadingOccupancy ? <SkeletonChart /> : (
          <div className="border border-zinc-200 rounded p-5 bg-white">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Villa Occupancy</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={occupancyChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
                <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#18181b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {loadingBreakdown ? <SkeletonChart /> : (
          <div className="border border-zinc-200 rounded p-5 bg-white">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Booking Breakdown</h2>
            {roomBreakdown && roomBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={roomBreakdown.map((rt) => ({ name: rt.name, value: rt.bookingCount }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={(props) => `${props.name || ""} (${((props.percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {roomBreakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length] ?? "#8884d8"} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-10">No room type data available</p>
            )}
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="border border-zinc-200 rounded bg-white">
        <div className="px-5 py-4 border-b border-zinc-200">
          <h2 className="text-sm font-medium text-zinc-700">Recent Bookings</h2>
        </div>
        {loadingOverview ? (
          <div className="animate-pulse p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-zinc-50 rounded" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left">
                <th className="px-5 py-3 font-medium text-zinc-500">Reference</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Guest</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Check-in</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Amount</th>
                <th className="px-5 py-3 font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(overview?.recentBookings || []).map((b) => (
                <tr key={b.id} className="border-t border-zinc-50 hover:bg-zinc-50">
                  <td className="px-5 py-3">
                    <Link href={`/admin/bookings/${b.id}`} className="text-blue-600 hover:underline">{b.reference}</Link>
                  </td>
                  <td className="px-5 py-3">{b.guestName}</td>
                  <td className="px-5 py-3">{new Date(b.checkIn).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge value={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { Input, Select } from "../components/FormField";
import Link from "next/link";
import { FiEye } from "react-icons/fi";

import type { AdminBooking as Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (status) params['status'] = status;
  if (search) params['search'] = search;

  const { data, loading, meta } = useApiList<Booking>("/property/bookings", params);

  const columns: Column<Booking>[] = [
    { key: "bookingReference", label: "Booking Ref", render: (r) => <Link href={`/admin/bookings/${r.id}`} className="text-blue-600 hover:underline">{r.bookingReference}</Link> },
    { key: "guestName", label: "Guest Name", sortable: true },
    { key: "checkInDate", label: "Check-in", sortable: true, render: (r) => new Date(r.checkInDate).toLocaleDateString() },
    { key: "checkOutDate", label: "Check-out", render: (r) => new Date(r.checkOutDate).toLocaleDateString() },
    { key: "totalAmount", label: "Amount", sortable: true, render: (r) => formatCurrency(r.totalAmount) },
    { key: "status", label: "Status", render: (r) => <Badge value={r.status} /> },
    { key: "actions", label: "", render: (r) => <Link href={`/admin/bookings/${r.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100 inline-flex" title="View"><FiEye size={15} /></Link> },
  ];

  return (
    <div>
      <PageHeader title="Bookings" description="Manage all villa bookings" />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by name or reference..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Checked In</option>
          <option value="checked_out">Checked Out</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        totalPages={meta?.totalPages || 1}
        onPageChange={setPage}
      />
    </div>
  );
}

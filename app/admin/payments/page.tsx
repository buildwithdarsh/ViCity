"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { Input, Select } from "../components/FormField";
import Link from "next/link";
import { FiEye } from "react-icons/fi";

import type { AdminPayment as Payment } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export default function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (status) params['status'] = status;
  if (search) params['search'] = search;

  const { data, loading, meta } = useApiList<Payment>("/payments", params);

  const columns: Column<Payment>[] = [
    { key: "id", label: "Payment ID", render: (r) => <Link href={`/admin/payments/${r.id}`} className="text-blue-600 hover:underline font-mono text-xs">{r.id.slice(0, 8)}...</Link> },
    { key: "booking", label: "Booking Ref", render: (r) => <Link href={`/admin/bookings/${r.bookingId}`} className="text-blue-600 hover:underline">{r.booking?.bookingReference ?? "—"}</Link> },
    { key: "guestName", label: "Guest", render: (r) => r.booking?.guestName ?? "—" },
    { key: "amount", label: "Amount", sortable: true, render: (r) => formatCurrency(r.amount) },
    { key: "method", label: "Method", render: (r) => r.method || "—" },
    { key: "status", label: "Status", render: (r) => <Badge value={r.status} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => <Link href={`/admin/payments/${r.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100 inline-flex" title="View"><FiEye size={15} /></Link> },
  ];

  return (
    <div>
      <PageHeader title="Payments" description="View all transactions" />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search by booking ref..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
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

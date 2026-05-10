"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { Input, Select } from "../components/FormField";
import Link from "next/link";
import { FiEye } from "react-icons/fi";

import type { AdminUser as User } from "@/lib/types";

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (search) params['search'] = search;
  if (role) params['role'] = role;

  const { data, loading, meta } = useApiList<User>("/users", params);

  const columns: Column<User>[] = [
    { key: "name", label: "Name", sortable: true, render: (r) => <Link href={`/admin/users/${r.id}`} className="text-blue-600 hover:underline">{r.name}</Link> },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "role", label: "Role", render: (r) => <Badge value={r.role} /> },
    { key: "status", label: "Status", render: (r) => <Badge value={r.isBlocked ? "blocked" : "active"} /> },
    { key: "createdAt", label: "Joined", sortable: true, render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "bookings", label: "Bookings", render: (r) => String(r._count?.bookings ?? 0) },
    { key: "actions", label: "", render: (r) => <Link href={`/admin/users/${r.id}`} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100 inline-flex" title="View"><FiEye size={15} /></Link> },
  ];

  return (
    <div>
      <PageHeader title="Users" description="Manage registered users" />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-xs" />
        <Select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className="max-w-[160px]">
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
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

"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import { Input } from "../components/FormField";

/** Local admin audit-log shape — SDK AuditLog uses different field names (resource vs resourceType,
 *  userId vs actorId) and lacks actor object/ipAddress. Keep until SDK aligns field names. */
interface AuditLog {
  id: string;
  actorId: string | null;
  actor: { id: string; name: string | null; email: string } | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (action) params['action'] = action;
  if (dateFrom) params['dateFrom'] = dateFrom;
  if (dateTo) params['dateTo'] = dateTo;

  const { data, loading, meta } = useApiList<AuditLog>("/audit", params);

  const columns: Column<AuditLog>[] = [
    {
      key: "actor",
      label: "Actor",
      render: (r) => r.actor ? (r.actor.name || r.actor.email) : "System",
    },
    { key: "action", label: "Action", render: (r) => <Badge value={r.action} /> },
    { key: "resourceType", label: "Resource Type", render: (r) => r.resourceType },
    {
      key: "resourceId",
      label: "Resource ID",
      render: (r) => r.resourceId ? <span className="font-mono text-xs">{r.resourceId.slice(0, 8)}...</span> : "—",
    },
    { key: "ipAddress", label: "IP Address", render: (r) => r.ipAddress || "—" },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="View system activity and changes" />

      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Filter by action..."
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="max-w-[160px]"
          title="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="max-w-[160px]"
          title="To date"
        />
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

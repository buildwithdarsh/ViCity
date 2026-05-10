"use client";

import { useState } from "react";
import { useApiList, useApi } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import { Select } from "../components/FormField";
import { FiEye } from "react-icons/fi";

interface NotificationLog {
  id: string;
  recipientId: string | null;
  metadata: { recipient?: string } | null;
  channel: string;
  type: string;
  subject: string | null;
  body: string;
  status: string;
  error: string | null;
  createdAt: string;
}

function getRecipient(r: NotificationLog): string {
  return (r.metadata as { recipient?: string } | null)?.recipient ?? r.recipientId ?? "—";
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState("");
  const [status, setStatus] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const params: Record<string, string> = { page: String(page), limit: "20" };
  if (channel) params['channel'] = channel;
  if (status) params['status'] = status;

  const { data, loading, meta } = useApiList<NotificationLog>("/notifications", params);
  const { data: detail } = useApi<NotificationLog>(detailId ? `/notifications/${detailId}` : null);

  const columns: Column<NotificationLog>[] = [
    { key: "recipientId", label: "Recipient", render: (r) => getRecipient(r) },
    { key: "channel", label: "Channel", render: (r) => <Badge value={r.channel} /> },
    { key: "type", label: "Type" },
    { key: "subject", label: "Subject", render: (r) => <span className="truncate max-w-xs block">{r.subject ?? "—"}</span> },
    { key: "status", label: "Status", render: (r) => <Badge value={r.status} /> },
    { key: "createdAt", label: "Date", sortable: true, render: (r) => new Date(r.createdAt).toLocaleString() },
    { key: "actions", label: "", render: (r) => <button onClick={() => setDetailId(r.id)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100" title="View"><FiEye size={15} /></button> },
  ];

  return (
    <div>
      <PageHeader title="Notification Logs" description="View history of all sent notifications" />

      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={channel} onChange={(e) => { setChannel(e.target.value); setPage(1); }} className="max-w-[160px]">
          <option value="">All Channels</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="in_app">In-App</option>
        </Select>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
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

      <Modal open={!!detailId} onClose={() => setDetailId(null)} title="Notification Detail">
        {detail ? (
          <dl className="space-y-3 text-sm">
            <div><dt className="text-zinc-500">Recipient</dt><dd className="text-zinc-900">{getRecipient(detail)}</dd></div>
            <div><dt className="text-zinc-500">Channel</dt><dd><Badge value={detail.channel} /></dd></div>
            <div><dt className="text-zinc-500">Type</dt><dd className="text-zinc-900">{detail.type}</dd></div>
            <div><dt className="text-zinc-500">Subject</dt><dd className="text-zinc-900">{detail.subject ?? "—"}</dd></div>
            <div><dt className="text-zinc-500">Status</dt><dd><Badge value={detail.status} /></dd></div>
            <div><dt className="text-zinc-500">Sent At</dt><dd className="text-zinc-900">{new Date(detail.createdAt).toLocaleString()}</dd></div>
            {detail.error && <div><dt className="text-zinc-500">Error</dt><dd className="text-red-600">{detail.error}</dd></div>}
            <div>
              <dt className="text-zinc-500 mb-1">Body</dt>
              <dd className="text-zinc-700 bg-zinc-50 p-3 rounded text-xs whitespace-pre-wrap">{detail.body}</dd>
            </div>
          </dl>
        ) : (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-5 bg-zinc-100 rounded" />)}
          </div>
        )}
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import { patch } from "@/lib/admin/api";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Modal from "../components/Modal";
import { Textarea } from "../components/FormField";
import { useToast } from "../components/Toast";
import { FiCheck, FiX, FiEyeOff } from "react-icons/fi";

/** Local admin review shape — SDK does not export a typed admin review response yet.
 *  Includes nested user/roomType/booking objects specific to the admin reviews endpoint. */
interface Review {
  id: string;
  rating: number;
  body: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  roomType: { name: string };
  booking: { bookingReference: string };
}

const tabs = ["pending", "approved", "rejected", "hidden"] as const;

export default function ReviewsPage() {
  const [tab, setTab] = useState<string>("pending");
  const { data, loading, refetch } = useApiList<Review>("/reviews", { status: tab });
  const { toast } = useToast();
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleAction = async (id: string, action: string) => {
    try {
      await patch(`/reviews/${id}/status`, { status: action === "approve" ? "approved" : action === "hide" ? "hidden" : action });
      toast(`Review ${action}d`);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setActionLoading(true);
    try {
      await patch(`/reviews/${rejectId}/status`, { status: "rejected", reason: rejectReason });
      toast("Review rejected");
      setRejectId(null);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  const renderStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

  const columns: Column<Review>[] = [
    { key: "user", label: "Reviewer", render: (r) => r.user.name },
    { key: "roomType", label: "Property", render: () => "ViCity" },
    { key: "rating", label: "Rating", render: (r) => <span className="text-yellow-500">{renderStars(r.rating)}</span> },
    { key: "body", label: "Review", render: (r) => <span className="text-zinc-600 truncate max-w-xs block">{(r.body ?? "").slice(0, 60)}{(r.body ?? "").length > 60 ? "..." : ""}</span> },
    { key: "booking", label: "Booking", render: (r) => r.booking?.bookingReference ?? "—" },
    { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    { key: "actions", label: "", render: (r) => (
      <div className="flex gap-1">
        {(tab === "pending" || tab === "rejected") && <button onClick={() => handleAction(r.id, "approve")} className="p-1.5 text-green-500 hover:text-green-700 rounded hover:bg-green-50" title="Approve"><FiCheck size={15} /></button>}
        {tab !== "rejected" && <button onClick={() => { setRejectId(r.id); setRejectReason(""); }} className="p-1.5 text-orange-500 hover:text-orange-700 rounded hover:bg-orange-50" title="Reject"><FiX size={15} /></button>}
        {tab !== "hidden" && <button onClick={() => handleAction(r.id, "hide")} className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100" title="Hide"><FiEyeOff size={15} /></button>}
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate guest reviews" />

      <div className="flex gap-1 mb-4 border-b border-zinc-200">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 transition-colors ${tab === t ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-700"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Reject Review" footer={
        <>
          <button onClick={() => setRejectId(null)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-50">
            {actionLoading ? "Rejecting..." : "Reject"}
          </button>
        </>
      }>
        <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
      </Modal>

    </div>
  );
}

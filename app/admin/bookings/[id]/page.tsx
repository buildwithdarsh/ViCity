"use client";

import { use, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { post, patch } from "@/lib/admin/api";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { useToast } from "../../components/Toast";
import { Input, Select, Textarea } from "../../components/FormField";

import type { BookingDetail } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: booking, loading, refetch } = useApi<BookingDetail>(`/property/bookings/${id}`);
  const { toast } = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await post(`/property/bookings/${id}/cancel`, { reason: cancelReason });
      toast("Booking cancelled");
      setCancelOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  const handleRefund = async () => {
    const paidPayment = booking?.payments?.find((p) => p.status === "paid");
    if (!paidPayment) {
      toast("No paid payment found to refund", "error");
      return;
    }
    setActionLoading(true);
    try {
      await post(`/payments/${paidPayment.id}/refunds`, { amount: Math.round(Number(refundAmount) * 100) });
      toast("Refund initiated");
      setRefundOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  const handleStatusUpdate = async () => {
    setActionLoading(true);
    try {
      if (newStatus === "checked_in") {
        await post(`/property/bookings/${id}/check-in`);
      } else if (newStatus === "checked_out") {
        await post(`/property/bookings/${id}/check-out`);
      } else {
        await patch(`/property/bookings/${id}`, { status: newStatus });
      }
      toast("Status updated");
      setStatusOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-zinc-100 rounded w-48" />
        <div className="h-64 bg-zinc-100 rounded" />
      </div>
    );
  }

  if (!booking) return <p className="text-zinc-500">Booking not found</p>;

  return (
    <div>
      <PageHeader
        title={`Booking ${booking.bookingReference}`}
        actions={
          <div className="flex gap-2">
            {booking.status !== "cancelled" && booking.status !== "checked_out" && (
              <>
                <button onClick={() => setStatusOpen(true)} className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800">
                  Update Status
                </button>
                <button onClick={() => setCancelOpen(true)} className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50">
                  Cancel Booking
                </button>
              </>
            )}
            <button onClick={() => { setRefundAmount(String(booking.totalAmount / 100)); setRefundOpen(true); }} className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">
              Issue Refund
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-zinc-200 rounded bg-white p-5">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Booking Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-zinc-500">Status</dt><dd className="mt-1"><Badge value={booking.status} /></dd></div>
              <div><dt className="text-zinc-500">Property</dt><dd className="mt-1 text-zinc-900">ViCity</dd></div>
              <div><dt className="text-zinc-500">Check-in</dt><dd className="mt-1 text-zinc-900">{new Date(booking.checkInDate).toLocaleDateString()}</dd></div>
              <div><dt className="text-zinc-500">Check-out</dt><dd className="mt-1 text-zinc-900">{new Date(booking.checkOutDate).toLocaleDateString()}</dd></div>
              <div><dt className="text-zinc-500">Nights</dt><dd className="mt-1 text-zinc-900">{booking.nights}</dd></div>
              <div><dt className="text-zinc-500">Total Amount</dt><dd className="mt-1 text-zinc-900 font-medium">{formatCurrency(booking.totalAmount)}</dd></div>
              <div><dt className="text-zinc-500">Booked On</dt><dd className="mt-1 text-zinc-900">{new Date(booking.createdAt).toLocaleString()}</dd></div>
            </dl>
            {booking.specialRequests && (
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <p className="text-sm text-zinc-500 mb-1">Special Requests</p>
                <p className="text-sm text-zinc-700">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Room Assignment */}
          {(booking.bookingRooms ?? []).filter((r) => r.roomUnit).length > 0 && (
            <div className="border border-zinc-200 rounded bg-white p-5">
              <h2 className="text-sm font-medium text-zinc-700 mb-3">Assigned Rooms</h2>
              <div className="flex gap-2">
                {(booking.bookingRooms ?? []).filter((r) => r.roomUnit).map((r) => (
                  <span key={r.id} className="px-3 py-1.5 bg-zinc-100 rounded text-sm">
                    Room {r.roomUnit!.roomNumber} (Floor {r.roomUnit!.floor})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payments */}
          <div className="border border-zinc-200 rounded bg-white">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-medium text-zinc-700">Payments</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-2 text-left font-medium text-zinc-500">Amount</th>
                  <th className="px-5 py-2 text-left font-medium text-zinc-500">Method</th>
                  <th className="px-5 py-2 text-left font-medium text-zinc-500">Status</th>
                  <th className="px-5 py-2 text-left font-medium text-zinc-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {(booking.payments ?? []).map((p) => (
                  <tr key={p.id} className="border-t border-zinc-50">
                    <td className="px-5 py-3">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3">{p.method || "—"}</td>
                    <td className="px-5 py-3"><Badge value={p.status} /></td>
                    <td className="px-5 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {(booking.payments ?? []).length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-4 text-center text-zinc-400">No payments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Guest Info */}
        <div className="border border-zinc-200 rounded bg-white p-5 h-fit">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Guest Information</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-zinc-500">Name</dt><dd className="text-zinc-900">{booking.guestName}</dd></div>
            <div><dt className="text-zinc-500">Email</dt><dd className="text-zinc-900">{booking.guestEmail}</dd></div>
            <div><dt className="text-zinc-500">Phone</dt><dd className="text-zinc-900">{booking.guestPhone || "—"}</dd></div>
          </dl>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel Booking" footer={
        <>
          <button onClick={() => setCancelOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleCancel} disabled={actionLoading} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            {actionLoading ? "Processing..." : "Confirm Cancellation"}
          </button>
        </>
      }>
        <Textarea placeholder="Cancellation reason..." value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} />
      </Modal>

      {/* Refund Modal */}
      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Issue Refund" footer={
        <>
          <button onClick={() => setRefundOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleRefund} disabled={actionLoading} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50">
            {actionLoading ? "Processing..." : "Initiate Refund"}
          </button>
        </>
      }>
        <div>
          <label className="text-sm text-zinc-600 block mb-1">Refund Amount (₹)</label>
          <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
        </div>
      </Modal>

      {/* Status Update Modal */}
      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update Status" footer={
        <>
          <button onClick={() => setStatusOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleStatusUpdate} disabled={actionLoading || !newStatus} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50">
            {actionLoading ? "Updating..." : "Update"}
          </button>
        </>
      }>
        <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
          <option value="">Select status</option>
          <option value="confirmed">Confirmed</option>
          <option value="checked_in">Check In</option>
          <option value="checked_out">Check Out</option>
        </Select>
      </Modal>
    </div>
  );
}

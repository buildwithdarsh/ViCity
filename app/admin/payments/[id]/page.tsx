"use client";

import { use, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { post } from "@/lib/admin/api";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { Input, Textarea } from "../../components/FormField";
import { useToast } from "../../components/Toast";
import Link from "next/link";

import type { AdminPaymentDetail as PaymentDetail } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/currency";

export default function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: payment, loading, refetch } = useApi<PaymentDetail>(`/payments/${id}`);
  const { toast } = useToast();
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);

  const handleRefund = async () => {
    setRefunding(true);
    try {
      await post(`/payments/${id}/refunds`, { amount: Math.round(Number(refundAmount) * 100), reason: refundReason });
      toast("Refund initiated");
      setRefundOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setRefunding(false);
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-zinc-100 rounded w-48 mb-4" /><div className="h-64 bg-zinc-100 rounded" /></div>;
  if (!payment) return <p className="text-zinc-500">Payment not found</p>;

  return (
    <div>
      <PageHeader title="Payment Detail" actions={
        payment.status === "paid" && (
          <button onClick={() => { setRefundAmount(String(payment.amount / 100)); setRefundOpen(true); }} className="px-3 py-2 text-sm border border-red-200 text-red-600 rounded hover:bg-red-50">
            Initiate Refund
          </button>
        )
      } />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-zinc-200 rounded bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Payment Information</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-zinc-500">Payment ID</dt><dd className="text-zinc-900 font-mono text-xs">{payment.id}</dd></div>
            <div><dt className="text-zinc-500">Status</dt><dd><Badge value={payment.status} /></dd></div>
            <div><dt className="text-zinc-500">Amount</dt><dd className="text-zinc-900 font-medium">{formatCurrency(payment.amount)}</dd></div>
            <div><dt className="text-zinc-500">Currency</dt><dd className="text-zinc-900">{payment.currency}</dd></div>
            <div><dt className="text-zinc-500">Method</dt><dd className="text-zinc-900">{payment.method || "—"}</dd></div>
            <div><dt className="text-zinc-500">Razorpay Order ID</dt><dd className="text-zinc-900 font-mono text-xs">{payment.razorpayOrderId || "—"}</dd></div>
            <div><dt className="text-zinc-500">Razorpay Payment ID</dt><dd className="text-zinc-900 font-mono text-xs">{payment.razorpayPaymentId || "—"}</dd></div>
            <div><dt className="text-zinc-500">Date</dt><dd className="text-zinc-900">{new Date(payment.createdAt).toLocaleString()}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="border border-zinc-200 rounded bg-white p-5">
            <h2 className="text-sm font-medium text-zinc-700 mb-4">Linked Booking</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-zinc-500">Reference</dt><dd><Link href={`/admin/bookings/${payment.booking.id}`} className="text-blue-600 hover:underline">{payment.booking.reference}</Link></dd></div>
              <div><dt className="text-zinc-500">Guest</dt><dd className="text-zinc-900">{payment.booking.guestName}</dd></div>
              <div><dt className="text-zinc-500">Email</dt><dd className="text-zinc-900">{payment.booking.guestEmail}</dd></div>
            </dl>
          </div>

          <div className="border border-zinc-200 rounded bg-white">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-medium text-zinc-700">Webhook Events</h2>
            </div>
            {payment.webhookEvents.length > 0 ? (
              <ul className="divide-y divide-zinc-50">
                {payment.webhookEvents.map((e) => (
                  <li key={e.id} className="px-5 py-3 text-sm flex justify-between">
                    <span className="text-zinc-900">{e.eventType}</span>
                    <span className="text-zinc-400">{new Date(e.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-zinc-400 text-sm">No webhook events</p>
            )}
          </div>
        </div>
      </div>

      <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Initiate Refund" footer={
        <>
          <button onClick={() => setRefundOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleRefund} disabled={refunding} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            {refunding ? "Processing..." : "Confirm Refund"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-600 block mb-1">Refund Amount (₹)</label>
            <Input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-zinc-600 block mb-1">Reason</label>
            <Textarea value={refundReason} onChange={(e) => setRefundReason(e.target.value)} rows={2} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

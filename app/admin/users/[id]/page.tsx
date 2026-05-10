"use client";

import { use, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { patch } from "@/lib/admin/api";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import { Select, Textarea } from "../../components/FormField";
import { useToast } from "../../components/Toast";
import { formatCurrency } from "@/lib/utils/currency";
import Link from "next/link";

import type { AdminUserDetail as UserDetail } from "@/lib/types";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: user, loading, refetch } = useApi<UserDetail>(`/users/${id}`);
  const { toast } = useToast();
  const [blockOpen, setBlockOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleBlock = async () => {
    setActionLoading(true);
    try {
      await patch(`/users/${id}/block`, { reason: blockReason });
      toast("User blocked");
      setBlockOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  const handleUnblock = async () => {
    try {
      await patch(`/users/${id}/unblock`);
      toast("User unblocked");
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const handleRoleChange = async () => {
    setActionLoading(true);
    try {
      await patch(`/users/${id}/role`, { role: newRole });
      toast("Role updated");
      setRoleOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setActionLoading(false);
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-zinc-100 rounded w-48 mb-4" /><div className="h-64 bg-zinc-100 rounded" /></div>;
  if (!user) return <p className="text-zinc-500">User not found</p>;

  return (
    <div>
      <PageHeader title={user.name} actions={
        <div className="flex gap-2">
          <button onClick={() => { setNewRole(user.role); setRoleOpen(true); }} className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Change Role</button>
          {user.isBlocked ? (
            <button onClick={handleUnblock} className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">Unblock</button>
          ) : (
            <button onClick={() => setBlockOpen(true)} className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Block User</button>
          )}
        </div>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-zinc-200 rounded bg-white p-5">
          <h2 className="text-sm font-medium text-zinc-700 mb-4">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-zinc-500">Email</dt><dd className="text-zinc-900">{user.email}</dd></div>
            <div><dt className="text-zinc-500">Phone</dt><dd className="text-zinc-900">{user.phone || "—"}</dd></div>
            <div><dt className="text-zinc-500">Role</dt><dd><Badge value={user.role} /></dd></div>
            <div><dt className="text-zinc-500">Status</dt><dd><Badge value={user.isBlocked ? "blocked" : "active"} /></dd></div>
            <div><dt className="text-zinc-500">Email Verified</dt><dd className="text-zinc-900">{user.isEmailVerified ? "Yes" : "No"}</dd></div>
            <div><dt className="text-zinc-500">Joined</dt><dd className="text-zinc-900">{new Date(user.createdAt).toLocaleDateString()}</dd></div>
          </dl>
        </div>

        <div className="lg:col-span-2 border border-zinc-200 rounded bg-white">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-medium text-zinc-700">Booking History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-5 py-2 text-left font-medium text-zinc-500">Reference</th>
                <th className="px-5 py-2 text-left font-medium text-zinc-500">Check-in</th>
                <th className="px-5 py-2 text-left font-medium text-zinc-500">Amount</th>
                <th className="px-5 py-2 text-left font-medium text-zinc-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {(user.bookings ?? []).map((b) => (
                <tr key={b.id} className="border-t border-zinc-50 hover:bg-zinc-50">
                  <td className="px-5 py-3"><Link href={`/admin/bookings/${b.id}`} className="text-blue-600 hover:underline">{b.bookingReference}</Link></td>
                  <td className="px-5 py-3">{new Date(b.checkInDate).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{formatCurrency(b.totalAmount)}</td>
                  <td className="px-5 py-3"><Badge value={b.status} /></td>
                </tr>
              ))}
              {(user.bookings ?? []).length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-400">No bookings</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={blockOpen} onClose={() => setBlockOpen(false)} title="Block User" footer={
        <>
          <button onClick={() => setBlockOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleBlock} disabled={actionLoading} className="px-4 py-2 text-sm bg-red-600 text-white rounded disabled:opacity-50">
            {actionLoading ? "Blocking..." : "Block User"}
          </button>
        </>
      }>
        <Textarea placeholder="Reason for blocking..." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} rows={3} />
      </Modal>

      <Modal open={roleOpen} onClose={() => setRoleOpen(false)} title="Change Role" footer={
        <>
          <button onClick={() => setRoleOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleRoleChange} disabled={actionLoading} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {actionLoading ? "Updating..." : "Update Role"}
          </button>
        </>
      }>
        <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
      </Modal>
    </div>
  );
}

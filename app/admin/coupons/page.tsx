"use client";

import { useState } from "react";
import { useApiList } from "../hooks/useApi";
import { post, patch, del } from "@/lib/admin/api";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import FormField, { Input, Select } from "../components/FormField";
import { useToast } from "../components/Toast";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { formatCurrency } from "@/lib/utils/currency";

/** Local admin coupon shape — SDK admin.coupons.list/get returns unknown.
 *  This is a property-specific coupon model. Keep until SDK exports a typed admin coupon response. */
interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount: number | null;
  minBookingValue: number;
  usageLimit: number;
  usageCount: number;
  perUserLimit: number;
  expiryDate: string | null;
  isActive: boolean;
}

const emptyForm = {
  code: "", discountType: "percentage", discountValue: "", maxDiscountAmount: "",
  minBookingValue: "", usageLimit: "", perUserLimit: "1", expiryDate: "", isActive: true,
};

export default function CouponsPage() {
  const { data, loading, refetch } = useApiList<Coupon>("/coupons");
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code, discountType: c.discountType,
      discountValue: c.discountType === "flat" ? String(c.discountValue / 100) : String(c.discountValue),
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount / 100) : "",
      minBookingValue: c.minBookingValue ? String(c.minBookingValue / 100) : "",
      usageLimit: c.usageLimit ? String(c.usageLimit) : "", perUserLimit: String(c.perUserLimit),
      expiryDate: c.expiryDate?.slice(0, 10) || "", isActive: c.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        code: form.code, discountType: form.discountType,
        discountValue: form.discountType === "flat" ? Math.round(Number(form.discountValue) * 100) : Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Math.round(Number(form.maxDiscountAmount) * 100) : undefined,
        minBookingValue: form.minBookingValue ? Math.round(Number(form.minBookingValue) * 100) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        perUserLimit: Number(form.perUserLimit || 1),
        expiryDate: form.expiryDate || undefined,
        isActive: form.isActive,
      };
      if (editId) {
        await patch(`/coupons/${editId}`, body);
        toast("Coupon updated");
      } else {
        await post("/coupons", body);
        toast("Coupon created");
      }
      setFormOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await del(`/coupons/${deleteId}`);
      toast("Coupon deleted");
      setDeleteId(null);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const generateCode = () => {
    const code = "VEL" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm((f) => ({ ...f, code }));
  };

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const columns: Column<Coupon>[] = [
    { key: "code", label: "Code", sortable: true, render: (r) => <span className="font-mono">{r.code}</span> },
    { key: "discountType", label: "Type", render: (r) => <Badge value={r.discountType} /> },
    { key: "discountValue", label: "Value", render: (r) => r.discountType === "percentage" ? `${r.discountValue}%` : formatCurrency(r.discountValue) },
    { key: "minBookingValue", label: "Min Booking", render: (r) => r.minBookingValue ? formatCurrency(r.minBookingValue) : "—" },
    { key: "usage", label: "Usage", render: (r) => `${r.usageCount}/${r.usageLimit}` },
    { key: "expiryDate", label: "Expires", render: (r) => r.expiryDate ? new Date(r.expiryDate).toLocaleDateString() : "Never" },
    { key: "isActive", label: "Status", render: (r) => <Badge value={r.isActive ? "active" : "inactive"} /> },
    { key: "actions", label: "", render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100" title="Edit"><FiEdit2 size={15} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete"><FiTrash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Coupons" description="Manage discount coupons" actions={
        <button onClick={openCreate} className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800">Create Coupon</button>
      } />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Edit Coupon" : "New Coupon"} footer={
        <>
          <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <FormField label="Coupon Code" required>
            <div className="flex gap-2">
              <Input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className="font-mono" />
              <button type="button" onClick={generateCode} className="px-3 py-2 text-xs border border-zinc-200 rounded hover:bg-zinc-50 whitespace-nowrap">Generate</button>
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Discount Type" required>
              <Select value={form.discountType} onChange={(e) => set("discountType", e.target.value)}>
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount (₹)</option>
              </Select>
            </FormField>
            <FormField label={form.discountType === "flat" ? "Discount Value (₹)" : "Discount Value (%)"} required>
              <Input type="number" value={form.discountValue} onChange={(e) => set("discountValue", e.target.value)} />
            </FormField>
          </div>
          {form.discountType === "percentage" && (
            <FormField label="Max Discount Cap (₹)"><Input type="number" value={form.maxDiscountAmount} onChange={(e) => set("maxDiscountAmount", e.target.value)} /></FormField>
          )}
          <FormField label="Min Booking Value (₹)"><Input type="number" value={form.minBookingValue} onChange={(e) => set("minBookingValue", e.target.value)} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Usage Limit"><Input type="number" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Unlimited" /></FormField>
            <FormField label="Per User Limit"><Input type="number" value={form.perUserLimit} onChange={(e) => set("perUserLimit", e.target.value)} /></FormField>
          </div>
          <FormField label="Expiry Date"><Input type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} /></FormField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive as unknown as boolean} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
            Active
          </label>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon" message="Are you sure? This coupon will be permanently removed." confirmLabel="Delete" destructive />
    </div>
  );
}

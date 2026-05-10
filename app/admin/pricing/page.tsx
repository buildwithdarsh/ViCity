"use client";

import { useState, useEffect } from "react";
import { useApiList } from "../hooks/useApi";
import { post, patch, del } from "@/lib/admin/api";
import PageHeader from "../components/PageHeader";
import DataTable, { Column } from "../components/DataTable";
import Badge from "../components/Badge";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import FormField, { Input, Select } from "../components/FormField";
import { useToast } from "../components/Toast";
import { FiEdit2, FiTrash2, FiLock } from "react-icons/fi";

interface PricingRule {
  id: string;
  roomType: { id: string; name: string };
  type: string;
  price: number;
  multiplier: number | null;
  startDate: string | null;
  endDate: string | null;
  daysOfWeek: number[];
  minStay: number | null;
  maxStay: number | null;
  priority: number;
  isActive: boolean;
}

interface RoomTypeOption {
  id: string;
  name: string;
  basePrice: number;
}

import { formatCurrency } from "@/lib/utils/currency";

const emptyForm = { type: "weekend" as string, price: "", multiplier: "", startDate: "", endDate: "", daysOfWeek: "" as string, minStay: "", maxStay: "", priority: "0", isActive: true };

export default function PricingPage() {
  const { data, loading, refetch } = useApiList<PricingRule>("/property/pricing");
  const { data: roomTypes, refetch: refetchRoomTypes } = useApiList<RoomTypeOption>("/property/types");
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Base price editing
  const [basePriceEdit, setBasePriceEdit] = useState<string>("");
  const [savingBase, setSavingBase] = useState(false);
  const villa = roomTypes.length > 0 ? roomTypes[0] : null;

  useEffect(() => {
    if (villa) setBasePriceEdit(String(villa.basePrice / 100));
  }, [villa]);

  const handleSaveBasePrice = async () => {
    if (!villa) return;
    const newPrice = Math.round(Number(basePriceEdit) * 100);
    if (newPrice <= 0 || newPrice === villa.basePrice) return;
    setSavingBase(true);
    try {
      await patch(`/property/types/${villa.id}`, { basePrice: newPrice });
      toast("Base price updated \u2014 dependent rules recalculated");
      refetchRoomTypes();
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setSavingBase(false);
  };

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (r: PricingRule) => {
    setEditId(r.id);
    setForm({
      type: r.type, price: String(r.price / 100),
      multiplier: r.multiplier != null ? String(r.multiplier) : "",
      startDate: r.startDate?.slice(0, 10) || "", endDate: r.endDate?.slice(0, 10) || "",
      daysOfWeek: r.daysOfWeek.join(","), minStay: r.minStay ? String(r.minStay) : "",
      maxStay: r.maxStay ? String(r.maxStay) : "", priority: String(r.priority), isActive: r.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!villa) return;
    setSaving(true);
    try {
      const body = {
        roomTypeId: villa.id, type: form.type, price: Math.round(Number(form.price) * 100),
        multiplier: form.multiplier ? Number(form.multiplier) : null,
        startDate: form.startDate || undefined, endDate: form.endDate || undefined,
        daysOfWeek: form.daysOfWeek ? form.daysOfWeek.split(",").map(Number) : [],
        minStay: form.minStay ? Number(form.minStay) : undefined,
        maxStay: form.maxStay ? Number(form.maxStay) : undefined,
        priority: Number(form.priority), isActive: form.isActive,
      };
      if (editId) {
        await patch(`/property/pricing/${editId}`, body);
        toast("Pricing rule updated");
      } else {
        await post("/property/pricing", body);
        toast("Pricing rule created");
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
      await del(`/property/pricing/${deleteId}`);
      toast("Pricing rule deleted");
      setDeleteId(null);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  // Auto-calculate price from multiplier when multiplier changes
  const set = (key: string, value: string | boolean) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "multiplier" && value && villa) {
        next.price = String(Math.round((villa.basePrice * Number(value)) / 100));
      }
      return next;
    });
  };

  const columns: Column<PricingRule>[] = [
    { key: "type", label: "Type", render: (r) => <Badge value={r.type} /> },
    { key: "price", label: "Price", sortable: true, render: (r) => formatCurrency(r.price) },
    { key: "multiplier", label: "Multiplier", render: (r) => r.multiplier != null ? `${r.multiplier}\u00d7` : "\u2014" },
    { key: "startDate", label: "Start", render: (r) => r.startDate ? new Date(r.startDate).toLocaleDateString() : "\u2014" },
    { key: "endDate", label: "End", render: (r) => r.endDate ? new Date(r.endDate).toLocaleDateString() : "\u2014" },
    { key: "priority", label: "Priority", sortable: true },
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
      <PageHeader title="Pricing" description="Manage villa pricing and dynamic rules" actions={
        <button onClick={openCreate} className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800">Add Rule</button>
      } />

      {/* Base Price Card */}
      {villa && (
        <div className="mb-6 border border-zinc-200 rounded bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <FiLock size={14} className="text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">Base Price</h2>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-xs text-zinc-500 mb-1">Price per night (&#8377;)</label>
              <input
                type="number"
                value={basePriceEdit}
                onChange={(e) => setBasePriceEdit(e.target.value)}
                className="w-full border border-zinc-200 rounded px-3 py-2 text-sm focus:border-zinc-400 outline-none"
              />
            </div>
            <button
              onClick={handleSaveBasePrice}
              disabled={savingBase || !basePriceEdit || Math.round(Number(basePriceEdit) * 100) === villa.basePrice}
              className="px-4 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50"
            >
              {savingBase ? "Saving..." : "Update Base Price"}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            Rules with a multiplier will auto-recalculate when you change the base price.
          </p>
        </div>
      )}

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Edit Pricing Rule" : "New Pricing Rule"} footer={
        <>
          <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <FormField label="Pricing Type" required>
            <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
              <option value="weekend">Weekend</option>
              <option value="seasonal">Seasonal</option>
              <option value="festival">Festival</option>
              <option value="discount">Discount</option>
            </Select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Multiplier (of base price)">
              <Input type="number" step="0.01" value={form.multiplier} onChange={(e) => set("multiplier", e.target.value)} placeholder="e.g. 1.2 for +20%" />
              <p className="text-xs text-zinc-400 mt-1">Auto-updates price when base changes</p>
            </FormField>
            <FormField label="Price (&#8377;)" required><Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date"><Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></FormField>
            <FormField label="End Date"><Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></FormField>
          </div>
          <FormField label="Days of Week (comma-separated, 0=Sun)"><Input value={form.daysOfWeek} onChange={(e) => set("daysOfWeek", e.target.value)} placeholder="e.g. 0,6" /></FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Min Stay"><Input type="number" value={form.minStay} onChange={(e) => set("minStay", e.target.value)} /></FormField>
            <FormField label="Max Stay"><Input type="number" value={form.maxStay} onChange={(e) => set("maxStay", e.target.value)} /></FormField>
            <FormField label="Priority"><Input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} /></FormField>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive as unknown as boolean} onChange={(e) => set("isActive", e.target.checked)} className="rounded" />
            Active
          </label>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Pricing Rule" message="Are you sure? This pricing rule will be permanently removed." confirmLabel="Delete" destructive />
    </div>
  );
}

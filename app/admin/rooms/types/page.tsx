"use client";

import { useState } from "react";
import { useApiList } from "../../hooks/useApi";
import { post, patch, del } from "@/lib/admin/api";
import PageHeader from "../../components/PageHeader";
import DataTable, { Column } from "../../components/DataTable";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import ConfirmModal from "../../components/ConfirmModal";
import FormField, { Input, Select, Textarea } from "../../components/FormField";
import { useToast } from "../../components/Toast";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

interface RoomType {
  id: string;
  name: string;
  basePrice: number;
  maxGuests: number;
  bedType: string;
  roomSize: number;
  status: string;
  _count?: { roomUnits: number };
}

import { formatCurrency } from "@/lib/utils/currency";

const emptyForm = { name: "", description: "", basePrice: "", maxGuests: "", bedType: "Single", roomSize: "", status: "active" };

export default function RoomTypesPage() {
  const { data, loading, refetch } = useApiList<RoomType>("/property/types");
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openEdit = (rt: RoomType) => {
    setEditId(rt.id);
    setForm({ name: rt.name, description: "", basePrice: String(rt.basePrice / 100), maxGuests: String(rt.maxGuests), bedType: rt.bedType, roomSize: String(rt.roomSize), status: rt.status });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, basePrice: Math.round(Number(form.basePrice) * 100), maxGuests: Number(form.maxGuests), roomSize: Number(form.roomSize) };
      if (editId) {
        await patch(`/property/types/${editId}`, body);
        toast("Room type updated");
      } else {
        await post("/property/types", body);
        toast("Room type created");
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
      await del(`/property/types/${deleteId}`);
      toast("Room type deleted");
      setDeleteId(null);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const columns: Column<RoomType>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "basePrice", label: "Base Price", sortable: true, render: (r) => formatCurrency(r.basePrice) },
    { key: "maxGuests", label: "Max Guests" },
    { key: "bedType", label: "Bed Type" },
    { key: "roomSize", label: "Size (sq ft)" },
    { key: "status", label: "Status", render: (r) => <Badge value={r.status} /> },
    { key: "units", label: "Units", render: (r) => String(r._count?.roomUnits ?? 0) },
    { key: "actions", label: "", render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100" title="Edit"><FiEdit2 size={15} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete"><FiTrash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Villa Configuration" description="Manage villa settings and properties" actions={
        <Link href="/admin/rooms/units" className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Room Units</Link>
      } />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Edit Room Type" : "New Room Type"} footer={
        <>
          <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <FormField label="Name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></FormField>
          <FormField label="Description"><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Base Price (₹)" required><Input type="number" value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} /></FormField>
            <FormField label="Max Guests" required><Input type="number" value={form.maxGuests} onChange={(e) => set("maxGuests", e.target.value)} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bed Type">
              <Select value={form.bedType} onChange={(e) => set("bedType", e.target.value)}>
                <option>Single</option><option>Double</option><option>Queen</option><option>King</option><option>Twin</option>
              </Select>
            </FormField>
            <FormField label="Room Size (sq ft)"><Input type="number" value={form.roomSize} onChange={(e) => set("roomSize", e.target.value)} /></FormField>
          </div>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="active">Active</option><option value="inactive">Inactive</option>
            </Select>
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Room Type" message="Are you sure you want to delete this room type? This action cannot be undone." confirmLabel="Delete" destructive />
    </div>
  );
}

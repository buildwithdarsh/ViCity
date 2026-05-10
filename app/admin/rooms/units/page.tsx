"use client";

import { useState } from "react";
import { useApiList } from "../../hooks/useApi";
import { post, patch } from "@/lib/admin/api";
import PageHeader from "../../components/PageHeader";
import DataTable, { Column } from "../../components/DataTable";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";
import FormField, { Input, Select } from "../../components/FormField";
import { useToast } from "../../components/Toast";
import Link from "next/link";
import { FiEdit2 } from "react-icons/fi";

interface RoomUnit {
  id: string;
  roomNumber: string;
  floor: number;
  status: string;
  housekeepingStatus: string;
  roomType: { id: string; name: string };
}

interface RoomTypeOption {
  id: string;
  name: string;
}

const emptyForm = { roomNumber: "", floor: "", roomTypeId: "", status: "available" };

export default function RoomUnitsPage() {
  const { data, loading, refetch } = useApiList<RoomUnit>("/property/units");
  const { data: roomTypes } = useApiList<RoomTypeOption>("/property/types");
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (u: RoomUnit) => {
    setEditId(u.id);
    setForm({ roomNumber: u.roomNumber, floor: String(u.floor), roomTypeId: u.roomType.id, status: u.status });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { ...form, floor: Number(form.floor) };
      if (editId) {
        await patch(`/property/units/${editId}`, body);
        toast("Room unit updated");
      } else {
        await post("/property/units", body);
        toast("Room unit created");
      }
      setFormOpen(false);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
    setSaving(false);
  };

  const handleHousekeeping = async (id: string, status: string) => {
    try {
      await patch(`/property/units/${id}/housekeeping`, { housekeepingStatus: status });
      toast("Housekeeping status updated");
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const columns: Column<RoomUnit>[] = [
    { key: "roomNumber", label: "Room #", sortable: true },
    { key: "floor", label: "Floor", sortable: true },
    { key: "roomType", label: "Room Type", render: (r) => r.roomType.name },
    { key: "status", label: "Status", render: (r) => <Badge value={r.status} /> },
    { key: "housekeepingStatus", label: "Housekeeping", render: (r) => (
      <select
        value={r.housekeepingStatus}
        onChange={(e) => handleHousekeeping(r.id, e.target.value)}
        className="text-xs border border-zinc-200 rounded px-2 py-1 bg-white"
      >
        <option value="clean">Clean</option>
        <option value="dirty">Dirty</option>
        <option value="in_progress">In Progress</option>
        <option value="inspected">Inspected</option>
      </select>
    )},
    { key: "actions", label: "", render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => openEdit(r)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100" title="Edit"><FiEdit2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Room Units" description="Manage individual room units" actions={
        <div className="flex gap-2">
          <Link href="/admin/rooms/types" className="px-3 py-2 text-sm border border-zinc-200 rounded hover:bg-zinc-50">Room Types</Link>
          <button onClick={openCreate} className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800">Add Room Unit</button>
        </div>
      } />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Edit Room Unit" : "New Room Unit"} footer={
        <>
          <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <FormField label="Room Number" required><Input value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} /></FormField>
          <FormField label="Floor" required><Input type="number" value={form.floor} onChange={(e) => set("floor", e.target.value)} /></FormField>
          <FormField label="Room Type" required>
            <Select value={form.roomTypeId} onChange={(e) => set("roomTypeId", e.target.value)}>
              <option value="">Select room type</option>
              {roomTypes.map((rt) => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="available">Available</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </Select>
          </FormField>
        </div>
      </Modal>

    </div>
  );
}

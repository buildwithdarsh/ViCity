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
import { FiWifi, FiDroplet, FiWind, FiCoffee, FiTruck, FiActivity, FiShoppingBag, FiHeart, FiPackage, FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";

const iconMap: Record<string, React.ReactNode> = {
  wifi: <FiWifi />,
  pool: <FiDroplet />,
  ac: <FiWind />,
  "room-service": <FiCoffee />,
  parking: <FiTruck />,
  gym: <FiActivity />,
  restaurant: <FiShoppingBag />,
  spa: <FiHeart />,
  laundry: <FiPackage />,
  minibar: <FiStar />,
};

/** Local admin amenity shape — SDK admin.property.getAmenities returns unknown[].
 *  Includes category/isActive not in SDK's PropertyType amenity sub-type. Keep until SDK adds a typed response. */
interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: string;
  isActive: boolean;
}

const emptyForm = { name: "", icon: "", category: "comfort" };

export default function AmenitiesPage() {
  const { data, loading, refetch } = useApiList<Amenity>("/property/amenities");
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setFormOpen(true); };
  const openEdit = (a: Amenity) => {
    setEditId(a.id);
    setForm({ name: a.name, icon: a.icon, category: a.category });
    setFormOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await patch(`/property/amenities/${editId}`, form);
        toast("Amenity updated");
      } else {
        await post("/property/amenities", form);
        toast("Amenity created");
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
      await del(`/property/amenities/${deleteId}`);
      toast("Amenity deleted");
      setDeleteId(null);
      refetch();
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed", "error");
    }
  };

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const columns: Column<Amenity>[] = [
    { key: "icon", label: "Icon", render: (r) => <span className="text-lg text-zinc-700">{iconMap[r.icon] ?? r.icon}</span> },
    { key: "name", label: "Name", sortable: true },
    { key: "category", label: "Category", render: (r) => <Badge value={r.category} /> },
    { key: "actions", label: "", render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded hover:bg-zinc-100" title="Edit"><FiEdit2 size={15} /></button>
        <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete"><FiTrash2 size={15} /></button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Amenities" description="Manage villa amenities" actions={
        <button onClick={openCreate} className="px-3 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800">Add Amenity</button>
      } />

      <DataTable columns={columns} data={data} loading={loading} />

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editId ? "Edit Amenity" : "New Amenity"} footer={
        <>
          <button onClick={() => setFormOpen(false)} className="px-4 py-2 text-sm border border-zinc-200 rounded">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded disabled:opacity-50">
            {saving ? "Saving..." : "Save"}
          </button>
        </>
      }>
        <div className="space-y-4">
          <FormField label="Name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></FormField>
          <FormField label="Icon"><Input value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="e.g. wifi, pool" /></FormField>
          <FormField label="Category" required>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="comfort">Comfort</option>
              <option value="connectivity">Connectivity</option>
              <option value="leisure">Leisure</option>
              <option value="service">Service</option>
              <option value="facility">Facility</option>
            </Select>
          </FormField>
        </div>
      </Modal>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Amenity" message="Are you sure? This amenity will be permanently removed." confirmLabel="Delete" destructive />
    </div>
  );
}

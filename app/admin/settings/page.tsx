"use client";

import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import { patch } from "@/lib/admin/api";
import PageHeader from "../components/PageHeader";
import FormField, { Input } from "../components/FormField";
import { useToast } from "../components/Toast";
import { SkeletonForm } from "../components/Skeleton";

/** Local admin settings shape — SDK admin.settings.getAll returns Record<string, unknown>.
 *  This is a property-specific settings form; keep until SDK exports a typed admin settings response. */
interface Settings {
  id: string;
  // branding
  name: string;
  address: string;
  phone: string;
  email: string;
  // property
  check_in_time: string | null;
  check_out_time: string | null;
  booking_hold_minutes: number | null;
  advance_payment_percent: number | null;
  currency: string | null;
  currency_symbol: string | null;
  timezone: string | null;
  tax_rate: number | null;
  tax_label: string | null;
  max_guests_included: number | null;
  extra_guest_charge: number | null;
  min_nights: number | null;
  max_nights: number | null;
}

// Fields stored in paise that admins enter in rupees
const PAISE_FIELDS: (keyof Settings)[] = ["extra_guest_charge"];

export default function SettingsPage() {
  const { data, loading } = useApi<Settings>("/settings");
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Settings>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Convert paise fields to rupees for display
      const display = { ...data };
      for (const key of PAISE_FIELDS) {
        const val = display[key];
        if (typeof val === "number") {
          (display as Record<string, unknown>)[key] = val / 100;
        }
      }
      setForm(display);
    }
  }, [data]);

  const set = (key: keyof Settings, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert rupee fields back to paise before saving
      const payload = { ...form };
      for (const key of PAISE_FIELDS) {
        const val = payload[key];
        if (typeof val === "number") {
          (payload as Record<string, unknown>)[key] = Math.round(val * 100);
        }
      }
      await patch("/settings", payload);
      toast("Settings saved");
    } catch (e: unknown) {
      toast(e instanceof Error ? e.message : "Failed to save", "error");
    }
    setSaving(false);
  };

  if (loading) return <div><PageHeader title="Settings" /><SkeletonForm /></div>;

  return (
    <div>
      <PageHeader
        title="System Settings"
        description="Configure villa-wide operational settings"
        actions={
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50">
            {saving ? "Saving..." : "Save Settings"}
          </button>
        }
      />

      <div className="max-w-2xl space-y-8">
        {/* General */}
        <section className="border border-zinc-200 rounded bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">General</h2>
          <div className="space-y-4">
            <FormField label="Property Name"><Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} /></FormField>
            <FormField label="Address"><Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Phone"><Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} /></FormField>
              <FormField label="Email"><Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} /></FormField>
            </div>
          </div>
        </section>

        {/* Operations */}
        <section className="border border-zinc-200 rounded bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Operations</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Check-in Time"><Input type="time" value={form.check_in_time || ""} onChange={(e) => set("check_in_time", e.target.value)} /></FormField>
              <FormField label="Check-out Time"><Input type="time" value={form.check_out_time || ""} onChange={(e) => set("check_out_time", e.target.value)} /></FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Booking Hold Duration (minutes)">
                <Input type="number" value={form.booking_hold_minutes ?? ""} onChange={(e) => set("booking_hold_minutes", Number(e.target.value))} />
              </FormField>
              <FormField label="Min Nights per Booking">
                <Input type="number" min={1} max={365} value={form.min_nights ?? ""} onChange={(e) => set("min_nights", Number(e.target.value))} />
                <p className="text-xs text-zinc-400 mt-1">Minimum stay length guests must book</p>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Max Nights per Booking">
                <Input type="number" min={1} max={365} value={form.max_nights ?? ""} onChange={(e) => set("max_nights", Number(e.target.value))} />
                <p className="text-xs text-zinc-400 mt-1">Maximum stay length guests can book</p>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Currency Code"><Input value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} placeholder="INR" /></FormField>
              <FormField label="Currency Symbol"><Input value={form.currency_symbol || ""} onChange={(e) => set("currency_symbol", e.target.value)} placeholder="₹" /></FormField>
            </div>
            <FormField label="Timezone"><Input value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} placeholder="Asia/Kolkata" /></FormField>
          </div>
        </section>

        {/* Financial */}
        <section className="border border-zinc-200 rounded bg-white p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Financial</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tax Rate (%)">
                <Input type="number" step="0.01" value={form.tax_rate ?? ""} onChange={(e) => set("tax_rate", Number(e.target.value))} />
              </FormField>
              <FormField label="Tax Label">
                <Input value={form.tax_label || ""} onChange={(e) => set("tax_label", e.target.value)} placeholder="GST" />
              </FormField>
            </div>
            <FormField label="Advance Payment (%)">
              <Input type="number" min={1} max={100} value={form.advance_payment_percent ?? ""} onChange={(e) => set("advance_payment_percent", Number(e.target.value))} />
              <p className="text-xs text-zinc-400 mt-1">Percentage of total charged for partial/advance payments</p>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Guests Included in Base Price">
                <Input type="number" min={1} value={form.max_guests_included ?? ""} onChange={(e) => set("max_guests_included", Number(e.target.value))} />
                <p className="text-xs text-zinc-400 mt-1">Extra charges apply beyond this count</p>
              </FormField>
              <FormField label="Extra Guest Charge (₹/night)">
                <Input type="number" min={0} value={form.extra_guest_charge ?? ""} onChange={(e) => set("extra_guest_charge", Number(e.target.value))} />
                <p className="text-xs text-zinc-400 mt-1">Per extra guest per night (e.g. 1500 = ₹1,500)</p>
              </FormField>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

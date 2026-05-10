"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheck, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { TZ } from "@/lib/tz";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const { openLoginModal, token: authToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();
    if (!token) { openLoginModal(true); return; }
    TZ.storefront.auth.me()
      .then((profile) => {
        const u = profile as unknown as User;
        setUser(u);
        setForm({ name: u.name ?? "", email: u.email ?? "", phone: u.phone ?? "" });
      })
      .catch(() => openLoginModal(true));
  }, [openLoginModal, authToken]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await TZ.storefront.auth.updateProfile({
        name: form.name, ...(form.email ? { email: form.email } : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords don't match");
      return;
    }
    setPwSaving(true);
    setPwError("");
    setPwSaved(false);
    try {
      await TZ.storefront.auth.changePassword({
        currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword,
      });
      setPwSaved(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : "Failed to change password");
    }
    setPwSaving(false);
  };

  if (!user) return (
    <div className="pt-20 sm:pt-28 pb-20 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-6">
        <div className="h-4 w-28 bg-zinc-100 rounded mb-6" />
        <div className="h-8 w-32 bg-zinc-100 rounded mb-8" />
        <div className="animate-pulse bg-white rounded-3xl p-8 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-zinc-100 rounded" />
              <div className="h-11 w-full bg-zinc-50 rounded-xl" />
            </div>
          ))}
          <div className="h-12 w-full bg-zinc-100 rounded-xl mt-6" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pt-20 sm:pt-28 pb-24 sm:pb-20 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-6">
        <div>
          <Link href="/account" className="hidden sm:inline-flex items-center gap-2 text-zinc-500 hover:text-charcoal text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to Account
          </Link>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mb-5 sm:mb-8">Profile</h1>

          {/* Profile Information */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8">
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Phone Number</label>
                <input type="tel" value={user.phone ?? ""} disabled className="w-full border border-zinc-100 rounded-xl px-4 py-2.5 text-sm bg-zinc-50 text-zinc-500" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 outline-none" />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Email <span className="text-zinc-400">(optional)</span></label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 outline-none" placeholder="you@example.com" />
              </div>
            </div>

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
            {saved && <p className="mt-4 text-green-600 text-sm flex items-center gap-1"><FiCheck size={14} /> Profile updated successfully</p>}

            <button onClick={handleSave} disabled={saving} className="mt-5 w-full bg-gold-500 text-white py-2.5 rounded-xl hover:bg-gold-600 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 mt-4 sm:mt-6">
            <h2 className="text-lg font-serif text-charcoal mb-5 flex items-center gap-2">
              <FiLock size={16} className="text-gold" />
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Current Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    className="w-full border border-zinc-200 rounded-xl px-4 pr-10 py-2.5 text-sm focus:border-gold-500 outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">New Password</label>
                <input
                  type="password"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 outline-none"
                  placeholder="Min 8 characters"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                  className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm focus:border-gold-500 outline-none"
                  placeholder="Repeat new password"
                  required
                />
              </div>

              {pwError && <p className="text-red-500 text-sm">{pwError}</p>}
              {pwSaved && <p className="text-green-600 text-sm flex items-center gap-1"><FiCheck size={14} /> Password changed successfully</p>}

              <button type="submit" disabled={pwSaving} className="w-full bg-charcoal text-white py-2.5 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
                {pwSaving ? "Changing..." : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

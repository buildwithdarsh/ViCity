"use client";

import { useState } from "react";
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  showLinks?: boolean;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin, showLinks = true }: RegisterFormProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Full name is required"); return; }
    if (!form.phone.trim()) { setError("Phone number is required"); return; }
    if (form.phone.trim().length < 10) { setError("Phone number must be at least 10 digits"); return; }
    if (!form.password.trim()) { setError("Password is required"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      setError("Password must contain uppercase, lowercase, and a number");
      return;
    }
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setLoading(true);
    setError("");
    try {
      await register({
        name: form.name,
        phone: form.phone,
        password: form.password,
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
      });
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Full Name</label>
        <div className="relative">
          <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50" placeholder="John Doe" required />
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Phone Number</label>
        <div className="relative">
          <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50" placeholder="+91 98765 43210" required />
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Email <span className="text-zinc-400">(optional)</span></label>
        <div className="relative">
          <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50" placeholder="you@example.com" />
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Password</label>
        <div className="relative">
          <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => set("password", e.target.value)} className="w-full border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50" placeholder="Min 8 characters" required />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Confirm Password</label>
        <div className="relative">
          <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50" placeholder="Repeat password" required />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading} className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
        {loading ? "Creating account..." : "Create Account"}
      </button>

      {showLinks && onSwitchToLogin && (
        <p className="text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-gold-600 hover:text-gold-700 font-medium">
            Sign In
          </button>
        </p>
      )}
    </form>
  );
}

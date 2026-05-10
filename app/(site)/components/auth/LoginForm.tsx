"use client";

import { useState } from "react";
import { FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onSwitchToRegister?: () => void;
  showLinks?: boolean;
}

export default function LoginForm({ onSuccess, onForgotPassword, onSwitchToRegister, showLinks = true }: LoginFormProps) {
  const { login, demoLogin } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");
    try {
      await demoLogin();
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Demo login failed");
    }
    setDemoLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError("Phone number is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }
    setLoading(true);
    setError("");
    try {
      await login(phone, password);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Phone Number</label>
        <div className="relative">
          <FiPhone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50"
            placeholder="+91 98765 43210"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-600 mb-1.5 block">Password</label>
        <div className="relative">
          <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      {onForgotPassword && (
        <div className="flex items-center justify-end">
          <button type="button" onClick={onForgotPassword} className="text-sm text-gold-600 hover:text-gold-700">
            Forgot password?
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="relative flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-zinc-200" />
        <span className="text-xs text-zinc-400">or</span>
        <div className="flex-1 h-px bg-zinc-200" />
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        disabled={demoLoading}
        className="w-full border border-gold-300 text-gold-700 py-3 rounded-xl hover:bg-gold-50 transition-all disabled:opacity-60 text-sm font-medium"
      >
        {demoLoading ? "Loading demo..." : "Try Demo Account"}
      </button>
      <p className="text-center text-xs text-zinc-400">
        Explore with a pre-configured demo account
      </p>

      {showLinks && onSwitchToRegister && (
        <p className="text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSwitchToRegister} className="text-gold-600 hover:text-gold-700 font-medium">
            Sign Up
          </button>
        </p>
      )}
    </form>
  );
}

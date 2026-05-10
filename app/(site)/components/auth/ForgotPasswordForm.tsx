"use client";

import { useState, useEffect } from "react";
import { FiPhone, FiLock, FiEye, FiEyeOff, FiShield, FiCheck } from "react-icons/fi";
import { TZ } from "@/lib/tz";

type Step = "phone" | "otp" | "reset" | "done";

interface ForgotPasswordFormProps {
  onDone?: () => void;
  onBackToLogin?: () => void;
}

export default function ForgotPasswordForm({ onDone, onBackToLogin }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone.trim() || phone.trim().length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.auth.forgotPassword({ identifier: phone });
      setStep("otp");
      setOtpCooldown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.auth.verifyOtp({
        identifier: phone, type: "reset_password", otp: otpCode,
      });
      setStep("reset");
    } catch (e) {
      setError(e instanceof Error ? e.message : "OTP verification failed");
    }
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError("Password must contain uppercase, lowercase, and a number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.auth.resetPassword({ token: phone, newPassword: password });
      setStep("done");
      onDone?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to reset password");
    }
    setLoading(false);
  };

  if (step === "done") {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck size={24} className="text-green-600" />
        </div>
        <h2 className="text-xl font-serif text-charcoal">Password Reset Successful</h2>
        <p className="mt-2 text-zinc-500 text-sm">
          Your password has been updated. You can now sign in with your new password.
        </p>
        {onBackToLogin && (
          <button onClick={onBackToLogin} className="mt-6 text-gold-600 hover:text-gold-700 text-sm font-medium">
            Sign In
          </button>
        )}
      </div>
    );
  }

  if (step === "reset") {
    return (
      <>
        <h2 className="text-xl font-serif text-charcoal mb-2">Set New Password</h2>
        <p className="text-zinc-500 text-sm mb-6">Enter your new password below</p>
        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label className="text-sm text-zinc-600 mb-1.5 block">New Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50"
                placeholder="Enter new password"
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-zinc-600 mb-1.5 block">Confirm Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-gold-500 outline-none transition-colors bg-cream/50"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </>
    );
  }

  if (step === "otp") {
    return (
      <>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-3">
            <FiShield size={24} className="text-gold-500" />
          </div>
          <h2 className="text-xl font-serif text-charcoal">Verify OTP</h2>
          <p className="mt-1 text-zinc-500 text-sm">Enter the 6-digit code sent to {phone}</p>
        </div>
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono focus:border-gold-500 outline-none transition-colors bg-cream/50"
            placeholder="------"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <div className="text-center">
            <button type="button" onClick={() => handleSendOtp()} disabled={otpCooldown > 0 || loading} className="text-sm text-zinc-400 hover:text-gold-600 transition-colors disabled:opacity-40">
              {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
        {onBackToLogin && (
          <p className="mt-6 text-center text-sm text-zinc-500">
            <button onClick={onBackToLogin} className="text-gold-600 hover:text-gold-700">Back to Sign In</button>
          </p>
        )}
      </>
    );
  }

  // Phone step
  return (
    <>
      <h2 className="text-xl font-serif text-charcoal mb-2">Reset Password</h2>
      <p className="text-zinc-500 text-sm mb-6">Enter your phone number and we&apos;ll send you an OTP</p>
      <form onSubmit={handleSendOtp} className="space-y-5">
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium">
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
      {onBackToLogin && (
        <p className="mt-6 text-center text-sm text-zinc-500">
          <button onClick={onBackToLogin} className="text-gold-600 hover:text-gold-700">Back to Sign In</button>
        </p>
      )}
    </>
  );
}

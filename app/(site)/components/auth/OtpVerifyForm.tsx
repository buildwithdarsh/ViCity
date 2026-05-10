"use client";

import { useState, useEffect, useCallback } from "react";
import { FiShield } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { TZ } from "@/lib/tz";

interface OtpVerifyFormProps {
  onVerified?: () => void;
}

export default function OtpVerifyForm({ onVerified }: OtpVerifyFormProps) {
  const { pendingOtpPhone, markPhoneVerified } = useAuth();
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSend = useCallback(async () => {
    if (!pendingOtpPhone) return;
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.auth.sendOtp({
        identifier: pendingOtpPhone, type: "register",
      });
      setSent(true);
      setCooldown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send OTP");
    }
    setLoading(false);
  }, [pendingOtpPhone]);

  const handleVerify = async () => {
    if (!otpCode || otpCode.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.auth.verifyOtp({
        identifier: pendingOtpPhone!, type: "register", otp: otpCode,
      });
      markPhoneVerified();
      onVerified?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "OTP verification failed");
    }
    setLoading(false);
  };

  if (!pendingOtpPhone) return null;

  return (
    <div>
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-3">
          <FiShield size={24} className="text-gold-500" />
        </div>
        <h2 className="text-xl font-serif text-charcoal">Verify Your Phone</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {sent
            ? `Enter the 6-digit code sent to ${pendingOtpPhone}`
            : `We'll send a verification code to ${pendingOtpPhone}`}
        </p>
      </div>

      {!sent ? (
        <div className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-600 mb-1.5 block">Enter OTP</label>
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
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={handleVerify}
            disabled={loading || otpCode.length !== 6}
            className="w-full bg-charcoal text-white py-3 rounded-xl hover:bg-charcoal/90 transition-all disabled:opacity-60 uppercase tracking-wider text-sm font-medium"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
          <div className="text-center">
            <button onClick={handleSend} disabled={cooldown > 0 || loading} className="text-sm text-zinc-400 hover:text-gold-600 transition-colors disabled:opacity-40">
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiUsers, FiShield, FiCreditCard, FiArrowLeft, FiMinus, FiPlus, FiCheck, FiClock, FiAlertTriangle, FiX, FiStar, FiWifi, FiDroplet } from "react-icons/fi";
import { LuTreePalm } from "react-icons/lu";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "../components/AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";
import DateRangePicker from "../components/DateRangePicker";
import { formatCurrency } from "@/lib/utils/currency";
import { TZ } from "@/lib/tz";
import type { StorefrontConfig } from "@buildwithdarsh/sdk";
import { useAuth } from "../hooks/useAuth";

function CountdownTimer({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  });
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    const interval = setInterval(() => {
      const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        clearInterval(interval);
        onExpireRef.current();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining <= 120;

  return (
    <div className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium ${
      isUrgent ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-800 border border-amber-200"
    }`}>
      <FiClock size={14} className="shrink-0" />
      <span>
        Dates held for <span className="font-mono font-bold">{mins}:{String(secs).padStart(2, "0")}</span>
        {" "}&mdash; complete payment to confirm
      </span>
    </div>
  );
}

async function getGuestSessionId(): Promise<string> {
  const key = "guest_session_id";
  const id = localStorage.getItem(key);
  if (id) return id;

  try {
    const raw = await TZ.client.rawRequest<{ guestId: string }>('POST', '/storefront/auth/guest', { body: {}, scope: 'public', sendOrgKey: true });
    const result = raw.data;
    if (result?.guestId) {
      localStorage.setItem(key, result.guestId);
      return result.guestId;
    }
  } catch {
    // fallback
  }
  const fallback = crypto.randomUUID();
  localStorage.setItem(key, fallback);
  return fallback;
}

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const initialCheckIn = searchParams.get("checkIn") || tomorrow.toISOString().split("T")[0]!;
  const paramCheckOut = searchParams.get("checkOut");
  // Ensure check-out is always after check-in: if missing or <= check-in, default to check-in + minNights
  const initialCheckOut = (() => {
    if (paramCheckOut && paramCheckOut > initialCheckIn) return paramCheckOut;
    const d = new Date(initialCheckIn + "T00:00:00");
    d.setDate(d.getDate() + 1); // at least +1; useEffect will bump to minNights once settings load
    return d.toISOString().split("T")[0]!;
  })();

  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(Number(searchParams.get("guests")) || 2);
  const [form, setForm] = useState({ name: "", email: "", phone: "", specialRequests: "" });
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setIsLoggedIn] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [localConfirmed, setLocalConfirmed] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [unavailableDatesList, setUnavailableDatesList] = useState<string[]>([]);
  const [dateRedirectNotice, setDateRedirectNotice] = useState<{ originalIn: string; originalOut: string } | null>(null);

  // Hold state
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);
  const [, setBookingData] = useState<{ id: string; bookingReference: string } | null>(null);
  const [roomTypeId, setRoomTypeId] = useState("");
  const [resolvedBase, setResolvedBase] = useState(0);
  const [extraGuestCharge, setExtraGuestCharge] = useState(0);
  const [extraGuestCount, setExtraGuestCount] = useState(0);
  const [extraGuestPerNight, setExtraGuestPerNight] = useState(0);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Config from system settings
  const [taxRate, setTaxRate] = useState(18);
  const [taxLabel, setTaxLabel] = useState("GST");
  const [advancePercent, setAdvancePercent] = useState(50);
  const [maxGuestsIncluded, setMaxGuestsIncluded] = useState(6);
  const [minNights, setMinNights] = useState(1);
  const [maxNights, setMaxNights] = useState(21);

  // Auto-correct check-out if it's on or before check-in, or below minNights
  useEffect(() => {
    if (checkIn && checkOut) {
      const ciParts = checkIn.split("-").map(Number);
      const coParts = checkOut.split("-").map(Number);
      const ci = new Date(ciParts[0]!, ciParts[1]! - 1, ciParts[2]!);
      const co = new Date(coParts[0]!, coParts[1]! - 1, coParts[2]!);
      const nights = Math.round((co.getTime() - ci.getTime()) / 86400000);
      if (nights < minNights) {
        const d = new Date(ci);
        d.setDate(d.getDate() + minNights);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        setCheckOut(`${y}-${m}-${day}`);
      }
    }
  }, [checkIn, checkOut, minNights]);

  const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000) : 0;
  const afterDiscount = resolvedBase - couponDiscount;
  const taxableAmount = afterDiscount + extraGuestCharge;
  const estimatedTax = Math.round((taxableAmount * taxRate) / 100);
  const estimatedTotal = taxableAmount + estimatedTax;
  const advanceAmount = Math.ceil((estimatedTotal * advancePercent) / 100);
  const payNowAmount = paymentType === "partial" ? advanceAmount : estimatedTotal;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    try {
      const result = await TZ.storefront.coupons.validate({ code: couponCode, cartTotal: resolvedBase }) as unknown as { discountAmount: number };
      setCouponDiscount(result.discountAmount);
      setCouponApplied(true);
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon");
      setCouponDiscount(0);
      setCouponApplied(false);
    }
    setValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  // Fetch villa config (roomTypeId + settings) on mount
  useEffect(() => {
    TZ.storefront.config.get()
      .then((config) => {
        const c = config as StorefrontConfig;
        if (c['villaRoomTypeId']) setRoomTypeId(c['villaRoomTypeId'] as string);
        const p = c['property'] as Record<string, string | number | boolean> | undefined;
        if (p?.['tax_rate'] != null) setTaxRate(p['tax_rate'] as number);
        if (p?.['tax_label']) setTaxLabel(p['tax_label'] as string);
        if (p?.['advance_payment_percent'] != null) setAdvancePercent(p['advance_payment_percent'] as number);
        if (p?.['max_guests_included'] != null) setMaxGuestsIncluded(p['max_guests_included'] as number);
        if (p?.['min_nights'] != null) setMinNights(p['min_nights'] as number);
        if (p?.['max_nights'] != null) setMaxNights(p['max_nights'] as number);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  // Resolve accurate pricing from backend when dates, room type, or guests change
  useEffect(() => {
    if (!roomTypeId || !checkIn || !checkOut || nights <= 0) {
      setResolvedBase(0);
      setExtraGuestCharge(0);
      setExtraGuestCount(0);
      setPricingLoading(false);
      return;
    }
    setPricingLoading(true);
    TZ.storefront.property.resolvePrice({ propertyTypeId: roomTypeId, checkIn: checkIn, checkOut: checkOut, guests: guests })
      .then((res) => {
        const r = res as unknown as { roomPrice?: number; extraGuestCharge?: number; extraGuests?: number; extraGuestPerNight?: number };
        if (r?.roomPrice != null) setResolvedBase(r.roomPrice);
        setExtraGuestCharge(r?.extraGuestCharge ?? 0);
        setExtraGuestCount(r?.extraGuests ?? 0);
        setExtraGuestPerNight(r?.extraGuestPerNight ?? 0);
      })
      .catch(() => {})
      .finally(() => setPricingLoading(false));
  }, [roomTypeId, checkIn, checkOut, nights, guests]);

  // Fetch blocked dates (reusable)
  const fetchBlockedDates = useCallback(async (): Promise<Set<string>> => {
    try {
      const now = new Date();
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const futureMonth = new Date(now.getFullYear(), now.getMonth() + 6, 0);
      const end = `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, "0")}-${futureMonth.getDate()}`;

      const calData = await TZ.storefront.property.checkAvailability({ propertyTypeId: '', checkIn: start, checkOut: end }) as unknown as Record<string, { dates: { date: string; available: number; isBlocked: boolean }[] }> | null;
      if (calData) {
        const blocked = new Set<string>();
        for (const entry of Object.values(calData) as { dates: { date: string; available: number; isBlocked: boolean }[] }[]) {
          for (const d of entry.dates) {
            if (d.isBlocked || d.available === 0) {
              blocked.add(d.date);
            }
          }
        }
        setBlockedDates(blocked);
        return blocked;
      }
    } catch { /* ignore */ }
    return new Set<string>();
  }, []);

  // Fetch on mount + auto-suggest if preselected dates are blocked
  useEffect(() => {
    fetchBlockedDates().then((blocked) => {
      if (blocked.size === 0) return;

      // Check if any preselected date is blocked
      const ci = new Date(checkIn);
      const co = new Date(checkOut);
      const requestedNights = Math.max(1, Math.ceil((co.getTime() - ci.getTime()) / 86400000));
      let hasConflict = false;
      const cursor = new Date(ci);
      while (cursor < co) {
        const ds = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        if (blocked.has(ds)) { hasConflict = true; break; }
        cursor.setDate(cursor.getDate() + 1);
      }

      if (!hasConflict) return;

      // Find next available window of same length
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const searchStart = new Date(today);
      searchStart.setDate(searchStart.getDate() + 1);
      const maxSearch = new Date(today);
      maxSearch.setMonth(maxSearch.getMonth() + 6);

      const candidate = new Date(searchStart);
      while (candidate < maxSearch) {
        let windowOk = true;
        const windowEnd = new Date(candidate);
        windowEnd.setDate(windowEnd.getDate() + requestedNights);
        const check = new Date(candidate);
        while (check < windowEnd) {
          const ds = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, "0")}-${String(check.getDate()).padStart(2, "0")}`;
          if (blocked.has(ds)) { windowOk = false; break; }
          check.setDate(check.getDate() + 1);
        }
        if (windowOk) {
          const newCheckIn = `${candidate.getFullYear()}-${String(candidate.getMonth() + 1).padStart(2, "0")}-${String(candidate.getDate()).padStart(2, "0")}`;
          const newCheckOut = `${windowEnd.getFullYear()}-${String(windowEnd.getMonth() + 1).padStart(2, "0")}-${String(windowEnd.getDate()).padStart(2, "0")}`;
          setDateRedirectNotice({ originalIn: checkIn, originalOut: checkOut });
          setCheckIn(newCheckIn);
          setCheckOut(newCheckOut);
          return;
        }
        candidate.setDate(candidate.getDate() + 1);
      }

      // No available window found — just clear dates
      setDateRedirectNotice({ originalIn: checkIn, originalOut: checkOut });
      setCheckIn("");
      setCheckOut("");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch logged in user
  useEffect(() => {
    const token = TZ.storefront.auth.getToken();
    if (token) {
      setIsLoggedIn(true);
      TZ.storefront.auth.me()
        .then((profile) => {
          if (profile) {
            setForm((f) => ({
              ...f,
              name: profile.name || f.name,
              email: profile.email || f.email,
              phone: profile.phone || f.phone,
            }));
          }
        })
        .catch(() => {});
    }
  }, []);

  // Check for active hold on mount (survives page refresh)
  useEffect(() => {
    (async () => {
      try {
        void getGuestSessionId(); // session ID kept for future hold endpoint
        // Hold endpoint not available on storefront -- return empty to prevent 404
        const holdData: { holdId?: string; expiresAt?: string; bookingId?: string; bookingReference?: string } = {};
        if (holdData?.holdId && holdData?.expiresAt) {
          const expires = new Date(holdData.expiresAt);
          if (expires > new Date()) {
            setHoldExpiresAt(holdData.expiresAt);
            if (holdData.bookingId) {
              setBookingData({
                id: holdData.bookingId,
                bookingReference: holdData.bookingReference || "",
              });
            }
          }
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Silently sync dates & guests to URL query params for refresh persistence
  useEffect(() => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", String(guests));
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    if (newUrl !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [checkIn, checkOut, guests]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const razorpayRef = useRef<any>(null);

  const handleHoldExpired = useCallback(() => {
    // Close Razorpay checkout if open
    if (razorpayRef.current) {
      try { razorpayRef.current.close(); } catch { /* ignore */ }
      razorpayRef.current = null;
    }
    setHoldExpired(true);
    setHoldExpiresAt(null);
    setBookingData(null);
    setLoading(false);
  }, []);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    const phone = otpPhone || form.phone;
    if (!phone || phone.length < 10) {
      setOtpError("Please enter a valid phone number");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await TZ.storefront.auth.sendOtp({
        identifier: phone, type: "booking",
      });
      setOtpSent(true);
      setOtpCooldown(60);
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "Failed to send OTP");
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    const phone = otpPhone || form.phone;
    if (!otpCode || otpCode.length !== 6) {
      setOtpError("Please enter the 6-digit OTP");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const authRes = await TZ.storefront.auth.verifyOtp({
        identifier: phone, type: "booking", otp: otpCode,
      });

      if (authRes.accessToken) {
        // SDK verifyOtp already saves tokens internally
        setIsLoggedIn(true);
        // Sync auth context so Navbar updates immediately
        refreshAuth();
      }

      // Pre-fill form from user data if available
      if (authRes.user) {
        setForm((f) => ({
          ...f,
          name: f.name || authRes.user.name || f.name,
          email: f.email || authRes.user.email || f.email,
          phone: f.phone || authRes.user.phone || f.phone,
        }));
      }

      setShowOtpModal(false);
      setOtpCode("");
      setOtpSent(false);
      setOtpError("");

      // Now proceed with booking
      proceedWithBooking();
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : "OTP verification failed");
    }
    setOtpLoading(false);
  };

  const handleBookAndPay = async () => {
    if (loading) return;
    if (!form.name || !form.phone) {
      setError("Please fill in name and phone number.");
      return;
    }
    if (nights <= 0) {
      setError("Please select valid dates.");
      return;
    }

    // If not logged in, show OTP modal first
    const token = localStorage.getItem("tss-access-token");
    if (!token) {
      setOtpPhone(form.phone);
      setShowOtpModal(true);
      setOtpSent(false);
      setOtpCode("");
      setOtpError("");
      return;
    }

    proceedWithBooking();
  };

  const proceedWithBooking = async () => {
    setLoading(true);
    setError("");
    setHoldExpired(false);

    try {
      // Step 0: Re-check availability before proceeding
      // Only night dates matter (check-in through checkout-1); checkout date is departure only
      const latestBlocked = await fetchBlockedDates();
      const ciDate = new Date(checkIn);
      const coDate = new Date(checkOut);
      const conflictDates: string[] = [];
      const cursor = new Date(ciDate);
      while (cursor < coDate) {
        const ds = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
        if (latestBlocked.has(ds)) {
          conflictDates.push(ds);
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (conflictDates.length > 0) {
        setLoading(false);
        setUnavailableDatesList(conflictDates);
        setShowUnavailableModal(true);
        return;
      }

      // Step 1: Create booking (this creates a 10-min hold)
      let bookingResult: { id: string; bookingReference: string; holdExpiresAt: string };
      try {
        bookingResult = await TZ.storefront.property.createBooking({
          propertyTypeId: roomTypeId,
          checkIn: checkIn,
          checkOut: checkOut,
          guests: guests,
          customerName: form.name,
          ...(form.email ? { customerEmail: form.email } : {}),
          customerPhone: form.phone,
          ...(form.specialRequests ? { notes: form.specialRequests } : {}),
        }) as unknown as { id: string; bookingReference: string; holdExpiresAt: string };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Booking failed";
        // If the server says dates are unavailable/blocked, show the Oops modal
        if (msg.includes("Not enough rooms") || msg.includes("blocked")) {
          setLoading(false);
          await fetchBlockedDates();
          const dateMatch = msg.match(/\d{4}-\d{2}-\d{2}/);
          setUnavailableDatesList(dateMatch ? [dateMatch[0]] : []);
          setShowUnavailableModal(true);
          return;
        }
        throw err;
      }

      const booking = bookingResult;
      setBookingData({ id: booking.id, bookingReference: booking.bookingReference });
      setHoldExpiresAt(booking.holdExpiresAt);

      // Step 2: Create payment order
      const orderData = await TZ.storefront.property.createPaymentOrder(booking.id, { amount: payNowAmount }) as unknown as { razorpayKeyId: string; amount: number; currency?: string; orderId: string };

      // Mock payment: simulate Razorpay success without loading external script
      console.info("[MOCK PAYMENT]", { orderId: orderData.orderId, amount: orderData.amount, currency: orderData.currency });
      try {
        await TZ.storefront.property.verifyPayment({
          orderId: orderData.orderId,
          razorpayPaymentId: `pay_mock_${Date.now()}`,
          razorpaySignature: `sig_mock_${Date.now()}`,
        });
        router.push(`/booking/confirmation?ref=${booking.bookingReference}&type=${paymentType}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Payment verification failed");
        setLoading(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-sand/40 rounded-lg px-3.5 py-2.5 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none transition-colors placeholder:text-warm-brown/40";
  const canSubmit = form.name && form.phone && checkIn && checkOut && nights > 0 && !loading && !holdExpired && localConfirmed;

  return (
    <div className="pt-24 pb-16 bg-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <FadeIn>
          <Link href="/" className="inline-flex items-center gap-1.5 text-warm-brown hover:text-charcoal text-sm mb-5 transition-colors">
            <FiArrowLeft size={14} /> Back
          </Link>
        </FadeIn>

        {/* Date Redirect Notice */}
        {dateRedirectNotice && (
          <div className="mb-4 flex items-start gap-2 sm:gap-2.5 py-3 px-3 sm:px-4 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs sm:text-sm">
            <FiAlertTriangle size={16} className="shrink-0 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">
                {new Date(dateRedirectNotice.originalIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {" "}&ndash;{" "}
                {new Date(dateRedirectNotice.originalOut).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                {" "}is not available
              </p>
              {checkIn && checkOut && (
                <p className="text-[11px] sm:text-xs text-amber-700/70 mt-0.5">
                  We&apos;ve selected the next available dates for you. Feel free to change them.
                </p>
              )}
            </div>
            <button
              onClick={() => setDateRedirectNotice(null)}
              className="text-amber-500 hover:text-amber-700 transition-colors shrink-0"
            >
              <FiX size={16} />
            </button>
          </div>
        )}

        {/* Hold Timer */}
        {holdExpiresAt && !holdExpired && (
          <div className="mb-4">
            <CountdownTimer expiresAt={holdExpiresAt} onExpire={handleHoldExpired} />
          </div>
        )}

        {/* Hold Expired Banner */}
        {holdExpired && (
          <div className="mb-4 flex items-center gap-2.5 py-3 px-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
            <FiAlertTriangle size={16} className="shrink-0" />
            <div>
              <p className="font-medium">Your hold has expired</p>
              <p className="text-xs text-red-600/70 mt-0.5">The dates have been released. Please try booking again.</p>
            </div>
            <button
              onClick={() => { setHoldExpired(false); setError(""); }}
              className="ml-auto text-xs font-medium bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Main Form */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <FadeIn>
              <div className="bg-white rounded-2xl p-5 md:p-6 border border-sand/20 space-y-5">
                <h1 className="text-lg font-serif text-charcoal">Book ViCity</h1>

                {/* Date Range Picker + Guests */}
                <div className="space-y-3">
                  <DateRangePicker
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={setCheckIn}
                    onCheckOutChange={setCheckOut}
                    blockedDates={blockedDates}
                    onOpen={fetchBlockedDates}
                    minNights={minNights}
                    maxNights={maxNights}
                  />
                  <div>
                    <label className="text-xs text-charcoal/70 mb-1 block">Guests</label>
                    <div className="flex items-center border border-sand/40 rounded-lg h-[42px] bg-cream/30 max-w-[160px]">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="px-3 text-warm-brown/50 hover:text-charcoal transition-colors"><FiMinus size={13} /></button>
                      <span className="flex-1 text-center text-sm text-charcoal">{guests}</span>
                      <button onClick={() => setGuests(Math.min(10, guests + 1))} className="px-3 text-warm-brown/50 hover:text-charcoal transition-colors"><FiPlus size={13} /></button>
                    </div>
                    {guests > maxGuestsIncluded && <p className="text-xs text-terracotta mt-1">Extra charges apply beyond {maxGuestsIncluded} guests</p>}
                  </div>
                </div>

                {/* Guest Info */}
                <div>
                  <h2 className="text-sm font-semibold text-charcoal mb-2.5">Guest Details</h2>
                  <div className="space-y-2.5">
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Full name *" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="Phone *" />
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="Email (optional)" />
                    </div>
                    <textarea value={form.specialRequests} onChange={(e) => setForm({ ...form, specialRequests: e.target.value })} rows={2} className={`${inputClass} resize-none`} placeholder="Special requests (optional)" />
                  </div>
                </div>

                {/* Coupon Code */}
                <div>
                  <h2 className="text-sm font-semibold text-charcoal mb-2.5">Coupon Code</h2>
                  {couponApplied ? (
                    <div className="flex items-center gap-2 py-2.5 px-3.5 rounded-lg bg-green-50 border border-green-200">
                      <FiCheck size={14} className="text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 font-medium flex-1">{couponCode.toUpperCase()} applied &mdash; {formatCurrency(couponDiscount)} off</span>
                      <button onClick={handleRemoveCoupon} className="text-green-600 hover:text-green-800 transition-colors"><FiX size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                        className={`${inputClass} flex-1 uppercase`}
                        placeholder="Enter coupon code"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || validatingCoupon}
                        className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-charcoal text-white rounded-lg hover:bg-charcoal/90 disabled:opacity-40 transition-all whitespace-nowrap"
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                </div>

                {/* Payment Type */}
                <div>
                  <h2 className="text-sm font-semibold text-charcoal mb-2.5">Payment Option</h2>
                  {pricingLoading || settingsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-pulse">
                      <div className="p-3.5 rounded-xl border-2 border-sand/30 flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2">
                        <div className="flex-1 sm:flex-none space-y-1.5">
                          <div className="h-4 w-20 bg-sand/40 rounded" />
                          <div className="h-3 w-20 bg-sand/30 rounded" />
                        </div>
                        <div className="h-6 w-24 bg-sand/40 rounded" />
                      </div>
                      <div className="p-3.5 rounded-xl border-2 border-sand/30 flex items-center sm:flex-col sm:items-start gap-3 sm:gap-2">
                        <div className="flex-1 sm:flex-none space-y-1.5">
                          <div className="h-4 w-24 bg-sand/40 rounded" />
                          <div className="h-3 w-28 bg-sand/30 rounded" />
                        </div>
                        <div className="h-6 w-20 bg-sand/40 rounded" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className={`relative flex items-center sm:flex-col sm:items-start gap-3 sm:gap-0 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentType === "full" ? "border-gold bg-gold/5" : "border-sand/30 hover:border-sand/50"}`}>
                        <input type="radio" name="pt" value="full" checked={paymentType === "full"} onChange={() => setPaymentType("full")} className="sr-only" />
                        <div className={`sm:hidden w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${paymentType === "full" ? "border-gold bg-gold" : "border-sand/40"}`}>
                          {paymentType === "full" && <FiCheck size={12} className="text-white" />}
                        </div>
                        {paymentType === "full" && <div className="hidden sm:flex absolute top-2 right-2 w-4 h-4 rounded-full bg-gold items-center justify-center"><FiCheck size={10} className="text-white" /></div>}
                        <div className="flex-1 sm:flex-none">
                          <span className="text-sm font-semibold text-charcoal block">Pay in Full</span>
                          <span className="text-[11px] text-warm-brown/50 block sm:mt-0.5">No balance due</span>
                        </div>
                        <span className="text-lg font-serif text-charcoal sm:mt-1">{formatCurrency(estimatedTotal)}</span>
                      </label>
                      <label className={`relative flex items-center sm:flex-col sm:items-start gap-3 sm:gap-0 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${paymentType === "partial" ? "border-gold bg-gold/5" : "border-sand/30 hover:border-sand/50"}`}>
                        <input type="radio" name="pt" value="partial" checked={paymentType === "partial"} onChange={() => setPaymentType("partial")} className="sr-only" />
                        <div className={`sm:hidden w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${paymentType === "partial" ? "border-gold bg-gold" : "border-sand/40"}`}>
                          {paymentType === "partial" && <FiCheck size={12} className="text-white" />}
                        </div>
                        {paymentType === "partial" && <div className="hidden sm:flex absolute top-2 right-2 w-4 h-4 rounded-full bg-gold items-center justify-center"><FiCheck size={10} className="text-white" /></div>}
                        <div className="flex-1 sm:flex-none">
                          <span className="text-sm font-semibold text-charcoal block">{advancePercent}% Advance</span>
                          <span className="text-[11px] text-warm-brown/50 block sm:mt-0.5">Balance before check-in</span>
                        </div>
                        <span className="text-lg font-serif text-charcoal sm:mt-1">{formatCurrency(advanceAmount)}</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Local Restriction */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={localConfirmed}
                      onChange={(e) => setLocalConfirmed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-amber-300 text-gold focus:ring-gold/30 shrink-0 accent-gold"
                    />
                    <span className="text-xs text-amber-800 leading-relaxed">
                      I confirm that I am not a local resident of Your City and I am not booking on behalf of a local party.
                    </span>
                  </label>
                </div>

                {/* All Sales Final Notice */}
                <div className="flex items-start gap-2.5 text-[11px] text-warm-brown/60 bg-cream/60 border border-sand/20 rounded-xl px-4 py-3">
                  <FiShield size={13} className="shrink-0 mt-0.5 text-warm-brown/40" />
                  <span>
                    All bookings are final. By proceeding, you acknowledge that no cancellations or refunds will be provided once payment is completed. For any concerns, please{" "}
                    <Link href="/contact" className="text-gold underline underline-offset-2">contact us</Link> before booking.
                  </span>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  onClick={handleBookAndPay}
                  disabled={!canSubmit || pricingLoading || settingsLoading}
                  className="w-full bg-gold text-charcoal py-3.5 rounded-xl hover:bg-gold/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Processing...
                    </>
                  ) : pricingLoading || settingsLoading ? (
                    <>
                      <FiCreditCard size={14} />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <FiCreditCard size={14} />
                      Book &amp; Pay {formatCurrency(payNowAmount)}
                    </>
                  )}
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 order-1 lg:order-2 flex flex-col gap-4">
            <FadeIn delay={0.05}>
              <div className="bg-white rounded-2xl p-5 border border-sand/20">
                <h2 className="font-serif text-base text-charcoal">ViCity</h2>
                <p className="text-warm-brown/50 text-xs mt-0.5">Entire villa &middot; Private booking</p>

                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-warm-brown">
                    <FiUsers size={13} className="text-gold shrink-0" />
                    <span>{guests} guest{guests > 1 ? "s" : ""}</span>
                  </div>
                </div>

                {nights > 0 && (
                  <div className="mt-3 pt-3 border-t border-sand/20 space-y-1 text-sm">
                    {pricingLoading || settingsLoading ? (
                      <div className="space-y-2.5 animate-pulse">
                        <div className="flex justify-between">
                          <div className="h-4 w-16 bg-sand/40 rounded" />
                          <div className="h-4 w-20 bg-sand/40 rounded" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 w-24 bg-sand/40 rounded" />
                          <div className="h-4 w-16 bg-sand/40 rounded" />
                        </div>
                        <div className="border-t border-sand/20 pt-2 flex justify-between">
                          <div className="h-5 w-12 bg-sand/50 rounded" />
                          <div className="h-5 w-24 bg-sand/50 rounded" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between text-warm-brown">
                          <span>{nights} night{nights > 1 ? "s" : ""}</span>
                          <span className="text-charcoal">{formatCurrency(resolvedBase)}</span>
                        </div>
                        {extraGuestCharge > 0 && (
                          <div className="text-warm-brown">
                            <div className="flex justify-between">
                              <span>Extra guests ({extraGuestCount} &times; {nights}n)</span>
                              <span className="text-charcoal">{formatCurrency(extraGuestCharge)}</span>
                            </div>
                            <p className="text-[10px] text-warm-brown/40 mt-0.5">
                              {formatCurrency(extraGuestPerNight)}/person/night &times; {extraGuestCount} guest{extraGuestCount > 1 ? "s" : ""} &times; {nights} night{nights > 1 ? "s" : ""}
                            </p>
                          </div>
                        )}
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Coupon discount</span>
                            <span>-{formatCurrency(couponDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-warm-brown">
                          <span>Tax ({taxLabel} {taxRate}%)</span>
                          <span className="text-charcoal">{formatCurrency(estimatedTax)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-charcoal pt-2 border-t border-sand/20">
                          <span>Total</span>
                          <span>{formatCurrency(estimatedTotal)}</span>
                        </div>
                        {paymentType === "partial" && (
                          <div className="pt-2 space-y-1 text-xs">
                            <div className="flex justify-between text-gold font-medium">
                              <span>Pay now ({advancePercent}%)</span>
                              <span>{formatCurrency(advanceAmount)}</span>
                            </div>
                            <div className="flex justify-between text-warm-brown/50">
                              <span>Due before check-in</span>
                              <span>{formatCurrency(estimatedTotal - advanceAmount)}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-start gap-2 text-[11px] text-warm-brown/40">
                  <FiShield size={12} className="shrink-0 mt-0.5 text-gold/60" />
                  <span>Secure payment via Razorpay. Your data is encrypted.</span>
                </div>

                <div className="mt-3 pt-3 border-t border-sand/20">
                  <p className="text-[11px] text-gold font-semibold tracking-wide uppercase">Best Price Guarantee</p>
                  <p className="text-[10px] text-warm-brown/40 mt-0.5">Book directly for the lowest rate — guaranteed lower than Airbnb &amp; OTAs.</p>
                </div>
              </div>
            </FadeIn>

            {/* Villa Illustration Card — fills remaining height, hidden on mobile */}
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-1 bg-white rounded-2xl border border-sand/20 overflow-hidden flex-col min-h-[280px]"
            >
              <div className="relative flex-1 min-h-[160px] overflow-hidden group">
                <Image
                  src="/images/living-room-sofa-landscape.webp"
                  alt="ViCity"
                  fill
                  className="object-cover transition-transform duration-[3s] ease-out group-hover:scale-105"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/living-room-sofa-landscape.webp")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                {/* Floating animated elements */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-4 left-4 right-4"
                >
                  <div className="flex items-center gap-1 text-gold mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <FiStar size={10} fill="currentColor" />
                      </motion.span>
                    ))}
                    <span className="text-white/80 text-[10px] ml-1 font-medium">4.9 &middot; Luxury Stay</span>
                  </div>
                  <p className="text-white/90 text-xs font-serif leading-relaxed">
                    &ldquo;An unforgettable stay — pure serenity and elegance&rdquo;
                  </p>
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="p-4 space-y-3"
              >
                <p className="text-xs text-warm-brown/60 leading-relaxed">
                  A private courtyard villa nestled in nature — your exclusive retreat with modern comforts and timeless charm.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: LuTreePalm, label: "Private Garden" },
                    { icon: FiDroplet, label: "Pool Access" },
                    { icon: FiWifi, label: "High-Speed WiFi" },
                    { icon: FiShield, label: "24/7 Security" },
                  ].map(({ icon: Icon, label }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="flex items-center gap-1.5 text-[11px] text-warm-brown/50"
                    >
                      <Icon size={11} className="text-gold/70 shrink-0" />
                      <span>{label}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Oops - Unavailable Modal */}
      {showUnavailableModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl relative">
            <button
              onClick={() => setShowUnavailableModal(false)}
              className="absolute top-3 right-3 text-warm-brown/40 hover:text-charcoal transition-colors"
            >
              <FiX size={18} />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-serif text-charcoal mb-1.5">Oops, you just missed it!</h3>
            <p className="text-sm text-warm-brown/60 mb-2">
              {unavailableDatesList.length > 0 && unavailableDatesList.length < nights ? (
                <>Some of your selected nights overlap with an existing booking.</>
              ) : (
                <>The dates you selected are no longer available. Someone else just booked them.</>
              )}
            </p>
            {unavailableDatesList.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                {unavailableDatesList.slice(0, 5).map((d) => (
                  <span key={d} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    {new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                ))}
                {unavailableDatesList.length > 5 && (
                  <span className="text-xs text-warm-brown/40">+{unavailableDatesList.length - 5} more</span>
                )}
              </div>
            )}
            <p className="text-xs text-warm-brown/40 mb-4">Please choose different dates to continue.</p>
            <button
              onClick={() => {
                setShowUnavailableModal(false);
                setUnavailableDatesList([]);
                setCheckIn("");
                setCheckOut("");
              }}
              className="w-full bg-gold text-charcoal py-3 rounded-xl hover:bg-gold/90 transition-all duration-300 uppercase tracking-wider text-xs font-bold"
            >
              Choose New Dates
            </button>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <button
              onClick={() => { setShowOtpModal(false); setOtpError(""); setOtpCode(""); setOtpSent(false); }}
              className="absolute top-3 right-3 text-warm-brown/40 hover:text-charcoal transition-colors"
            >
              <FiX size={18} />
            </button>

            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-3">
                <FiShield size={24} className="text-gold" />
              </div>
              <h3 className="text-lg font-serif text-charcoal">Verify Your Phone</h3>
              <p className="text-sm text-warm-brown/60 mt-1">
                {otpSent
                  ? `Enter the 6-digit code sent to ${otpPhone || form.phone}`
                  : "We'll send a one-time code to verify your number"}
              </p>
            </div>

            {!otpSent ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-charcoal/70 mb-1 block">Phone Number</label>
                  <input
                    type="tel"
                    value={otpPhone || form.phone}
                    onChange={(e) => setOtpPhone(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your phone number"
                  />
                </div>
                {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
                <button
                  onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full bg-gold text-charcoal py-3 rounded-xl hover:bg-gold/90 transition-all duration-300 disabled:opacity-40 uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Sending...
                    </>
                  ) : "Send OTP"}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-charcoal/70 mb-1 block">Enter OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className={`${inputClass} text-center text-lg tracking-[0.3em] font-mono`}
                    placeholder="------"
                    autoFocus
                  />
                </div>
                {otpError && <p className="text-red-500 text-xs">{otpError}</p>}
                <button
                  onClick={handleVerifyOtp}
                  disabled={otpLoading || otpCode.length !== 6}
                  className="w-full bg-gold text-charcoal py-3 rounded-xl hover:bg-gold/90 transition-all duration-300 disabled:opacity-40 uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
                >
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Verifying...
                    </>
                  ) : "Verify & Continue"}
                </button>
                <div className="text-center">
                  <button
                    onClick={handleSendOtp}
                    disabled={otpCooldown > 0 || otpLoading}
                    className="text-xs text-warm-brown/60 hover:text-gold transition-colors disabled:opacity-40"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return <Suspense><BookingContent /></Suspense>;
}

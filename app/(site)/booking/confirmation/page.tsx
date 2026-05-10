"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiCheck, FiMail } from "react-icons/fi";


function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ref = searchParams.get("ref") || "";
  const type = searchParams.get("type") || "full";
  const isPartial = type === "partial";

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("tss-access-token");
      if (token) {
        router.push("/account/bookings");
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="pt-32 pb-20 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-5 md:px-6 text-center">
        <div>
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-sand/20">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <FiCheck size={30} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-serif text-charcoal">
              {isPartial ? "Advance Payment Received!" : "Payment Successful!"}
            </h1>
            <p className="mt-2 text-warm-brown/60 text-sm">Your booking has been confirmed</p>

            {ref && (
              <div className="mt-5 bg-cream/50 rounded-xl p-5">
                <p className="text-[10px] uppercase tracking-wider text-warm-brown/40 mb-1">Booking Reference</p>
                <p className="text-2xl font-mono text-gold">{ref}</p>
              </div>
            )}

            {isPartial && (
              <div className="mt-4 bg-amber-50 rounded-xl p-4 text-left">
                <p className="text-sm font-medium text-amber-800">Advance payment received</p>
                <p className="text-xs text-amber-600 mt-1">
                  The remaining balance must be paid before check-in. You can pay from your bookings page.
                </p>
              </div>
            )}

            <p className="mt-5 text-sm text-warm-brown/50">
              A confirmation email has been sent. Redirecting to your bookings...
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={() => router.push("/account/bookings")}
                className="block w-full bg-gold text-charcoal py-3 rounded-xl hover:bg-gold/90 transition-all uppercase tracking-wider text-xs font-semibold"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push("/")}
                className="block w-full border border-sand/40 text-charcoal py-3 rounded-xl text-xs hover:bg-cream/50 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <div className="mt-6 pt-5 border-t border-sand/20 text-xs text-warm-brown/40">
              <p>Need help?</p>
              <div className="flex justify-center gap-5 mt-1.5">
                <span className="flex items-center gap-1"><FiMail size={11} /> hello@build.withdarsh.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return <Suspense><ConfirmationContent /></Suspense>;
}

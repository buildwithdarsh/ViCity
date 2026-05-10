"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "./auth/LoginForm";
import RegisterForm from "./auth/RegisterForm";
import ForgotPasswordForm from "./auth/ForgotPasswordForm";
import OtpVerifyForm from "./auth/OtpVerifyForm";

type View = "login" | "register" | "forgot";

export default function LoginModal() {
  const {
    showLoginModal, loginModalRequired, closeLoginModal, pendingOtpPhone,
  } = useAuth();

  const [view, setView] = useState<View>("login");

  // If user has pending OTP, that takes priority
  const showOtp = !!pendingOtpPhone;

  // Reset view when modal opens
  useEffect(() => {
    if (!showLoginModal) setView("login");
  }, [showLoginModal]);

  // Lock body scroll
  useEffect(() => {
    if (showLoginModal || showOtp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showLoginModal, showOtp]);

  const canClose = !loginModalRequired && !pendingOtpPhone;
  const isVisible = showLoginModal || showOtp;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget && canClose) closeLoginModal(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {canClose && (
              <button
                onClick={closeLoginModal}
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-zinc-400 hover:text-charcoal hover:bg-zinc-100 transition-colors"
              >
                <FiX size={20} />
              </button>
            )}

            {/* OTP step takes priority */}
            {showOtp ? (
              <div className="px-8 pt-8 pb-8">
                <div className="text-center mb-4">
                  <p className="text-2xl font-serif tracking-[0.15em] text-charcoal">VICITY</p>
                </div>
                <OtpVerifyForm onVerified={closeLoginModal} />
              </div>
            ) : view === "forgot" ? (
              <div className="px-8 pt-8 pb-8">
                <div className="text-center mb-4">
                  <p className="text-2xl font-serif tracking-[0.15em] text-charcoal">VICITY</p>
                </div>
                <ForgotPasswordForm
                  onDone={() => setView("login")}
                  onBackToLogin={() => setView("login")}
                />
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="pt-8 pb-2 px-8 text-center">
                  <p className="text-2xl font-serif tracking-[0.15em] text-charcoal">VICITY</p>
                  <h2 className="mt-2 text-xl font-serif text-charcoal">
                    {view === "login" ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {view === "login"
                      ? "Sign in to access your bookings"
                      : "Join us for a seamless experience"}
                  </p>
                </div>

                {/* Tab switcher */}
                <div className="flex mx-8 mt-4 bg-cream rounded-xl p-1">
                  <button
                    onClick={() => setView("login")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      view === "login" ? "bg-white text-charcoal shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setView("register")}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                      view === "register" ? "bg-white text-charcoal shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Forms */}
                <div className="px-8 pt-5 pb-8">
                  <AnimatePresence mode="wait">
                    {view === "login" ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <LoginForm
                          onSuccess={closeLoginModal}
                          onForgotPassword={() => setView("forgot")}
                          showLinks={false}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RegisterForm showLinks={false} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="mt-5 text-center text-xs text-zinc-400">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" onClick={() => { if (canClose) closeLoginModal(); }} className="text-gold-600 hover:text-gold-700">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" onClick={() => { if (canClose) closeLoginModal(); }} className="text-gold-600 hover:text-gold-700">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

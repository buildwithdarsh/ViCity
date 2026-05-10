"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TZ } from "@/lib/tz";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  register: (data: { name: string; phone: string; password: string; email?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshAuth: () => Promise<void>;
  showLoginModal: boolean;
  loginModalRequired: boolean;
  openLoginModal: (required?: boolean) => void;
  closeLoginModal: () => void;
  pendingOtpPhone: string | null;
  setPendingOtpPhone: (phone: string | null) => void;
  markPhoneVerified: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalRequired, setLoginModalRequired] = useState(false);
  const [pendingOtpPhone, setPendingOtpPhoneState] = useState<string | null>(null);

  const openLoginModal = useCallback((required = false) => {
    setLoginModalRequired(required);
    setShowLoginModal(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    if (loginModalRequired) return; // Cannot close if required
    setShowLoginModal(false);
    setLoginModalRequired(false);
  }, [loginModalRequired]);

  const setPendingOtpPhone = useCallback((phone: string | null) => {
    setPendingOtpPhoneState(phone);
    if (phone) {
      localStorage.setItem("pending_otp_phone", phone);
    } else {
      localStorage.removeItem("pending_otp_phone");
    }
  }, []);

  const markPhoneVerified = useCallback(() => {
    setPendingOtpPhone(null);
    setUser((prev) => prev ? { ...prev, isPhoneVerified: true } : prev);
  }, [setPendingOtpPhone]);

  const fetchMe = useCallback(async () => {
    try {
      const profile = await TZ.storefront.auth.me();
      setUser(profile as unknown as User);
      // Only require phone OTP if org setting mandates it
      if (profile && !profile.isPhoneVerified) {
        const { getSiteConfig } = await import("@/lib/config");
        const config = await getSiteConfig();
        if (config.auth.require_phone_verification) {
          setPendingOtpPhoneState(profile.phone ?? "");
          localStorage.setItem("pending_otp_phone", profile.phone ?? "");
        }
      }
    } catch {
      TZ.storefront.auth.clearTokens();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const stored = TZ.storefront.auth.getToken();
    if (stored) {
      setToken(stored);
      await fetchMe();
    }
  }, [fetchMe]);

  useEffect(() => {
    const stored = TZ.storefront.auth.getToken();
    const pendingPhone = localStorage.getItem("pending_otp_phone");
    if (pendingPhone) {
      setPendingOtpPhoneState(pendingPhone);
    }
    if (stored) {
      setToken(stored);
      fetchMe();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const res = await TZ.storefront.auth.login({ phone, password });
      setToken(res.accessToken);
      setUser(res.user as unknown as User);
      // Only require phone OTP if org setting mandates it
      const { getSiteConfig } = await import("@/lib/config");
      const config = await getSiteConfig();
      if (!(res.user as unknown as User).isPhoneVerified && config.auth.require_phone_verification) {
        setPendingOtpPhone(res.user.phone ?? "");
      } else {
        setPendingOtpPhone(null);
        setShowLoginModal(false);
        setLoginModalRequired(false);
      }
    } catch (err) {
      TZ.storefront.auth.clearTokens();
      throw err;
    }
  };

  const demoLogin = async () => {
    try {
      const res = await TZ.storefront.auth.demoLogin();
      setToken(res.accessToken);
      setUser(res.user as unknown as User);
      setPendingOtpPhone(null);
      setShowLoginModal(false);
      setLoginModalRequired(false);
    } catch (err) {
      TZ.storefront.auth.clearTokens();
      throw err;
    }
  };

  const register = async (data: { name: string; phone: string; password: string; email?: string }) => {
    try {
      const res = await TZ.storefront.auth.register({ ...data });
      setToken(res.accessToken);
      setUser(res.user as unknown as User);
      setPendingOtpPhone(res.user.phone ?? "");
    } catch (err) {
      TZ.storefront.auth.clearTokens();
      throw err;
    }
  };

  const logout = async () => {
    try {
      await TZ.storefront.auth.logout();
    } catch {
      // best effort -- API may fail but we still clear locally
    }
    TZ.storefront.auth.clearTokens();
    localStorage.removeItem("pending_otp_phone");
    setToken(null);
    setUser(null);
    setPendingOtpPhoneState(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    const profile = await TZ.storefront.auth.updateProfile({
      ...(data.name != null ? { name: data.name } : {}),
      ...(data.email != null ? { email: data.email } : {}),
    });
    setUser(profile as unknown as User);
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, demoLogin, register, logout, updateProfile, refreshAuth,
      showLoginModal, loginModalRequired, openLoginModal, closeLoginModal,
      pendingOtpPhone, setPendingOtpPhone, markPhoneVerified,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

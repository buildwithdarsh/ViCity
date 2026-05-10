"use client";

import { ReactNode } from "react";
import { AuthProvider } from "./hooks/useAuth";
import LoginModal from "./components/LoginModal";

export default function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <LoginModal />
    </AuthProvider>
  );
}

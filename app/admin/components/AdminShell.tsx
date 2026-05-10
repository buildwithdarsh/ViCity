"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AuthGuard from "./AuthGuard";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50">
        <Sidebar />
        <main className="lg:ml-60 min-h-screen">
          <div className="p-6 lg:p-8 max-w-[1500px] mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}

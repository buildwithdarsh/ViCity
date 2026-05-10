"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { TZ } from "@/lib/tz";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authenticated" | "redirecting">("loading");

  useEffect(() => {
    let cancelled = false;

    if (pathname === "/admin/login") {
      setStatus("authenticated");
      return;
    }

    const token = TZ.storefront.auth.getToken();
    if (!token) {
      setStatus("redirecting");
      router.replace("/admin/login");
      return;
    }

    // Validate token with the server
    TZ.storefront.auth.me()
      .then((profile) => {
        if (cancelled) return;
        const role = (profile as unknown as { role: string })?.role;
        if (role === "admin" || role === "super_admin") {
          setStatus("authenticated");
        } else {
          TZ.storefront.auth.clearTokens();
          localStorage.removeItem("token");
          setStatus("redirecting");
          router.replace("/admin/login");
        }
      })
      .catch(() => {
        if (cancelled) return;
        TZ.storefront.auth.clearTokens();
        localStorage.removeItem("token");
        setStatus("redirecting");
        router.replace("/admin/login");
      });

    return () => { cancelled = true; };
  }, [pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-6 w-6 text-zinc-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-zinc-400">
            {status === "redirecting" ? "Redirecting to login..." : "Verifying session..."}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import { ensureDemoLogin, initMockDB } from "./init";

// Set tokens SYNCHRONOUSLY on module load — before any React component mounts.
// This ensures useAuth's first getToken() call finds a valid token.
if (typeof window !== "undefined") {
  ensureDemoLogin();
}

/**
 * Client-side wrapper that seeds the mock IndexedDB on first visit.
 * Demo user tokens are already in localStorage from the module-level call above.
 */
export default function MockProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initMockDB().then(() => setReady(true));
  }, []);

  // Render children immediately — token is already set synchronously.
  // The IDB seeding happens async but only affects data, not auth state.
  void ready;
  return <>{children}</>;
}

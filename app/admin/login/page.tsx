"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TZ } from "@/lib/tz";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const performLogin = async (id: string, pw: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await TZ.admin.auth.login({ email: id, password: pw });
      if (!result.user.roles?.length) {
        setError("Access denied. Admin privileges required.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(phone, password);
  };

  const handleDemoLogin = () => performLogin("admin@vicity.in", "TZ@dmin2026!");

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="border border-zinc-200 rounded bg-white p-8">
          <h1 className="text-xl font-semibold text-zinc-900 mb-1">ViCity Admin</h1>
          <p className="text-sm text-zinc-500 mb-6">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Phone / Email</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="9000000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900"
                placeholder="Enter password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 text-sm font-medium bg-zinc-900 text-white rounded hover:bg-zinc-800 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5">
            <div className="relative flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-xs text-zinc-400">or</span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2 text-sm font-medium border border-zinc-300 text-zinc-700 rounded hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              Try Demo Account
            </button>
            <p className="text-center text-[11px] text-zinc-400 mt-1.5">admin@vicity.in · TZ@dmin2026!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

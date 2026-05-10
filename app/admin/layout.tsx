import AdminShell from "./components/AdminShell";
import { ToastProvider } from "./components/Toast";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "ViCity Admin Portal | Operations Dashboard",
  description: "Secure administration portal for ViCity staff to manage bookings, payments, pricing, users, and operations.",
  path: "/admin",
  index: false,
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}

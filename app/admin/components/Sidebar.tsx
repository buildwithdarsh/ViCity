"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "grid" },
  { label: "Bookings", href: "/admin/bookings", icon: "calendar" },
  { label: "Availability", href: "/admin/availability", icon: "calendar-block" },
  { label: "Villa", href: "/admin/rooms", icon: "home" },
  { label: "Pricing", href: "/admin/pricing", icon: "dollar" },
  { label: "Amenities", href: "/admin/amenities", icon: "star" },
  { label: "Coupons", href: "/admin/coupons", icon: "tag" },
  { label: "Users", href: "/admin/users", icon: "users" },
  { label: "Payments", href: "/admin/payments", icon: "credit-card" },
  { label: "Reviews", href: "/admin/reviews", icon: "message" },
  { label: "Notifications", href: "/admin/notifications", icon: "bell" },
  { label: "Reports", href: "/admin/reports", icon: "bar-chart" },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: "clipboard" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

const icons: Record<string, React.ReactNode> = {
  grid: <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  "calendar-block": <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /><line x1="9" y1="14" x2="15" y2="20" /><line x1="15" y1="14" x2="9" y2="20" /></>,
  home: <><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M9 22V12h6v10" /></>,
  dollar: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />,
  tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  "credit-card": <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  message: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
  "bar-chart": <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></>,
  clipboard: <><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 text-white rounded"
        onClick={() => setCollapsed(!collapsed)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-zinc-900 text-zinc-300 flex flex-col transition-transform ${collapsed ? "-translate-x-full" : "translate-x-0"} lg:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <span className="text-lg font-semibold text-white tracking-tight">ViCity</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(true)}
                className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${active ? "bg-zinc-800 text-white border-r-2 border-white" : "hover:bg-zinc-800/50 hover:text-white"}`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">
          ViCity v0.1.0
        </div>
      </aside>
    </>
  );
}

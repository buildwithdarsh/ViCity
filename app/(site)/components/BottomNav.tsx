"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiCalendar, FiBell, FiUser, FiMoreHorizontal } from "react-icons/fi";

const tabs = [
  { href: "/account", label: "Home", icon: FiHome, exact: true },
  { href: "/account/bookings", label: "Bookings", icon: FiCalendar },
  { href: "/account/notifications", label: "Alerts", icon: FiBell },
  { href: "/account/profile", label: "Profile", icon: FiUser },
  { href: "/more", label: "More", icon: FiMoreHorizontal, exact: true },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-sand/20 lg:hidden">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive ? "text-gold" : "text-zinc-400"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[9px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for devices with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

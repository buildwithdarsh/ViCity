"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiArrowLeft,
  FiBell,
  FiCheck,
  FiCalendar,
  FiCreditCard,
  FiAlertCircle,
  FiXCircle,
  FiLogIn,
  FiLogOut,
  FiGift,
  FiLock,
  FiCheckCircle,
  FiRefreshCw,
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { TZ } from "@/lib/tz";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
  welcome:           { icon: FiGift,          color: "text-gold",       bg: "bg-gold/10" },
  booking_created:   { icon: FiCalendar,      color: "text-blue-500",   bg: "bg-blue-50" },
  payment_success:   { icon: FiCreditCard,    color: "text-green-500",  bg: "bg-green-50" },
  payment_failed:    { icon: FiAlertCircle,   color: "text-red-500",    bg: "bg-red-50" },
  booking_cancelled: { icon: FiXCircle,       color: "text-red-400",    bg: "bg-red-50" },
  refund_issued:     { icon: FiRefreshCw,     color: "text-emerald-500", bg: "bg-emerald-50" },
  check_in:          { icon: FiLogIn,         color: "text-gold",       bg: "bg-gold/10" },
  check_out:         { icon: FiLogOut,        color: "text-zinc-500",   bg: "bg-zinc-100" },
  password_changed:  { icon: FiLock,          color: "text-amber-500",  bg: "bg-amber-50" },
  phone_verified:    { icon: FiCheckCircle,   color: "text-green-500",  bg: "bg-green-50" },
  contact_message:   { icon: FiMessageCircle, color: "text-blue-500",   bg: "bg-blue-50" },
};

const defaultConfig = { icon: FiBell, color: "text-zinc-400", bg: "bg-zinc-100" };

function formatRelativeDate(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function NotificationsPage() {
  const { openLoginModal, token: authToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();
    if (!token) { openLoginModal(true); return; }
    TZ.storefront.notifications.list()
      .then((res) => { setNotifications(((res as unknown as { data: Notification[] }).data || []) as Notification[]); setLoading(false); })
      .catch(() => openLoginModal(true));
  }, [openLoginModal, authToken]);

  const markRead = async (id: string) => {
    await TZ.storefront.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await TZ.storefront.notifications.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="pt-20 sm:pt-28 pb-24 sm:pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <div>
          <Link href="/account" className="hidden sm:inline-flex items-center gap-2 text-zinc-500 hover:text-charcoal text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to Account
          </Link>
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif text-charcoal">Notifications</h1>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-gold-600 hover:text-gold-700 flex items-center gap-1">
                <FiCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-zinc-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-36 bg-zinc-100 rounded" />
                    <div className="h-3 w-12 bg-zinc-50 rounded" />
                  </div>
                  <div className="h-3 w-3/4 bg-zinc-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <FiBell size={32} className="text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const config = typeConfig[n.type] || defaultConfig;
              const Icon = config.icon;
              const bookingId = n.metadata?.['bookingId'] as string | undefined;

              const content = (
                <div
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`bg-white rounded-xl p-4 flex items-start gap-3 transition-all ${!n.isRead ? "ring-1 ring-gold/20 shadow-sm" : "opacity-80"}`}
                >
                  <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={16} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${!n.isRead ? "text-charcoal font-semibold" : "text-zinc-600"}`}>{n.title}</p>
                      <span className="text-[10px] text-zinc-400 shrink-0 mt-0.5">{formatRelativeDate(n.createdAt)}</span>
                    </div>
                    <p className="text-zinc-500 text-[13px] mt-1 leading-relaxed">{n.body}</p>
                  </div>
                  {!n.isRead && <div className="w-2 h-2 rounded-full bg-gold shrink-0 mt-1.5" />}
                </div>
              );

              if (bookingId && ["booking_created", "payment_success", "check_in", "check_out"].includes(n.type)) {
                return (
                  <Link key={n.id} href={`/account/bookings/${bookingId}`} className="block">
                    {content}
                  </Link>
                );
              }

              return <div key={n.id} className="cursor-pointer">{content}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

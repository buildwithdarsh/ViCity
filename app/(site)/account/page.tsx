"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiCalendar, FiUser, FiStar, FiBell, FiLogOut,
  FiChevronRight,
  FiMapPin, FiClock, FiEdit3, FiArrowRight,
  FiCreditCard, FiGift, FiAlertCircle, FiXCircle,
  FiLogIn, FiLock, FiCheckCircle, FiRefreshCw,
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "@/lib/utils/currency";
import { TZ } from "@/lib/tz";
import type { User, Booking } from "@/lib/types";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  body: string;
  title?: string;
  status: string;
  createdAt: string;
}

const notifTypeIcon: Record<string, { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }> = {
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
const defaultNotifIcon = { icon: FiBell, color: "text-zinc-400", bg: "bg-zinc-100" };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "checked_in": return "bg-blue-50 text-blue-700 border-blue-200";
    case "checked_out": return "bg-zinc-100 text-zinc-600 border-zinc-200";
    case "cancelled": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending": return "Pending";
    case "payment_pending": return "Awaiting Payment";
    case "confirmed": return "Confirmed";
    case "checked_in": return "Checked In";
    case "checked_out": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status.replace("_", " ");
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ── Section wrapper ── */
function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`mb-6 sm:mb-8 ${className}`}>{children}</section>;
}

function SectionHeader({ title, href, linkText = "View all" }: { title: string; href?: string; linkText?: string }) {
  return (
    <div className="flex items-center justify-between mb-3 sm:mb-4">
      <h2 className="text-lg sm:text-xl font-serif text-charcoal">{title}</h2>
      {href && (
        <Link href={href} className="text-xs sm:text-sm text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1 transition-colors">
          {linkText} <FiChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  return (
    <div className="pt-20 sm:pt-28 pb-16 max-w-4xl mx-auto px-5 md:px-6">
      <div className="animate-pulse">
        {/* Avatar + header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-zinc-200" />
          <div className="flex-1 space-y-2">
            <div className="h-6 sm:h-7 bg-zinc-200 rounded w-40" />
            <div className="h-3.5 bg-zinc-100 rounded w-52" />
          </div>
          <div className="h-8 bg-zinc-100 rounded-lg w-20" />
        </div>
        {/* Cards */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 w-32 bg-zinc-100 rounded" />
              <div className="h-4 w-16 bg-zinc-50 rounded" />
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 w-28 bg-zinc-100 rounded" />
                    <div className="h-3 w-40 bg-zinc-50 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 h-32" />
            <div className="bg-white rounded-2xl p-5 h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const { openLoginModal, logout: authLogout, token: authToken } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();
    if (!token) { openLoginModal(true); return; }

    Promise.all([
      TZ.storefront.auth.me(),
      TZ.storefront.property.listBookings(),
      TZ.storefront.notifications.list().then(r => ((r as unknown as { data: Notification[] }).data ?? [])).catch(() => [] as Notification[]),
      TZ.storefront.reviews.myReviews().catch(() => [] as Review[]),
    ]).then(([profile, bookingsRes, notifList, reviewsList]) => {
      if (!profile) { openLoginModal(true); return; }
      setUser(profile as unknown as User);
      setBookings(((bookingsRes as unknown as { data: Booking[] }).data || []) as Booking[]);
      setNotifications((notifList || []) as unknown as Notification[]);
      setReviews((reviewsList || []) as unknown as Review[]);
      setLoading(false);
    }).catch(() => {
      openLoginModal(true);
    });
  }, [openLoginModal, authToken]);

  const handleLogout = () => { authLogout(); };

  if (loading) return <DashboardSkeleton />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentBookings = bookings.slice(0, 3);
  const recentNotifs = notifications.slice(0, 3);
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div className="pt-24 sm:pt-28 pb-24 sm:pb-20 bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-5 md:px-6">

        {/* ── User Header ── */}
        <Section className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0 shadow-md shadow-gold/20">
              <span className="text-white font-serif text-lg sm:text-xl font-medium">
                {user?.name ? getInitials(user.name) : "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-serif text-charcoal truncate">
                {firstName}
              </h1>
              <p className="text-xs sm:text-sm text-warm-brown/50 truncate">{user?.phone}</p>
              {user?.email && (
                <p className="text-xs text-warm-brown/40 mt-0.5">{user.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/account/profile"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-sand/30 flex items-center justify-center text-warm-brown/50 hover:text-gold hover:border-gold/30 transition-all"
                title="Edit Profile"
              >
                <FiEdit3 size={15} />
              </Link>
              <button
                onClick={handleLogout}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-sand/30 flex items-center justify-center text-warm-brown/50 hover:text-red-500 hover:border-red-200 transition-all"
                title="Sign Out"
              >
                <FiLogOut size={15} />
              </button>
            </div>
          </div>
        </Section>

        {/* ── Bookings ── */}
        <Section>
          <SectionHeader title="Bookings" {...(bookings.length > 0 ? { href: "/account/bookings" } : {})} />
          {recentBookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 sm:p-10 text-center border border-sand/10">
              <div className="w-12 h-12 rounded-full bg-gold-50 flex items-center justify-center mx-auto mb-3">
                <FiCalendar size={20} className="text-gold/60" />
              </div>
              <p className="text-sm text-warm-brown/50">No bookings yet</p>
              <Link href="/booking" className="mt-3 inline-flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-700 font-medium transition-colors">
                Book your first stay <FiArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {recentBookings.map((b) => {
                const hasBalance = b.paymentStatus !== "paid" && b.status !== "cancelled" && b.status !== "checked_out";

                return (
                  <Link
                    key={b.id}
                    href="/account/bookings"
                    className="block bg-white rounded-2xl p-3.5 sm:p-4 hover:shadow-md transition-all duration-300 border border-sand/10 group"
                  >
                    <div className="flex items-start gap-3">
                      {/* Date badge */}
                      <div className="w-11 sm:w-12 shrink-0 bg-cream rounded-xl py-2 text-center">
                        <p className="text-lg sm:text-xl font-serif text-charcoal leading-none">
                          {new Date(b.checkInDate).getDate()}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-warm-brown/50 uppercase font-medium mt-0.5">
                          {new Date(b.checkInDate).toLocaleDateString("en-IN", { month: "short" })}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm sm:text-base text-charcoal font-medium truncate">ViCity</p>
                            <p className="text-[10px] sm:text-xs text-warm-brown/40 mt-0.5 font-mono">
                              {b.bookingReference}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm sm:text-base text-charcoal font-semibold">{formatCurrency(b.totalAmount)}</p>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-warm-brown/40">
                            <FiMapPin size={10} />
                            {formatDate(b.checkInDate)} – {formatDate(b.checkOutDate)}
                          </span>
                          <span className={`inline-flex text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusColor(b.status)}`}>
                            {getStatusLabel(b.status)}
                          </span>
                        </div>

                        {/* Outstanding balance inline */}
                        {hasBalance && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px] sm:text-xs text-amber-700 bg-amber-50 rounded-lg px-2.5 py-1.5">
                            <FiCreditCard size={11} className="shrink-0" />
                            <span>{formatCurrency(b.totalAmount)} due before check-in</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── Quick Links Row (Notifications + Reviews) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {/* Notifications */}
          <div>
            <SectionHeader
              title="Notifications"
              href="/account/notifications"
              linkText={unreadCount > 0 ? `${unreadCount} new` : "View all"}
            />
            <div className="bg-white rounded-2xl border border-sand/10 overflow-hidden">
              {recentNotifs.length === 0 ? (
                <div className="p-6 text-center">
                  <FiBell size={20} className="text-zinc-200 mx-auto mb-2" />
                  <p className="text-xs text-warm-brown/40">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-sand/10">
                  {recentNotifs.map((n) => {
                    const cfg = notifTypeIcon[n.type] || defaultNotifIcon;
                    const NIcon = cfg.icon;
                    return (
                      <div key={n.id} className={`px-4 py-3 ${!n.isRead ? "bg-gold-50/30" : ""}`}>
                        <div className="flex items-start gap-2.5">
                          <div className={`w-7 h-7 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <NIcon size={13} className={cfg.color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs sm:text-sm truncate ${!n.isRead ? "text-charcoal font-medium" : "text-warm-brown/60"}`}>
                              {n.title}
                            </p>
                            <p className="text-[10px] sm:text-xs text-warm-brown/30 mt-0.5 flex items-center gap-1">
                              <FiClock size={9} />
                              {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                          {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2 shrink-0" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <SectionHeader title="Reviews" href="/account/reviews" />
            <div className="bg-white rounded-2xl border border-sand/10 overflow-hidden">
              {reviews.length === 0 ? (
                <div className="p-6 text-center">
                  <FiStar size={20} className="text-zinc-200 mx-auto mb-2" />
                  <p className="text-xs text-warm-brown/40">No reviews yet</p>
                  <Link href="/account/reviews" className="mt-2 inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 font-medium transition-colors">
                    Write a review <FiArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-sand/10">
                  {reviews.slice(0, 3).map((r) => (
                    <div key={r.id} className="px-4 py-3">
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar
                            key={i}
                            size={11}
                            className={i < r.rating ? "text-gold" : "text-zinc-200"}
                            fill={i < r.rating ? "currentColor" : "none"}
                          />
                        ))}
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full capitalize ${
                          r.status === "approved" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-warm-brown/60 line-clamp-2">
                        {r.title || r.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <Section>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/account/profile"
              className="bg-white rounded-2xl p-4 sm:p-5 border border-sand/10 hover:shadow-md hover:border-gold/20 transition-all duration-300 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold-50 flex items-center justify-center mb-3 group-hover:bg-gold-100 transition-colors">
                <FiUser size={16} className="text-gold-500" />
              </div>
              <p className="text-sm sm:text-base font-medium text-charcoal">Edit Profile</p>
              <p className="text-[10px] sm:text-xs text-warm-brown/40 mt-0.5">Name, phone & address</p>
            </Link>
            <Link
              href="/booking"
              className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-2xl p-4 sm:p-5 border border-charcoal hover:shadow-lg transition-all duration-300 group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:bg-white/15 transition-colors">
                <FiCalendar size={16} className="text-gold" />
              </div>
              <p className="text-sm sm:text-base font-medium text-white">Book a Stay</p>
              <p className="text-[10px] sm:text-xs text-white/40 mt-0.5">Plan your next visit</p>
            </Link>
          </div>
        </Section>

        {/* ── Footer ── */}
        <div className="text-center pt-4 pb-2">
          <button
            onClick={handleLogout}
            className="text-xs text-warm-brown/30 hover:text-red-500 transition-colors inline-flex items-center gap-1.5"
          >
            <FiLogOut size={12} /> Sign out
          </button>
        </div>

      </div>
    </div>
  );
}

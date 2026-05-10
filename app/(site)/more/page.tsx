"use client";

import Link from "next/link";
import {
  FiImage, FiInfo, FiStar, FiMessageCircle, FiCalendar, FiSearch,
  FiHelpCircle, FiShield, FiFileText, FiRefreshCw,
  FiChevronRight, FiMapPin, FiMail,
} from "react-icons/fi";

const sections = [
  {
    title: "Explore",
    items: [
      { label: "Gallery", href: "/gallery", icon: FiImage },
      { label: "About Us", href: "/about", icon: FiInfo },
      { label: "Reviews", href: "/reviews", icon: FiStar },
      { label: "Contact", href: "/contact", icon: FiMessageCircle },
    ],
  },
  {
    title: "Booking",
    items: [
      { label: "Book a Stay", href: "/booking", icon: FiCalendar },
      { label: "Check Availability", href: "/availability", icon: FiSearch },
      { label: "Lookup Booking", href: "/lookup-booking", icon: FiFileText },
    ],
  },
  {
    title: "Policies",
    items: [
      { label: "Privacy Policy", href: "/privacy", icon: FiShield },
      { label: "Terms of Service", href: "/terms", icon: FiFileText },
      { label: "Refund Policy", href: "/refund", icon: FiRefreshCw },
      { label: "FAQs", href: "/contact", icon: FiHelpCircle },
    ],
  },
];

export default function MorePage() {
  return (
    <div className="pt-20 pb-8 bg-cream min-h-screen">
      <div className="max-w-lg mx-auto px-5">
        <h1 className="text-2xl font-serif text-charcoal mb-6">More</h1>

        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-white rounded-2xl border border-sand/15 overflow-hidden divide-y divide-sand/10">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-gold" />
                    </div>
                    <span className="flex-1 text-sm text-charcoal">{item.label}</span>
                    <FiChevronRight size={14} className="text-zinc-300" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact & Socials */}
        <div className="mb-6">
          <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium mb-2 px-1">
            Get in Touch
          </p>
          <div className="bg-white rounded-2xl border border-sand/15 overflow-hidden divide-y divide-sand/10">
            <a
              href="mailto:hello@build.withdarsh.com"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center shrink-0">
                <FiMail size={15} className="text-gold" />
              </div>
              <span className="flex-1 text-sm text-charcoal">hello@build.withdarsh.com</span>
            </a>
            <a
              href="mailto:hello@build.withdarsh.com"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-cream/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-cream flex items-center justify-center shrink-0">
                <FiMail size={15} className="text-gold" />
              </div>
              <span className="flex-1 text-sm text-charcoal">Email Us</span>
            </a>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2.5 px-1 mb-6">
          <FiMapPin size={13} className="text-gold/60 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400 leading-relaxed">
            Abc, XYZ
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center text-[10px] text-zinc-300 tracking-wide">
          &copy; {new Date().getFullYear()} ViCity
        </p>
      </div>
    </div>
  );
}

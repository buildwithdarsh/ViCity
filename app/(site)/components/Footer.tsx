"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMapPin,
  FiMail,
  FiArrowUpRight,
} from "react-icons/fi";

const footerLinks = [
  {
    title: "The Villa",
    links: [
      { label: "Our Rooms", href: "/gallery" },
      { label: "About", href: "/about" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    title: "Booking",
    links: [
      { label: "Check Availability", href: "/booking" },
      { label: "Lookup Booking", href: "/booking/lookup" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQs", href: "/contact" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

const socials = [
  {
    icon: FiMail,
    href: "mailto:hello@build.withdarsh.com",
    label: "Email",
  },
];

export default function Footer() {
  return (
    <footer className="hidden lg:block bg-charcoal border-t border-white/[0.06]">
      {/* Main content — extra bottom padding on mobile for WhatsApp float */}
      <div className="max-w-7xl mx-auto px-5 md:px-6 pt-12 md:pt-24 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-6 md:gap-y-14">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <Link
              href="/"
              className="text-gold text-3xl font-serif tracking-[0.2em]"
            >
              VICITY
            </Link>

            <p className="mt-6 text-sand/80 text-[15px] leading-[1.8] max-w-sm">
              ViCity — a private retreat where thoughtful
              design meets genuine warmth. Your story, beautifully hosted.
            </p>

            <p className="mt-5 text-gold/70 text-sm font-light tracking-wide">
              Private villa &middot; Book the entire property
            </p>

            {/* Contact details */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 text-sand/60 text-sm">
                <FiMapPin
                  size={15}
                  className="text-gold/80 mt-0.5 shrink-0"
                />
                <span className="leading-relaxed">
                  Abc, XYZ
                </span>
              </div>
              <div className="flex items-center gap-3 text-sand/60 text-sm">
                <FiMail size={15} className="text-gold/80 shrink-0" />
                <span>hello@build.withdarsh.com</span>
              </div>
            </div>
          </motion.div>

          {/* Link groups */}
          {footerLinks.map((group, gi) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 + gi * 0.1, ease: "easeOut" }}
              className="lg:col-span-2 lg:first:col-start-7"
            >
              <h3 className="text-gold text-xs uppercase tracking-[0.25em] mb-3 sm:mb-6">
                {group.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3.5">
                {group.links.map((link) => (
                  <li key={link.label + link.href}>
                    <Link
                      href={link.href}
                      className="text-sand/60 text-sm hover:text-sand transition-colors duration-300 inline-flex items-center gap-1.5 group py-0.5 min-h-[40px] md:min-h-0 md:py-0"
                    >
                      {link.label}
                      <FiArrowUpRight
                        size={11}
                        className="opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="divider-gold" />
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="max-w-7xl mx-auto px-5 md:px-6 py-8 pb-24 md:pb-8 flex flex-col md:flex-row items-center justify-between gap-5"
      >
        <p className="text-sand/40 text-xs tracking-wide">
          &copy; {new Date().getFullYear()} ViCity. All
          rights reserved.
        </p>

        <div className="flex items-center gap-3">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="w-11 h-11 md:w-9 md:h-9 rounded-full border border-sand/10 flex items-center justify-center text-sand/40 hover:text-gold hover:border-gold/40 transition-all duration-300"
            >
              <s.icon size={16} />
            </a>
          ))}
        </div>
      </motion.div>
    </footer>
  );
}

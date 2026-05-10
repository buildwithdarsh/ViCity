"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const links = [
  { href: "/gallery", label: "Explore" },
  { href: "/about", label: "About" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
];

// Pages that have a full dark hero section at the top
const darkHeroPages = ["/", "/about", "/gallery", "/contact", "/reviews"];

export default function Navbar() {
  const pathname = usePathname();
  const hasDarkHero = darkHeroPages.includes(pathname);
  const { user, openLoginModal } = useAuth();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Use dark text when: scrolled OR page doesn't have a dark hero
  const useDarkText = scrolled || !hasDarkHero;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        useDarkText
          ? "bg-cream/95 backdrop-blur-md border-b border-sand/15 py-3"
          : "bg-transparent py-5 max-lg:py-3"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-5 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-10">
          <span
            className={`text-2xl font-serif tracking-[0.15em] transition-colors duration-500 ${
              useDarkText ? "text-charcoal" : "text-white"
            }`}
          >
            VICITY
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-wide uppercase transition-colors duration-500 hover:text-gold relative group ${
                useDarkText ? "text-charcoal" : "text-white/90"
              }`}
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-500" />
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <a
            href="mailto:hello@build.withdarsh.com"
            aria-label="Email Us"
            className={`p-2 rounded-full transition-all duration-500 ${
              useDarkText
                ? "text-charcoal hover:text-gold hover:bg-charcoal/5"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <FaWhatsapp size={18} />
          </a>
          {user ? (
            <Link
              href="/account"
              aria-label="My Account"
              className={`p-2 rounded-full transition-all duration-500 ${
                useDarkText
                  ? "text-charcoal hover:text-gold hover:bg-charcoal/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FiUser size={18} />
            </Link>
          ) : (
            <button
              onClick={() => openLoginModal()}
              aria-label="Sign In"
              className={`p-2 rounded-full transition-all duration-500 ${
                useDarkText
                  ? "text-charcoal hover:text-gold hover:bg-charcoal/5"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <FiUser size={18} />
            </button>
          )}
          <Link
            href="/booking"
            className="bg-gold text-charcoal text-sm tracking-wide uppercase px-6 py-2.5 rounded-full hover:bg-gold/90 transition-all duration-500 hover:shadow-lg hover:shadow-gold/25 hover:-translate-y-0.5"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile: User/Login icon */}
        {user ? (
          <Link
            href="/account"
            aria-label="My Account"
            className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center z-10 transition-colors duration-500 ${
              useDarkText ? "text-charcoal" : "text-white"
            }`}
          >
            <FiUser size={22} />
          </Link>
        ) : (
          <button
            onClick={() => openLoginModal()}
            aria-label="Sign In"
            className={`lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center z-10 transition-colors duration-500 ${
              useDarkText ? "text-charcoal" : "text-white"
            }`}
          >
            <FiUser size={22} />
          </button>
        )}
      </nav>
    </header>
  );
}

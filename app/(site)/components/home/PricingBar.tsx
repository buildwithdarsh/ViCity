"use client";

import Link from "next/link";
import { BlurFadeIn, AnimatedCounter } from "../AnimatedSection";

interface PricingBarProps {
  currencySymbol: string;
  basePrice: number;
  maxGuestsIncluded?: number;
}

export default function PricingBar({ currencySymbol, basePrice, maxGuestsIncluded = 6 }: PricingBarProps) {
  return (
    <section className="bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(201,168,76,0.06),transparent_70%)]" />
      <div className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-14 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <BlurFadeIn>
            <div className="flex items-baseline gap-3 justify-center md:justify-start">
              <span className="text-4xl md:text-5xl font-serif text-white">
                <AnimatedCounter prefix={currencySymbol} value={Math.round(basePrice / 100)} />
              </span>
              <span className="text-white/40 text-sm uppercase tracking-wider">/ night</span>
            </div>
            <p className="text-white/30 text-sm mt-1">Up to {maxGuestsIncluded} guests included</p>
          </BlurFadeIn>

          <BlurFadeIn delay={0.1}>
            <div className="flex items-center gap-8 sm:gap-10 text-center">
              <div>
                <p className="text-2xl font-serif text-white">3</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Bedrooms</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-serif text-white">10</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Max Guests</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-serif text-white">24/7</p>
                <p className="text-white/40 text-xs uppercase tracking-wider mt-1">Security</p>
              </div>
            </div>
          </BlurFadeIn>

          <BlurFadeIn delay={0.2}>
            <Link
              href="/booking"
              className="bg-gold text-charcoal px-8 py-3.5 rounded-full text-sm uppercase tracking-wider font-semibold hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 w-full sm:w-auto text-center min-h-[48px] flex items-center justify-center"
            >
              Book the Villa
            </Link>
          </BlurFadeIn>
        </div>
      </div>
    </section>
  );
}

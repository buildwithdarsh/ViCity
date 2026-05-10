"use client";

import Link from "next/link";
import { BlurFadeIn, CinematicSection } from "../AnimatedSection";

interface CinematicCTAProps {
  pricePerNight: string;
}

export default function CinematicCTA({ pricePerNight }: CinematicCTAProps) {
  return (
    <CinematicSection image="/images/sitting-area-brick-wall.webp" className="py-44">
      <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
        <BlurFadeIn>
          <p className="text-gold-300 text-xs uppercase tracking-[0.4em] mb-6">Escape the Ordinary</p>
          <h2 className="text-display font-serif text-white">
            Some Places Stay
            <br />
            With You Forever
          </h2>
          <p className="mt-7 text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
            Wake up to golden light, unwind in quiet luxury,
            and let every moment feel unhurried
          </p>
          <div className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Link
              href="/booking"
              className="bg-gold text-charcoal px-10 py-4 rounded-full text-sm uppercase tracking-wider font-semibold hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 text-center min-h-[48px] flex items-center justify-center"
            >
              Book Now — {pricePerNight}/night
            </Link>
            <Link
              href="/contact"
              className="border border-white/20 text-white px-10 py-4 rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider text-sm text-center min-h-[48px] flex items-center justify-center"
            >
              Get in Touch
            </Link>
          </div>
        </BlurFadeIn>
      </div>
    </CinematicSection>
  );
}

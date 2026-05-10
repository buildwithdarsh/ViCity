"use client";

import Link from "next/link";
import { BlurFadeIn } from "../AnimatedSection";

export default function FinalCTA() {
  return (
    <section className="py-36 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(196,112,74,0.06),transparent_60%)]" />
      </div>
      <div className="max-w-4xl mx-auto px-5 md:px-6 text-center relative z-10">
        <BlurFadeIn>
          <p className="text-gold text-xs uppercase tracking-[0.4em] mb-6">Begin Your Story</p>
          <h2 className="text-display font-serif text-white">
            Gather. Celebrate.
            <br />
            <span className="text-gradient">Stay.</span>
          </h2>
          <p className="mt-7 text-white/40 text-lg max-w-xl mx-auto leading-relaxed">
            Reserve ViCity and discover the kind of stay you&apos;ll want to relive
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mt-12">
            <Link
              href="/booking"
              className="bg-gold text-charcoal px-10 py-4 rounded-full text-sm uppercase tracking-wider font-semibold hover:bg-gold-light transition-all duration-300 hover:shadow-lg hover:shadow-gold/20 hover:-translate-y-0.5 text-center min-h-[48px] flex items-center justify-center"
            >
              Book Now
            </Link>
            <Link
              href="mailto:hello@build.withdarsh.com"
              className="border border-white/20 text-white px-10 py-4 rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-wider text-sm text-center min-h-[48px] flex items-center justify-center"
            >
              Email Us
            </Link>
          </div>
        </BlurFadeIn>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import BookingSearch from "../BookingSearch";
import { useRef } from "react";
import { getBlurDataURL } from "@/lib/blur-placeholders";

const ease = [0.16, 1, 0.3, 1] as const;

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const heroImageScale = useTransform(heroProgress, [0, 1], [1, 1.2]);
  const heroTextY = useTransform(heroProgress, [0, 1], ["0%", "60%"]);
  const heroOpacity = useTransform(heroProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={heroRef} className="relative min-h-[100svh] flex items-end sm:items-center justify-center overflow-hidden pb-4 sm:pb-0 pt-16 sm:pt-0">
      <motion.div className="absolute inset-0" style={{ y: heroImageY, scale: heroImageScale }}>
        <Image
          src="/images/living-room-sofa-landscape.webp"
          alt="ViCity — living room"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          fetchPriority="high"
          placeholder="blur"
          blurDataURL={getBlurDataURL("/images/living-room-sofa-landscape.webp")}
        />
        <div className="hero-overlay absolute inset-0" />
      </motion.div>

      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-5 md:px-6 text-center"
        style={{ y: heroTextY, opacity: heroOpacity }}
      >
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 60 }}
          transition={{ duration: 1.2, delay: 0.2, ease }}
          className="h-[1px] bg-gold mx-auto mb-4 sm:mb-7 hero-short:mb-2"
        />
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="text-gold-300 text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-5 font-medium hero-short:mb-1"
        >
          ViCity
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="text-hero font-serif text-white"
        >
          Your Private
          <br />
          <span className="text-gradient">World Awaits</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.45, ease }}
          className="mt-3 sm:mt-7 text-white/70 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed hero-short:mt-1"
        >
          {/* Short viewport gets condensed single-line text */}
          <span className="hero-short:hidden">
            A private villa for those who seek beauty in every detail.
            Three bedrooms. One unforgettable stay.
          </span>
          <span className="hidden hero-short:inline">
            Three bedrooms. One unforgettable stay.
          </span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.65, ease }}
          className="mt-6 sm:mt-10 hero-short:mt-3"
        >
          <BookingSearch variant="hero" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 hidden sm:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], height: [4, 10, 4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="w-[2px] bg-white/70 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { BlurFadeIn, RevealOnScroll } from "../AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";

interface AboutPreviewProps {
  pricePerNight: string;
}

export default function AboutPreview({ pricePerNight }: AboutPreviewProps) {
  return (
    <section className="py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <RevealOnScroll direction="left">
            <div className="relative">
              <div className="rounded-3xl cinematic-frame overflow-hidden">
                <Image
                  src="/images/living-room-art-lamp.webp"
                  alt="ViCity interior"
                  width={800}
                  height={600}
                  loading="lazy"
                  className="object-cover w-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/living-room-art-lamp.webp")}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="absolute -bottom-6 -right-6 bg-gold text-charcoal p-6 rounded-2xl hidden md:block glow-gold-sm"
              >
                <p className="text-3xl font-serif">{pricePerNight}</p>
                <p className="text-sm text-charcoal/60 mt-0.5">per night</p>
              </motion.div>
            </div>
          </RevealOnScroll>

          <BlurFadeIn>
            <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-4 font-medium">Our Story</p>
            <h2 className="text-headline font-serif text-charcoal">
              Built by Darsh Gupta.
              <br />
              Designed for You.
            </h2>
            <div className="w-10 h-[1.5px] bg-gold mt-6" />
            <p className="mt-6 text-warm-brown leading-relaxed text-lg">
              ViCity was born from a simple conviction: that a stay should feel personal, not performed. Darsh Gupta founded it with a vision to build spaces that aren&apos;t simply places to stay — but destinations where people gather, celebrate, and create lasting memories.
            </p>
            <p className="mt-4 text-warm-brown leading-relaxed">
              ViCity is our flagship — a private, premium space where every detail has been considered. From the furniture you sink into to the light that falls across the room, this is hospitality with intention.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 bg-charcoal text-white px-8 py-3.5 rounded-full hover:bg-espresso transition-all duration-300 group text-sm uppercase tracking-wider font-medium"
            >
              Discover the Story
              <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
          </BlurFadeIn>
        </div>
      </div>
    </section>
  );
}

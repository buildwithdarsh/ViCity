"use client";

import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getBlurDataURL } from "@/lib/blur-placeholders";

interface AuthPageLayoutProps {
  children: ReactNode;
  image: string;
  imageAlt: string;
  tagline: string;
  heading: string;
  description: string;
}

export default function AuthPageLayout({ children, image, imageAlt, tagline, heading, description }: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      {/* Image side — desktop: left half fixed, mobile: top parallax strip */}
      <div className="relative h-56 sm:h-64 lg:h-auto lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0 overflow-hidden">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL={getBlurDataURL(image)}
        />
        <div className="absolute inset-0 hero-overlay-dark" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-white/50 text-xs sm:text-sm uppercase tracking-[0.2em] mb-2 lg:mb-3">{tagline}</p>
            <h2 className="text-2xl lg:text-4xl font-serif text-white mb-2 lg:mb-4">{heading}</h2>
            <p className="text-white/60 text-xs sm:text-sm max-w-sm leading-relaxed hidden sm:block">{description}</p>
          </motion.div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 lg:ml-[50%] flex items-center justify-center px-5 md:px-6 py-10 lg:py-20 min-h-[calc(100vh-14rem)] sm:min-h-[calc(100vh-16rem)] lg:min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-serif text-charcoal tracking-[0.15em]">VICITY</Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            {children}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-400">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-gold-600 hover:text-gold-700">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-gold-600 hover:text-gold-700">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

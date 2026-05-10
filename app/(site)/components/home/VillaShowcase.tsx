"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { SectionHeading, BlurFadeIn } from "../AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";

const ease = [0.16, 1, 0.3, 1] as const;

const villaStats = [
  { label: "Total Area", value: "2,500 sq ft" },
  { label: "Bedrooms", value: "3 King Beds" },
  { label: "Capacity", value: "Up to 10 guests" },
  { label: "Bathrooms", value: "3 Attached" },
];

export default function VillaShowcase() {
  return (
    <section className="py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <SectionHeading
          eyebrow="The Villa"
          title="Three Bedrooms, Yours Entirely"
          description="Each space designed to feel like it was made just for you"
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 mt-20">
          <div className="md:col-span-7">
            <Link href="/gallery" className="block group">
              <div className="relative aspect-[4/3] md:aspect-[4/3] rounded-2xl overflow-hidden">
                <Image
                  src="/images/bedroom-blue-wide.webp"
                  alt="Master bedroom — blue ambient lighting"
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/bedroom-blue-wide.webp")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <p className="text-gold-300 text-xs uppercase tracking-[0.2em] mb-2 font-medium">Bedroom One</p>
                  <h3 className="text-2xl md:text-3xl font-serif text-white">The Blue Room</h3>
                  <p className="text-white/60 text-sm mt-2 max-w-xs">Ambient blue lighting, king bed, and floor-to-ceiling calm</p>
                </div>
              </div>
            </Link>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4">
            <div className="md:min-h-0">
              <Link href="/gallery" className="block group h-full">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/bedroom-brown-wide.webp"
                    alt="Second bedroom — warm brown tones"
                    fill
                    sizes="(max-width: 768px) 50vw, 42vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL("/images/bedroom-brown-wide.webp")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6">
                    <p className="text-gold-300 text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 font-medium">Bedroom Two</p>
                    <h3 className="text-lg md:text-xl font-serif text-white">The Warm Suite</h3>
                  </div>
                </div>
              </Link>
            </div>

            <div className="md:min-h-0">
              <Link href="/gallery" className="block group h-full">
                <div className="relative aspect-[4/3] md:aspect-auto md:h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/images/bedroom-blue-lights.webp"
                    alt="Third bedroom — ambient lighting"
                    fill
                    sizes="(max-width: 768px) 50vw, 42vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL("/images/bedroom-blue-lights.webp")}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 md:p-6">
                    <p className="text-gold-300 text-[10px] md:text-xs uppercase tracking-[0.2em] mb-1 font-medium">Bedroom Three</p>
                    <h3 className="text-lg md:text-xl font-serif text-white">The Night Room</h3>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {villaStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/80 border border-sand/50 rounded-2xl p-5 md:p-6 text-center hover:-translate-y-1 transition-all duration-500"
            >
              <p className="text-xl md:text-2xl font-serif text-charcoal">{stat.value}</p>
              <p className="text-warm-brown text-xs uppercase tracking-wider mt-1.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <BlurFadeIn className="text-center mt-14">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 bg-charcoal text-white px-8 py-3.5 rounded-full hover:bg-espresso transition-all duration-300 group text-sm uppercase tracking-wider font-medium"
          >
            Explore the Villa
            <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </BlurFadeIn>
      </div>
    </section>
  );
}

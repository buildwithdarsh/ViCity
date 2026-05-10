"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BlurFadeIn, RevealOnScroll } from "../AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";

const galleryImages = [
  { src: "/images/bedroom-blue-wide.webp", span: "col-span-2 row-span-2", aspect: "aspect-square" },
  { src: "/images/kitchen-accessories.webp", span: "", aspect: "aspect-square" },
  { src: "/images/bathroom-leaf-closeup.webp", span: "", aspect: "aspect-square" },
  { src: "/images/living-room-tv-staircase.webp", span: "col-span-2", aspect: "aspect-[2/1]" },
];

export default function GalleryPreview() {
  return (
    <section className="py-28 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.06),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        <BlurFadeIn className="text-center mb-16">
          <p className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-4 font-medium">Visual Journey</p>
          <h2 className="text-display font-serif text-white">
            Let the Space Speak
          </h2>
        </BlurFadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {galleryImages.map((img, i) => (
            <RevealOnScroll key={img.src} direction={i % 2 === 0 ? "left" : "right"} className={img.span}>
              <Link href="/gallery" className="block group">
                <div className={`relative ${img.aspect} rounded-2xl overflow-hidden`}>
                  <Image
                    src={img.src}
                    alt="Villa interior"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL(img.src)}
                  />
                  <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500" />
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>

        <BlurFadeIn className="text-center mt-12">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-gold-300 text-sm uppercase tracking-wider hover:text-gold transition-colors duration-300 group"
          >
            View Full Gallery
            <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </BlurFadeIn>
      </div>
    </section>
  );
}

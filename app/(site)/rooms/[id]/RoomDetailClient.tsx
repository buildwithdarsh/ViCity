"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers, FiMaximize, FiChevronLeft, FiChevronRight, FiCheck,
  FiClock, FiShield, FiArrowLeft,
} from "react-icons/fi";
import { FadeIn } from "../../components/AnimatedSection";
import { getBlurDataURL } from "@/lib/blur-placeholders";

type RoomType = {
  id: string;
  name: string;
  maxGuests: number;
  bedType: string;
  roomSize: number;
  description: string;
  images: string[];
  amenities?: { amenity: { id: string; name: string; icon: string | null } }[];
};

const fallbackImages = [
  "/images/bedroom-brown-wide.webp",
  "/images/bedroom-blue-wide.webp",
  "/images/bedroom-blue-lights.webp",
];

export default function RoomDetailClient({ room }: { room: RoomType }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = room.images?.length ? room.images : fallbackImages;

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-5 md:px-6">
        <FadeIn>
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-zinc-500">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:text-charcoal transition-colors">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/rooms" className="hover:text-charcoal transition-colors">Rooms</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-charcoal" aria-current="page">{room.name}</li>
            </ol>
          </nav>

          <Link href="/rooms" className="inline-flex items-center gap-2 text-zinc-500 hover:text-charcoal text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to Rooms
          </Link>
        </FadeIn>

        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden aspect-[16/10]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={images[activeImage]!}
                  alt={`${room.name} image ${activeImage + 1}`}
                  width={1600}
                  height={1000}
                  sizes="(max-width: 1024px) 100vw, 960px"
                  priority
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL(images[activeImage]!)}
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-lg backdrop-blur-sm"
                >
                  <FiChevronRight size={18} />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === activeImage ? "bg-white w-8" : "bg-white/50 w-2"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                    i === activeImage ? "border-gold-500" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${room.name} thumbnail ${i + 1}`}
                    width={80}
                    height={56}
                    loading="lazy"
                    className="object-cover w-full h-full"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL(img)}
                  />
                </button>
              ))}
            </div>
          )}
        </FadeIn>

        <FadeIn delay={0.1} className="mt-10">
          <h1 className="text-3xl md:text-4xl font-serif text-charcoal">{room.name}</h1>
          <div className="w-12 h-[2px] bg-gold-400 mt-4" />
          <div className="flex flex-wrap items-center gap-4 mt-4 text-zinc-500 text-sm">
            <span className="flex items-center gap-1.5"><FiMaximize size={14} /> {room.roomSize} sq ft</span>
            <span className="flex items-center gap-1.5"><FiUsers size={14} /> Up to {room.maxGuests} guests</span>
            <span>{room.bedType} Bed</span>
          </div>
          <p className="mt-6 text-zinc-600 leading-relaxed">
            {room.description || "Experience ultimate comfort in this beautifully appointed room, featuring premium furnishings, luxurious bedding, and stunning views. Every detail has been carefully considered to ensure your stay is nothing short of extraordinary."}
          </p>
        </FadeIn>

        {room.amenities && room.amenities.length > 0 && (
          <FadeIn delay={0.2} className="mt-10">
            <h2 className="text-xl font-serif text-charcoal mb-5">Room Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {room.amenities.map((a, i) => (
                <motion.div
                  key={a.amenity.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-2 text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3 hover:bg-gold-50 transition-colors duration-300"
                >
                  <FiCheck size={14} className="text-gold-500 shrink-0" />
                  {a.amenity.name}
                </motion.div>
              ))}
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.3} className="mt-10">
          <h2 className="text-xl font-serif text-charcoal mb-5">Villa Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FiClock, title: "Check-in / Check-out", desc: "2:00 PM / 11:00 AM" },
              { icon: FiShield, title: "All Sales Final", desc: "No cancellations — plan with confidence" },
              { icon: FiCheck, title: "Breakfast Included", desc: "Complimentary daily breakfast" },
            ].map((policy) => (
              <div key={policy.title} className="flex items-start gap-3 text-sm bg-zinc-50 rounded-xl p-4">
                <policy.icon size={16} className="text-gold-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-charcoal font-medium">{policy.title}</p>
                  <p className="text-zinc-500">{policy.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-12 text-center">
          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gold-500 text-white px-10 py-4 rounded-full hover:bg-gold-600 transition-all duration-300 hover:shadow-lg hover:shadow-gold-500/25 hover:-translate-y-0.5 uppercase tracking-wider text-sm font-medium"
          >
            Book the Villa
          </Link>
        </FadeIn>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { BlurFadeIn } from "../AnimatedSection";
import { getBlurDataURL, getVideoPoster } from "@/lib/blur-placeholders";

/* Row 1: polished interiors mixed with select raw shots */
const row1: MediaItem[] = [
  { src: "/images/bedroom-blue-wide.webp", alt: "Master bedroom — blue ambient lighting", aspect: "landscape" },
  { src: "/images/park-bench.webp", alt: "Relaxing on a park bench", aspect: "portrait" },
  { src: "/images/fort-illuminated-night.webp", alt: "Fort illuminated under the night sky", aspect: "landscape" },
  { src: "/images/homestyle-thali-spread.webp", alt: "Homestyle thali — rice, dal, raita & sabzi", aspect: "landscape" },
  { src: "/images/kitchen-accessories.webp", alt: "Kitchen details and accessories", aspect: "landscape" },
  { src: "/images/red-rose-closeup.webp", alt: "Red rose blooming in the garden", aspect: "portrait" },
  { src: "/images/kulhad-lassi-rose.webp", alt: "Kulhad lassi with a swirl of rose", aspect: "portrait" },
  { src: "/images/bonfire-flames-closeup.webp", alt: "Bonfire crackling on a cool evening", aspect: "landscape" },
  { src: "/images/villa-night-ambiance.mp4", alt: "Night ambiance at the villa", aspect: "landscape", type: "video" },
  { src: "/images/salad-plate-copper-glass.webp", alt: "Fresh salad plate with copper glass", aspect: "portrait" },
  { src: "/images/bathroom-leaf-closeup.webp", alt: "Bathroom leaf wallpaper detail", aspect: "portrait" },
  { src: "/images/sunset-orange-gradient.webp", alt: "Sunset gradient over the hills", aspect: "landscape" },
  { src: "/images/ice-cream-sundae.webp", alt: "Ice cream sundae loaded with toppings", aspect: "portrait" },
  { src: "/images/shadow-silhouettes-night.webp", alt: "Shadow silhouettes of friends at night", aspect: "portrait" },
  { src: "/images/bonfire-blaze-night.mp4", alt: "Bonfire blazing under the stars", aspect: "portrait", type: "video" },
  { src: "/images/living-room-tv-staircase.webp", alt: "Living room with staircase view", aspect: "landscape" },
];

/* Row 2: raw moments + remaining interior peeks */
const row2: MediaItem[] = [
  { src: "/images/puppy-peeking-brickwall.webp", alt: "Puppy peeking over a brick ledge", aspect: "portrait" },
  { src: "/images/sunset-rural-road.webp", alt: "Sunset over a quiet rural road", aspect: "landscape" },
  { src: "/images/mango-slices-bowl.webp", alt: "Fresh mango slices in a steel bowl", aspect: "landscape" },
  { src: "/images/newborn-puppies-burrow.webp", alt: "Newborn puppies huddled in their burrow", aspect: "landscape" },
  { src: "/images/indian-meal-flatlay.webp", alt: "Homestyle Indian meal on black plates", aspect: "portrait" },
  { src: "/images/street-corn-charcoal.webp", alt: "Corn roasting on street-side charcoal", aspect: "portrait" },
  { src: "/images/cloudy-sky-panorama.webp", alt: "Expansive cloudy sky with sun peeking through", aspect: "landscape" },
  { src: "/images/golden-sun-water-reflection.webp", alt: "Golden sun reflecting on still water", aspect: "portrait" },
  { src: "/images/cafe-shakes-wrap.webp", alt: "Shakes and wrap at a local cafe", aspect: "landscape" },
  { src: "/images/restaurant-thali-tray.webp", alt: "Restaurant thali with all the fixings", aspect: "landscape" },
  { src: "/images/dogs-playing-sunrise.webp", alt: "Dogs playing in the morning sun", aspect: "landscape" },
  { src: "/images/baby-birds-nest.mp4", alt: "Baby birds chirping in their nest", aspect: "portrait", type: "video" },
  { src: "/images/pakora-onion-rings.webp", alt: "Pakora & onion rings with green chutney", aspect: "portrait" },
  { src: "/images/scrabble-tea.webp", alt: "Morning chai and a game of Scrabble", aspect: "portrait" },
  { src: "/images/sunset-through-trees.webp", alt: "Sunset framed by tree branches", aspect: "landscape" },
  { src: "/images/streetlamp-night-glow.webp", alt: "Street lamp glowing against the night", aspect: "portrait" },
  { src: "/images/window-sunlight-vines.webp", alt: "Sunlight through vine-covered window", aspect: "portrait" },
  { src: "/images/fallen-petals-earth.webp", alt: "Fallen petals resting on dark earth", aspect: "portrait" },
  { src: "/images/puppy-looking-up.webp", alt: "Puppy looking up playfully", aspect: "landscape" },
];

type MediaItem = { src: string; alt: string; aspect: string; type?: "video" };

function MarqueeRow({ images, direction }: { images: MediaItem[]; direction: "left" | "right" }) {
  const doubled = Array.from({ length: 10 }, () => images).flat();
  return (
    <div className="relative mt-4">
      <div className={`flex gap-4 ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}>
        {doubled.map((img, i) => (
          <div key={`${direction}-${i}`} className="flex-shrink-0 group">
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ width: img.aspect === "portrait" ? 220 : 320, height: 260 }}
            >
              {img.type === "video" ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={getVideoPoster(img.src)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                >
                  <source src={img.src} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL(img.src)}
                />
              )}
              <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-colors duration-500" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-charcoal/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-white/90 text-xs">{img.alt}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UnfilteredCorner() {
  return (
    <section className="py-28 bg-charcoal relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(201,168,76,0.06),transparent_60%)]" />
      <div className="max-w-7xl mx-auto px-5 md:px-6 relative z-10">
        <BlurFadeIn className="text-center mb-16">
          <p className="text-gold-400 text-xs uppercase tracking-[0.3em] mb-4 font-medium">Visual Journey</p>
          <h2 className="text-display font-serif text-white">The Unfiltered Corner</h2>
          <p className="mt-6 text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Polished interiors meet raw, unscripted moments — the full picture of life at the villa
          </p>
        </BlurFadeIn>
      </div>

      <MarqueeRow images={row1} direction="left" />
      <MarqueeRow images={row2} direction="right" />

      <BlurFadeIn className="text-center mt-12 relative z-10">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-gold-300 text-sm uppercase tracking-wider hover:text-gold transition-colors duration-300 group"
        >
          View Full Gallery
          <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
        </Link>
      </BlurFadeIn>
    </section>
  );
}

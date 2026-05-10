"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BlurFadeIn } from "../components/AnimatedSection";
import { getBlurDataURL, getVideoPoster } from "@/lib/blur-placeholders";

interface GalleryImage {
  src: string;
  category: string;
  title: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

const staticGallery: GalleryImage[] = [
  { src: "/images/living-room-sofa-landscape.webp", category: "Living Spaces", title: "Grand Living Room" },
  { src: "/images/living-room-art-lamp.webp", category: "Living Spaces", title: "Art & Ambiance" },
  { src: "/images/living-room-tv-staircase.webp", category: "Living Spaces", title: "Entertainment Lounge" },
  { src: "/images/sitting-area-brick-wall.webp", category: "Living Spaces", title: "Brick Wall Sitting Area" },
  { src: "/images/bedroom-brown-wide.webp", category: "Bedrooms", title: "Brown Suite" },
  { src: "/images/bedroom-blue-wide.webp", category: "Bedrooms", title: "Blue Suite" },
  { src: "/images/bedroom-blue-lights.webp", category: "Bedrooms", title: "Blue Suite — Evening" },
  { src: "/images/bathroom-ginkgo-full.webp", category: "Bathrooms", title: "Ginkgo Bathroom" },
  { src: "/images/bathroom-leaf-full.webp", category: "Bathrooms", title: "Leaf Bathroom" },
  { src: "/images/bathroom-leaf-closeup.webp", category: "Bathrooms", title: "Bathroom Details" },
  { src: "/images/kitchen-cabinets.webp", category: "Kitchen & Dining", title: "Modern Kitchen" },
  { src: "/images/kitchen-accessories.webp", category: "Kitchen & Dining", title: "Kitchen Details" },
  { src: "/images/indian-meal-flatlay.webp", category: "Kitchen & Dining", title: "Home-Style Breakfast" },
  { src: "/images/homestyle-thali-spread.webp", category: "Kitchen & Dining", title: "Homestyle Thali" },
  { src: "/images/mango-slices-bowl.webp", category: "Kitchen & Dining", title: "Fresh Mango Slices" },
  { src: "/images/matar-paneer-kadai.webp", category: "Kitchen & Dining", title: "Matar Paneer in the Making" },
  { src: "/images/carved-carrot-closeup.webp", category: "Kitchen & Dining", title: "Carved Carrot Art" },
  { src: "/images/quinoa-corn-stirfry.webp", category: "Kitchen & Dining", title: "Quinoa Corn Stir-Fry" },
  { src: "/images/salad-plate-dal.webp", category: "Kitchen & Dining", title: "Salad Plate & Dal" },
  { src: "/images/salad-plate-copper-glass.webp", category: "Kitchen & Dining", title: "Farm-to-Table Platter" },
  { src: "/images/green-veggie-plate.webp", category: "Kitchen & Dining", title: "Green Veggie Plate" },
  { src: "/images/paneer-curry-rice-bowl.webp", category: "Kitchen & Dining", title: "Paneer Curry Bowl" },
  { src: "/images/dal-rice-paneer-bowl.webp", category: "Kitchen & Dining", title: "Dal Rice & Paneer" },
  { src: "/images/thali-roti-beetroot.webp", category: "Kitchen & Dining", title: "Thali with Roti & Beetroot" },
  { src: "/images/grilled-paneer-sandwich.webp", category: "Kitchen & Dining", title: "Grilled Paneer Sandwich" },
  { src: "/images/grilled-paneer-salad.webp", category: "Kitchen & Dining", title: "Grilled Paneer Salad" },
  { src: "/images/kulhad-lassi-rose.webp", category: "Kitchen & Dining", title: "Kulhad Lassi" },
  { src: "/images/cafe-shakes-wrap.webp", category: "Kitchen & Dining", title: "Cafe Shakes & Wrap" },
  { src: "/images/masala-pasta-wok.webp", category: "Kitchen & Dining", title: "Masala Pasta" },
  { src: "/images/puri-sabzi-breakfast.webp", category: "Kitchen & Dining", title: "Puri Sabzi Breakfast" },
  { src: "/images/pizza-slice-plate.webp", category: "Kitchen & Dining", title: "Pizza Slice" },
  { src: "/images/pakora-onion-rings.webp", category: "Kitchen & Dining", title: "Pakora & Onion Rings" },
  { src: "/images/pakora-chutney-plate.webp", category: "Kitchen & Dining", title: "Pakora & Green Chutney" },
  { src: "/images/dosa-rolls-chutney.webp", category: "Kitchen & Dining", title: "Dosa Rolls" },
  { src: "/images/roti-sabzi-dinner.webp", category: "Kitchen & Dining", title: "Roti Sabzi Dinner" },
  { src: "/images/mojito-cafe.webp", category: "Kitchen & Dining", title: "Cafe Mojito" },
  { src: "/images/fruit-bowl-pomegranate.webp", category: "Kitchen & Dining", title: "Fruit Bowl" },
  { src: "/images/gajar-halwa-cup.webp", category: "Kitchen & Dining", title: "Gajar Halwa" },
  { src: "/images/ice-cream-sundae.webp", category: "Kitchen & Dining", title: "Ice Cream Sundae" },
  { src: "/images/restaurant-thali-tray.webp", category: "Kitchen & Dining", title: "Restaurant Thali" },
  { src: "/images/grilled-sandwich-plate.webp", category: "Kitchen & Dining", title: "Grilled Sandwich" },
  { src: "/images/sunset-through-trees.webp", category: "Surroundings", title: "Sunset Through Trees" },
  { src: "/images/golden-sun-water-reflection.webp", category: "Surroundings", title: "Golden Reflections" },
  { src: "/images/sunset-rural-road.webp", category: "Surroundings", title: "Country Road at Dusk" },
  { src: "/images/sunset-dramatic-clouds.webp", category: "Surroundings", title: "Dramatic Skies" },
  { src: "/images/sunrise-horizon-silhouette.webp", category: "Surroundings", title: "Sunrise Horizon" },
  { src: "/images/sunset-orange-gradient.webp", category: "Surroundings", title: "Twilight Gradient" },
  { src: "/images/red-rose-closeup.webp", category: "Surroundings", title: "Garden Rose" },
  { src: "/images/window-sunlight-vines.webp", category: "Surroundings", title: "Morning Light & Vines" },
  { src: "/images/fort-illuminated-night.webp", category: "Surroundings", title: "Fort Under the Stars" },
  { src: "/images/cloudy-sky-panorama.webp", category: "Surroundings", title: "Endless Sky" },
  { src: "/images/streetlamp-night-glow.webp", category: "Surroundings", title: "Night Glow" },
  { src: "/images/fallen-petals-earth.webp", category: "Surroundings", title: "Petals on Earth" },
  { src: "/images/street-corn-charcoal.webp", category: "Surroundings", title: "Street Corn on Charcoal" },
  { src: "/images/scrabble-tea.webp", category: "Life at ViCity", title: "Tea & Board Games" },
  { src: "/images/park-bench.webp", category: "Life at ViCity", title: "Leisure in the Park" },
  { src: "/images/puppy-peeking-brickwall.webp", category: "Life at ViCity", title: "Our Furry Greeter" },
  { src: "/images/puppy-looking-up.webp", category: "Life at ViCity", title: "Puppy Love" },
  { src: "/images/bonfire-flames-closeup.webp", category: "Life at ViCity", title: "Evening Bonfire" },
  { src: "/images/newborn-puppies-burrow.webp", category: "Life at ViCity", title: "Newborn Pups" },
  { src: "/images/dogs-playing-sunrise.webp", category: "Life at ViCity", title: "Morning Playtime" },
  { src: "/images/shadow-silhouettes-night.webp", category: "Life at ViCity", title: "Night Shadows" },
];

const DARK = "#1A1208";
const WARM = "#FAF6EF";

/* ── Photo wall hero — ALL images & videos, broken shards, parallax ── */
const heroVideos = [
  "/images/villa-night-ambiance.mp4",
  "/images/bonfire-blaze-night.mp4",
  "/images/baby-birds-nest.mp4",
];

// 30 dramatic broken polygon clip-paths — jagged shards & half-triangles
const shardClips = [
  "polygon(0 0, 100% 0, 100% 72%, 65% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 35% 100%, 0 68%)",
  "polygon(0 0, 70% 0, 100% 30%, 100% 100%, 0 100%)",
  "polygon(30% 0, 100% 0, 100% 100%, 0 100%, 0 28%)",
  "polygon(0 0, 100% 0, 100% 100%, 0 75%)",
  "polygon(0 0, 100% 25%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
  "polygon(25% 0, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
  "polygon(0 20%, 50% 0, 100% 20%, 100% 100%, 0 100%)",
  "polygon(0 0, 80% 0, 100% 40%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 20% 100%, 0 60%)",
  "polygon(0 0, 100% 0, 100% 65%, 40% 100%, 0 100%)",
  "polygon(0 0, 60% 0, 100% 35%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 0 70%)",
  "polygon(0 30%, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
  "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 55% 100%, 0 65%)",
  "polygon(0 0, 100% 0, 100% 65%, 45% 100%, 0 100%)",
  "polygon(0 35%, 55% 0, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 45% 0, 100% 35%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 78%, 0 100%)",
  "polygon(0 0, 100% 22%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 78% 100%, 0 100%)",
  "polygon(22% 0, 100% 0, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 100%, 40% 100%, 0 55%)",
  "polygon(0 0, 60% 0, 100% 45%, 100% 100%, 0 100%)",
  "polygon(0 0, 100% 0, 100% 55%, 60% 100%, 0 100%)",
  "polygon(0 45%, 40% 0, 100% 0, 100% 100%, 0 100%)",
];

// Seeded pseudo-random for deterministic clip/speed per tile
function seededRand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// Build a mixed wall: limit food images, interleave categories, add videos
const wallSources = (() => {
  // Group by category
  const groups: Record<string, GalleryImage[]> = {};
  for (const img of staticGallery) {
    (groups[img.category] ??= []).push(img);
  }

  // Limit food/kitchen images to 8 best picks
  const kitchenPicks = (groups["Kitchen & Dining"] ?? []).filter((_, i) =>
    [0, 1, 4, 7, 10, 14, 18, 24].includes(i)
  );
  groups["Kitchen & Dining"] = kitchenPicks;

  // Round-robin interleave all categories for a mixed wall
  const categoryOrder = ["Living Spaces", "Surroundings", "Kitchen & Dining", "Bedrooms", "Life at ViCity", "Bathrooms"];
  const queues = categoryOrder.map((cat) => [...(groups[cat] ?? [])]);
  const mixed: { src: string; isVideo: boolean }[] = [];
  let empty = false;
  while (!empty) {
    empty = true;
    for (const q of queues) {
      if (q.length > 0) {
        mixed.push({ src: q.shift()!.src, isVideo: false });
        empty = false;
      }
    }
  }

  // Sprinkle videos at roughly even intervals
  const vids = heroVideos.map((v) => ({ src: v, isVideo: true }));
  const step = Math.floor(mixed.length / (vids.length + 1));
  for (let i = vids.length - 1; i >= 0; i--) {
    mixed.splice(step * (i + 1), 0, vids[i]!);
  }

  return mixed;
})();
const allWallSrcs = wallSources;

// Responsive grid config: cols × rows per breakpoint
// mobile 4×7=28 | sm 5×6=30 | md 7×5=35 | lg 9×4=36 | xl 10×4=40
const GRID = { xs: { cols: 2, rows: 6 }, sm: { cols: 4, rows: 5 }, md: { cols: 6, rows: 4 }, lg: { cols: 8, rows: 3 }, xl: { cols: 10, rows: 4 } };
const MAX_VISIBLE = Math.max(GRID.xs.cols * GRID.xs.rows, GRID.sm.cols * GRID.sm.rows, GRID.md.cols * GRID.md.rows, GRID.lg.cols * GRID.lg.rows, GRID.xl.cols * GRID.xl.rows);

// Pre-compute clip & speed for visible tiles only
const wallTiles = allWallSrcs.slice(0, MAX_VISIBLE).map((item, i) => ({
  ...item,
  clip: shardClips[i % shardClips.length]!,
  speed: 0.04 + seededRand(i) * 0.22,
  rotateDir: seededRand(i + 100) > 0.5 ? 1 : -1,
  delay: seededRand(i + 200) * 0.5,
}));

function WallShard({
  tile,
  index,
  mouseX,
  mouseY,
}: {
  tile: (typeof wallTiles)[number];
  index: number;
  mouseX: ReturnType<typeof useSpring>;
  mouseY: ReturnType<typeof useSpring>;
}) {
  const strength = tile.speed * 50;
  const x = useTransform(mouseX, [-1, 1], [strength * tile.rotateDir, -strength * tile.rotateDir]);
  const y = useTransform(mouseY, [-1, 1], [strength * 0.7, -strength * 0.7]);
  const rotate = useTransform(mouseX, [-1, 1], [-tile.rotateDir * 2.5, tile.rotateDir * 2.5]);

  return (
    <motion.div
      className="relative w-full h-full min-h-0 overflow-visible"
      style={{ clipPath: tile.clip, x, y, rotate, margin: '-4px', zIndex: index % 3 }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1.06 }}
      transition={{ duration: 0.8, delay: tile.delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {tile.isVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={getVideoPoster(tile.src)}
          className="absolute inset-0 w-full h-full object-cover scale-125"
        >
          <source src={tile.src} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={tile.src}
          alt=""
          fill
          sizes="(max-width:640px) 50vw, (max-width:768px) 25vw, (max-width:1024px) 17vw, (max-width:1280px) 13vw, 10vw"
          className="object-cover scale-125"
          loading={index < 10 ? "eager" : "lazy"}
          priority={index < 8}
          placeholder="blur"
          blurDataURL={getBlurDataURL(tile.src)}
        />
      )}
      <div className="absolute inset-0 bg-charcoal/15" />
    </motion.div>
  );
}

function GalleryPhotoWall() {
  const sectionRef = useRef<HTMLElement>(null);

  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const mouseX = useSpring(rawMouseX, { stiffness: 80, damping: 30 });
  const mouseY = useSpring(rawMouseY, { stiffness: 80, damping: 30 });

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawMouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
      rawMouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
    },
    [rawMouseX, rawMouseY],
  );

  const handlePointerLeave = useCallback(() => {
    rawMouseX.set(0);
    rawMouseY.set(0);
  }, [rawMouseX, rawMouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[50svh] overflow-hidden bg-charcoal"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Photo wall grid — overlapping shards for collage feel */}
      <div
        className="absolute inset-[-8px] grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
        style={{ gridTemplateRows: `repeat(var(--wall-rows), minmax(0, 1fr))`, gridAutoRows: 0, gap: 0 }}
      >
        <style>{`
          :root { --wall-rows: ${GRID.xs.rows}; }
          @media (min-width: 640px)  { :root { --wall-rows: ${GRID.sm.rows}; } }
          @media (min-width: 768px)  { :root { --wall-rows: ${GRID.md.rows}; } }
          @media (min-width: 1024px) { :root { --wall-rows: ${GRID.lg.rows}; } }
          @media (min-width: 1280px) { :root { --wall-rows: ${GRID.xl.rows}; } }
        `}</style>
        {wallTiles.map((tile, i) => (
          <WallShard key={tile.src} tile={tile} index={i} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-charcoal/50 pointer-events-none z-[1]" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(26,18,8,0.75) 100%)" }}
      />

      {/* Text overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end min-h-[50svh] pt-28 pb-20 md:pt-40 md:pb-32 px-5 text-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 48 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="h-[1px] bg-gold mx-auto mb-6"
        />
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-gold-300 text-xs uppercase tracking-[0.35em] mb-4 font-medium"
        >
          Visual Journey
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-display font-serif text-white"
        >
          Gallery
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-white/60 text-lg max-w-2xl mx-auto"
        >
          Explore every corner of our villa — from sun-drenched living spaces to tranquil bedrooms crafted for rest and renewal
        </motion.p>
      </div>
    </section>
  );
}

function ZoneDivider({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative leading-[0] -my-px" style={{ backgroundColor: from }}>
      <svg
        viewBox="0 0 1440 24"
        preserveAspectRatio="none"
        className="block w-full h-[20px] md:h-[28px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0,0 C480,24 960,24 1440,0 L1440,24 L0,24 Z" fill={to} />
      </svg>
    </div>
  );
}

/* ── Reusable image card — fills its parent completely ── */
function Card({ img, onClick }: { img: GalleryImage; onClick: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  return (
    <div
      ref={ref}
      className="relative w-full h-full overflow-hidden rounded-2xl cursor-pointer group"
      onClick={onClick}
    >
      <motion.div className="absolute inset-[-6%] w-[112%] h-[112%]" style={{ y: imgY }}>
        <Image
          src={img.src}
          alt={img.title}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          placeholder="blur"
          blurDataURL={getBlurDataURL(img.src)}
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
        <div className="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
          <p className="text-gold-300 text-[10px] uppercase tracking-[0.2em] mb-0.5">{img.category}</p>
          <p className="text-white text-sm font-serif">{img.title}</p>
        </div>
      </div>
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/12 to-transparent rotate-12 translate-x-[-100%] group-hover:translate-x-[250%] transition-transform duration-[1.4s] ease-out pointer-events-none" />
    </div>
  );
}

/* ── Section heading ── */
function SectionHead({ label, heading, dark, center }: { label: string; heading: string; dark?: boolean; center?: boolean }) {
  return (
    <div className={`mb-6 md:mb-8 ${center ? "text-center" : ""}`}>
      <p className="text-gold text-[11px] uppercase tracking-[0.3em] mb-2">{label}</p>
      <h2 className={`font-serif text-2xl md:text-3xl ${dark ? "text-white" : "text-charcoal"}`}>{heading}</h2>
    </div>
  );
}

/* ── Masonry item for filtered view ── */
function MasonryItem({ img, index, onClick }: { img: GalleryImage; index: number; onClick: () => void }) {
  const aspects = ["aspect-[4/3]", "aspect-[3/4]", "aspect-square"];
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: (index % 4) * 0.04, ease }}
      className="mb-4 break-inside-avoid"
    >
      <div className={`${aspects[index % 3]}`}>
        <Card img={img} onClick={onClick} />
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const allImages = staticGallery;
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = ["All", ...Array.from(new Set(allImages.map((img) => img.category)))];
  const filtered = active === "All" ? allImages : allImages.filter((img) => img.category === active);

  const closeLightbox = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i !== null && i > 0 ? i - 1 : filtered.length - 1)), [filtered.length]);
  const next = useCallback(() => setLightbox((i) => (i !== null && i < filtered.length - 1 ? i + 1 : 0)), [filtered.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, closeLightbox, prev, next]);

  useEffect(() => {
    if (lightbox !== null) document.body.classList.add("menu-open");
    else document.body.classList.remove("menu-open");
    return () => document.body.classList.remove("menu-open");
  }, [lightbox]);

  const touchStart = useRef<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStart.current = e.touches[0]!.clientX; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0]!.clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
    touchStart.current = null;
  }, [next, prev]);

  const openByImage = useCallback((img: GalleryImage) => {
    setActive("All");
    setTimeout(() => setLightbox(allImages.indexOf(img)), 50);
  }, [allImages]);

  const categorized = useMemo(() => {
    const map: Record<string, GalleryImage[]> = {};
    for (const img of allImages) {
      (map[img.category] ??= []).push(img);
    }
    return map;
  }, [allImages]);
  const living = categorized["Living Spaces"] ?? [];
  const beds = categorized["Bedrooms"] ?? [];
  const bath = categorized["Bathrooms"] ?? [];
  const kitchen = categorized["Kitchen & Dining"] ?? [];
  const surr = categorized["Surroundings"] ?? [];
  const life = categorized["Life at ViCity"] ?? [];

  const open = (img: GalleryImage) => () => setLightbox(allImages.indexOf(img));

  return (
    <>
      <GalleryPhotoWall />

      {/* Filters */}
      <section className="py-4 md:py-6 border-b border-sand bg-cream/80 backdrop-blur-xl sticky top-[52px] md:top-[60px] z-30">
        <div className="relative max-w-7xl mx-auto">
          {/* Fade edges on mobile to hint at scrollability */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-cream/80 to-transparent z-10 pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-cream/80 to-transparent z-10 pointer-events-none md:hidden" />
          <div className="px-4 md:px-6 flex overflow-x-auto md:flex-wrap md:justify-center gap-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`relative px-4 md:px-6 py-2 md:py-2.5 rounded-full text-[13px] md:text-sm transition-colors duration-300 whitespace-nowrap flex-shrink-0 min-h-[40px] md:min-h-[44px] flex items-center ${
                  active === cat ? "text-white" : "text-warm-brown hover:text-charcoal"
                }`}
              >
                {active === cat && (
                  <motion.div layoutId="activeFilter" className="absolute inset-0 bg-charcoal rounded-full" transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {active === "All" ? (
        <>
          {/* ═══ Living Spaces — bento: tall left + right col ═══ */}
          <section className="bg-cream pt-14 md:pt-20 pb-3">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Living Spaces" heading="Where Comfort Meets Character" />
              <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-3 md:gap-4 h-[400px] md:h-[560px]">
                <div className="col-span-2 row-span-2"><Card img={living[0]!} onClick={open(living[0]!)} /></div>
                <div className="col-span-1 row-span-1"><Card img={living[1]!} onClick={open(living[1]!)} /></div>
                <div className="col-span-1 row-span-1"><Card img={living[2]!} onClick={open(living[2]!)} /></div>
                <div className="col-span-2 row-span-1"><Card img={living[3]!} onClick={open(living[3]!)} /></div>
              </div>
            </div>
          </section>

          {/* ═══ Bedrooms — 3 equal ═══ */}
          <section className="bg-cream py-3 md:py-4">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Bedrooms" heading="Rest, Reimagined" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 h-auto sm:h-[320px] md:h-[400px]">
                {beds.map((img) => (
                  <div key={img.src} className="h-[240px] sm:h-full"><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
            </div>
          </section>

          <ZoneDivider from={WARM} to={DARK} />

          {/* ═══ Bathrooms — dark bento ═══ */}
          <section className="bg-charcoal py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Bathrooms" heading="Thoughtful Details" dark />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 h-auto sm:h-[320px] md:h-[400px]">
                {bath.map((img) => (
                  <div key={img.src} className="h-[240px] sm:h-full"><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
            </div>
          </section>

          <ZoneDivider from={DARK} to={WARM} />

          {/* ═══ Kitchen & Dining — large food gallery ═══ */}
          <section className="bg-cream py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Kitchen & Dining" heading="Flavours of Home" center />
              {/* Row 1 — hero bento */}
              <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-2 gap-3 md:gap-4 h-[320px] md:h-[560px]">
                <div className="col-span-2 md:col-span-4 row-span-1 md:row-span-2"><Card img={kitchen[0]!} onClick={open(kitchen[0]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={kitchen[1]!} onClick={open(kitchen[1]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={kitchen[2]!} onClick={open(kitchen[2]!)} /></div>
              </div>
              {/* Row 2 — 4-grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[280px] md:h-[280px] mt-3 md:mt-4">
                {kitchen.slice(3, 7).map((img) => (
                  <div key={img.src}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 3 — 3-grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-[400px] md:h-[300px] mt-3 md:mt-4">
                {kitchen.slice(7, 10).map((img, i) => (
                  <div key={img.src} className={i === 2 ? "col-span-2 md:col-span-1" : ""}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 4 — bento 2+1 tall */}
              <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-2 gap-3 md:gap-4 h-[400px] md:h-[520px] mt-3 md:mt-4">
                <div className="col-span-1 md:col-span-2 row-span-2"><Card img={kitchen[10]!} onClick={open(kitchen[10]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={kitchen[11]!} onClick={open(kitchen[11]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={kitchen[12]!} onClick={open(kitchen[12]!)} /></div>
                <div className="col-span-2 md:col-span-4 row-span-1"><Card img={kitchen[13]!} onClick={open(kitchen[13]!)} /></div>
              </div>
              {/* Row 5 — 4-grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[280px] md:h-[280px] mt-3 md:mt-4">
                {kitchen.slice(14, 18).map((img) => (
                  <div key={img.src}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 6 — 3-grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-[400px] md:h-[300px] mt-3 md:mt-4">
                {kitchen.slice(18, 21).map((img, i) => (
                  <div key={img.src} className={i === 2 ? "col-span-2 md:col-span-1" : ""}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 7 — remaining */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-[400px] md:h-[300px] mt-3 md:mt-4">
                {kitchen.slice(21, 24).map((img, i) => (
                  <div key={img.src} className={i === 2 ? "col-span-2 md:col-span-1" : ""}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 8 — 4-grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[280px] md:h-[280px] mt-3 md:mt-4">
                {kitchen.slice(24, 28).map((img) => (
                  <div key={img.src}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
              {/* Row 9 — last batch */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-[400px] md:h-[300px] mt-3 md:mt-4">
                {kitchen.slice(28).map((img, i, arr) => (
                  <div key={img.src} className={i === arr.length - 1 && arr.length % 2 !== 0 ? "col-span-2 md:col-span-1" : ""}><Card img={img} onClick={open(img)} /></div>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ Surroundings — organic bento ═══ */}
          <section className="bg-cream py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Surroundings" heading="Golden Hours & Open Skies" center />
              {/* Row 1 */}
              <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-2 gap-3 md:gap-4 h-[400px] md:h-[520px]">
                <div className="col-span-2 md:col-span-3 row-span-1 md:row-span-2"><Card img={surr[5]!} onClick={open(surr[5]!)} /></div>
                <div className="col-span-2 md:col-span-3 row-span-1"><Card img={surr[2]!} onClick={open(surr[2]!)} /></div>
                <div className="col-span-1 row-span-1"><Card img={surr[0]!} onClick={open(surr[0]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={surr[3]!} onClick={open(surr[3]!)} /></div>
              </div>
              {/* Row 2 */}
              <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 h-[400px] md:h-[520px] mt-3 md:mt-4">
                <div className="col-span-1 row-span-1 md:row-span-2"><Card img={surr[1]!} onClick={open(surr[1]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={surr[4]!} onClick={open(surr[4]!)} /></div>
                <div className="col-span-1 row-span-1 md:row-span-2"><Card img={surr[6]!} onClick={open(surr[6]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={surr[7]!} onClick={open(surr[7]!)} /></div>
              </div>
              {/* Row 3 — new raw shots */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-[280px] md:h-[280px] mt-3 md:mt-4">
                <div className="col-span-1"><Card img={surr[8]!} onClick={open(surr[8]!)} /></div>
                <div className="col-span-1"><Card img={surr[9]!} onClick={open(surr[9]!)} /></div>
                <div className="col-span-1"><Card img={surr[10]!} onClick={open(surr[10]!)} /></div>
                <div className="col-span-1"><Card img={surr[11]!} onClick={open(surr[11]!)} /></div>
              </div>
            </div>
          </section>

          <ZoneDivider from={WARM} to={DARK} />

          {/* ═══ Life at ViCity — dark ═══ */}
          <section className="bg-charcoal py-14 md:py-20">
            <div className="max-w-7xl mx-auto px-5 md:px-6">
              <SectionHead label="Life at ViCity" heading="More Than a Stay" dark center />
              <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-2 gap-3 md:gap-4 h-[320px] md:h-[580px]">
                <div className="col-span-2 md:col-span-4 row-span-1 md:row-span-2"><Card img={life[0]!} onClick={() => openByImage(life[0]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-1"><Card img={life[1]!} onClick={() => openByImage(life[1]!)} /></div>
                <div className="col-span-1 row-span-1"><Card img={life[2]!} onClick={() => openByImage(life[2]!)} /></div>
                {life[3] && <div className="hidden md:block col-span-1 row-span-1"><Card img={life[3]!} onClick={() => openByImage(life[3]!)} /></div>}
              </div>
              {/* Row 1b — life[3] on mobile only */}
              {life[3] && (
                <div className="grid grid-cols-2 gap-3 h-[180px] mt-3 md:hidden">
                  <div><Card img={life[3]!} onClick={() => openByImage(life[3]!)} /></div>
                  {life[4] && <div><Card img={life[4]!} onClick={() => openByImage(life[4]!)} /></div>}
                </div>
              )}
              {/* Row 2 — videos + raw moments */}
              <div className="grid grid-cols-2 md:grid-cols-6 md:grid-rows-2 gap-3 md:gap-4 h-[400px] md:h-[580px] mt-3 md:mt-4">
                <div className="col-span-1 md:col-span-2 row-span-2 relative rounded-2xl overflow-hidden">
                  <video autoPlay muted loop playsInline preload="metadata" poster={getVideoPoster("/images/villa-night-ambiance.mp4")} className="absolute inset-0 w-full h-full object-cover">
                    <source src="/images/villa-night-ambiance.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5">
                    <p className="text-gold-300 text-[10px] uppercase tracking-[0.2em] mb-0.5">Life at ViCity</p>
                    <p className="text-white text-sm font-serif">Night Ambiance</p>
                  </div>
                </div>
                <div className="hidden md:block col-span-2 row-span-1"><Card img={life[4]!} onClick={() => openByImage(life[4]!)} /></div>
                <div className="col-span-1 md:col-span-2 row-span-2 relative rounded-2xl overflow-hidden">
                  <video autoPlay muted loop playsInline preload="metadata" poster={getVideoPoster("/images/bonfire-blaze-night.mp4")} className="absolute inset-0 w-full h-full object-cover">
                    <source src="/images/bonfire-blaze-night.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5">
                    <p className="text-gold-300 text-[10px] uppercase tracking-[0.2em] mb-0.5">Life at ViCity</p>
                    <p className="text-white text-sm font-serif">Bonfire Night</p>
                  </div>
                </div>
                <div className="col-span-2 row-span-1"><Card img={life[5]!} onClick={() => openByImage(life[5]!)} /></div>
              </div>
              {/* Row 3 — video + remaining images */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 h-[200px] md:h-[320px] mt-3 md:mt-4">
                <div className="col-span-1 relative rounded-2xl overflow-hidden">
                  <video autoPlay muted loop playsInline preload="metadata" poster={getVideoPoster("/images/baby-birds-nest.mp4")} className="absolute inset-0 w-full h-full object-cover">
                    <source src="/images/baby-birds-nest.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-5">
                    <p className="text-gold-300 text-[10px] uppercase tracking-[0.2em] mb-0.5">Life at ViCity</p>
                    <p className="text-white text-sm font-serif">Baby Birds</p>
                  </div>
                </div>
                <div className="col-span-1"><Card img={life[6]!} onClick={() => openByImage(life[6]!)} /></div>
                <div className="col-span-2 md:col-span-1"><Card img={life[7]!} onClick={() => openByImage(life[7]!)} /></div>
              </div>
            </div>
          </section>

          <ZoneDivider from={DARK} to={WARM} />

          {/* ═══ Closing CTA ═══ */}
          <section className="py-28 md:py-36 bg-cream relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.08),transparent_60%)]" />
            </div>
            <div className="max-w-3xl mx-auto px-5 md:px-6 text-center relative z-10">
              <BlurFadeIn>
                <p className="text-gold text-xs uppercase tracking-[0.4em] mb-5">{allImages.length*10}+ moments and counting</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-charcoal leading-tight">
                  The best memories are
                  <br />
                  the ones you <span className="italic text-gold">live</span>
                </h2>
                <p className="mt-6 text-warm-brown/60 text-lg max-w-xl mx-auto leading-relaxed">
                  These are just pictures. The real magic is waking up here, coffee in hand, sunlight through the vines.
                </p>
                <div className="mt-10">
                  <Link
                    href="/booking"
                    className="inline-flex bg-charcoal text-white px-10 py-4 rounded-full text-sm uppercase tracking-wider font-semibold hover:bg-charcoal/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-center min-h-[48px] items-center justify-center"
                  >
                    Book Your Stay
                  </Link>
                </div>
              </BlurFadeIn>
            </div>
          </section>
        </>
      ) : (
        <section className="py-16 bg-cream">
          <div className="max-w-7xl mx-auto px-5 md:px-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
              >
                {filtered.map((img, i) => (
                  <MasonryItem key={`${img.src}-${active}`} img={img} index={i} onClick={() => setLightbox(i)} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-charcoal/98 z-50 flex items-center justify-center backdrop-blur-2xl"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 text-white/70 text-sm tracking-wider z-10">
              {lightbox + 1} / {filtered.length}
            </div>

            <button onClick={closeLightbox} aria-label="Close" className="absolute top-4 right-4 md:top-6 md:right-6 text-white/50 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center z-10">
              <FiX size={28} />
            </button>

            <button onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous" className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
              <FiChevronLeft size={24} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next" className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors z-10">
              <FiChevronRight size={24} />
            </button>

            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl max-h-[85vh] relative px-4 md:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image src={filtered[lightbox]!.src} alt={filtered[lightbox]!.title} width={1200} height={800} className="object-contain max-h-[78vh] rounded-2xl shadow-2xl" placeholder="blur" blurDataURL={getBlurDataURL(filtered[lightbox]!.src)} />
              <div className="text-center mt-5">
                <p className="text-white font-serif text-xl">{filtered[lightbox]!.title}</p>
                <p className="text-gold text-sm mt-1 uppercase tracking-[0.15em]">{filtered[lightbox]!.category}</p>
              </div>
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden sm:flex gap-2 max-w-md overflow-x-auto px-4 scrollbar-hide">
              {filtered.map((img, i) => (
                <button key={img.src} onClick={(e) => { e.stopPropagation(); setLightbox(i); }} className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${lightbox === i ? "ring-2 ring-gold scale-110" : "opacity-40 hover:opacity-70"}`}>
                  <Image src={img.src} alt={img.title} fill loading="lazy" className="object-cover" sizes="56px" placeholder="blur" blurDataURL={getBlurDataURL(img.src)} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

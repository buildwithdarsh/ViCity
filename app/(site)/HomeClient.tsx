"use client";

import dynamic from "next/dynamic";
import { StickyScrollSection } from "./components/AnimatedSection";


import { formatCurrency } from "@/lib/utils/currency";

import HeroSection from "./components/home/HeroSection";
import PricingBar from "./components/home/PricingBar";
import HighlightsSection from "./components/home/HighlightsSection";
import VillaShowcase from "./components/home/VillaShowcase";

// Below-fold sections: lazy-loaded to reduce initial bundle
const CinematicCTA = dynamic(() => import("./components/home/CinematicCTA"));
const AboutPreview = dynamic(() => import("./components/home/AboutPreview"));
const UnfilteredCorner = dynamic(() => import("./components/home/UnfilteredCorner"));
const ReviewsSection = dynamic(() => import("./components/home/ReviewsSection"));
const FinalCTA = dynamic(() => import("./components/home/FinalCTA"));

export type { HomeReview } from "./components/home/ReviewsSection";

/* SVG divider — very subtle, shallow curve.
   Sits flush against both sections with no visible gap. */
function ZoneDivider({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative leading-[0] -my-px" style={{ backgroundColor: from }}>
      <svg
        viewBox="0 0 1440 24"
        preserveAspectRatio="none"
        className="block w-full h-[20px] md:h-[28px]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 C480,24 960,24 1440,0 L1440,24 L0,24 Z"
          fill={to}
        />
      </svg>
    </div>
  );
}

const experienceItems = [
  {
    title: "Restful Sanctuaries",
    description: "Three spacious bedrooms, each a quiet retreat. Cloud-soft bedding, warm ambient light, and the kind of silence that lets you truly rest.",
    image: "/images/bedroom-brown-wide.webp",
  },
  {
    title: "A Kitchen to Gather In",
    description: "Fully equipped with everything you need. Morning coffee, late-night feasts, or anything in between — the space is yours to use.",
    image: "/images/kitchen-cabinets.webp",
  },
  {
    title: "Spa-Inspired Bathrooms",
    description: "Rain showers, curated wallpaper, and hand-picked details transform the everyday into ritual. Step in and slow down.",
    image: "/images/bathroom-ginkgo-full.webp",
  },
  {
    title: "Living Spaces That Breathe",
    description: "The expansive living room is the heart of the villa. Made for long conversations, quiet mornings, and everything in between.",
    image: "/images/living-room-art-lamp.webp",
  },
];

interface HomeClientProps {
  reviews: import("./components/home/ReviewsSection").HomeReview[];
  currencySymbol: string;
  maxGuestsIncluded: number;
  basePrice: number;
}

/* Color tokens — hard hex values matching the section bg colors */
const DARK = "#1A1208";
const WARM = "#FAF6EF";

export default function HomeClient({ reviews, currencySymbol, maxGuestsIncluded, basePrice }: HomeClientProps) {
  const pricePerNight = formatCurrency(basePrice);

  return (
    <>
      {/* =====================================================
          ZONE 1 — DARK: First Impression & Anchor
          Hero hooks with emotion, PricingBar anchors value
          upfront — eliminates the #1 bounce: "How much?"
          ===================================================== */}
      <HeroSection />
      <PricingBar currencySymbol={currencySymbol} basePrice={basePrice} maxGuestsIncluded={maxGuestsIncluded} />

      <ZoneDivider from={DARK} to={WARM} />

      {/* =====================================================
          ZONE 2 — WARM: Build Trust & Show the Product
          Highlights answer "why here?" Experience lets them
          walk through each room. Villa Showcase gives concrete
          bedroom views. Logical brain kicks in after the hook.
          ===================================================== */}
      <HighlightsSection />
      <StickyScrollSection items={experienceItems} className="bg-cream" />
      <VillaShowcase />

      <ZoneDivider from={WARM} to={DARK} />

      {/* =====================================================
          ZONE 3 — DARK: Visual Immersion & Desire
          CinematicCTA is the emotional peak — full-bleed
          parallax that creates desire. Unfiltered Corner
          combines polished interiors + raw behind-the-scenes
          into one visual showcase. Moves the user from
          "looks nice" to "I want to be there."
          ===================================================== */}
      <UnfilteredCorner />
      <CinematicCTA pricePerNight={pricePerNight} />

      <ZoneDivider from={DARK} to={WARM} />

      {/* =====================================================
          ZONE 4 — WARM: Social Proof & Story
          About humanizes the brand. Reviews seal the deal
          with third-party validation. User now trusts both
          the space AND the people behind it.
          ===================================================== */}
      <AboutPreview pricePerNight={pricePerNight} />
      <ReviewsSection reviews={reviews} />

      <ZoneDivider from={WARM} to={DARK} />

      {/* =====================================================
          ZONE 5 — DARK: The Close
          Single clear action: Book or WhatsApp.
          No distractions, just the decision point.
          ===================================================== */}
      <FinalCTA />
    </>
  );
}

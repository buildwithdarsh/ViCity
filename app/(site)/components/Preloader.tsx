"use client";

import { useEffect, useRef } from "react";

// ── Placeholder manifest (tiny ~0.25KB blurred images) ──────────
const PLACEHOLDER_IMAGES = [
  "/images/placeholders/living-room-sofa-landscape.webp",
  "/images/placeholders/bedroom-blue-wide.webp",
  "/images/placeholders/bedroom-brown-wide.webp",
  "/images/placeholders/bedroom-blue-lights.webp",
  "/images/placeholders/sitting-area-brick-wall.webp",
  "/images/placeholders/living-room-art-lamp.webp",
  "/images/placeholders/living-room-tv-staircase.webp",
  "/images/placeholders/park-bench.webp",
  "/images/placeholders/fort-illuminated-night.webp",
  "/images/placeholders/homestyle-thali-spread.webp",
  "/images/placeholders/kitchen-accessories.webp",
  "/images/placeholders/red-rose-closeup.webp",
  "/images/placeholders/kulhad-lassi-rose.webp",
  "/images/placeholders/bonfire-flames-closeup.webp",
  "/images/placeholders/salad-plate-copper-glass.webp",
  "/images/placeholders/bathroom-leaf-closeup.webp",
  "/images/placeholders/sunset-orange-gradient.webp",
  "/images/placeholders/ice-cream-sundae.webp",
];
const TOTAL_TASKS = PLACEHOLDER_IMAGES.length + 2; // placeholders + fonts + JS chunks
const MIN_DISPLAY_MS = 4200;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}
async function preloadJSChunks(): Promise<void> {
  try {
    await Promise.allSettled([
      import("./home/CinematicCTA"),
      import("./home/AboutPreview"),
      import("./home/UnfilteredCorner"),
      import("./home/ReviewsSection"),
      import("./home/FinalCTA"),
    ]);
  } catch { /* non-blocking */ }
}

// ── SVG Scene: Day → Night fade transition ──────────────────────
function SceneIllustration() {
  return (
    <svg
      viewBox="0 0 800 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        {/* Sun radial glow */}
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.5" />
          <stop offset="30%" stopColor="#C9A84C" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
        {/* Moon glow */}
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8D5B0" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#E8D5B0" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#E8D5B0" stopOpacity="0" />
        </radialGradient>
        {/* Moonlit glow filter for landscape */}
        <filter id="moonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
        {/* Warm sky wash for daytime — very subtle, blends with bg */}
        <radialGradient id="dayWash" cx="50%" cy="25%" r="60%">
          <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ═══ SUN — visible immediately, fades out ═══ */}
      <g className="pl-sun">
        {/* Warm sky wash — radial so no hard edges */}
        <ellipse cx="400" cy="90" rx="400" ry="250" fill="url(#dayWash)" />

        {/* Sun — fixed upper-center */}
        <circle cx="400" cy="90" r="90" fill="url(#sunGlow)" />
        <circle cx="400" cy="90" r="22" fill="#C9A84C" fillOpacity="0.45" />
        <circle cx="400" cy="90" r="14" fill="#C9A84C" fillOpacity="0.65" />
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={400 + Math.cos((angle * Math.PI) / 180) * 26}
            y1={90 + Math.sin((angle * Math.PI) / 180) * 26}
            x2={400 + Math.cos((angle * Math.PI) / 180) * 38}
            y2={90 + Math.sin((angle * Math.PI) / 180) * 38}
            stroke="#C9A84C"
            strokeOpacity="0.25"
            strokeWidth="1"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* ═══ STARS — each fades in individually with staggered delay ═══ */}
      {[
        [80, 45], [150, 95], [240, 35], [330, 70], [450, 50],
        [520, 85], [580, 30], [700, 55], [750, 90], [40, 80],
        [200, 65], [480, 40], [660, 25], [110, 60], [370, 25],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x} cy={y}
          r={i % 3 === 0 ? 1.3 : i % 2 === 0 ? 1 : 0.7}
          fill="#E8D5B0"
          fillOpacity="0.6"
          className="pl-star"
          style={{ animationDelay: `${1.8 + i * 0.12}s` }}
        />
      ))}

      {/* ═══ MOON — fades in after sun starts fading ═══ */}
      <g className="pl-moon">
        <circle cx="620" cy="70" r="60" fill="url(#moonGlow)" />
        <circle cx="620" cy="70" r="14" fill="#E8D5B0" fillOpacity="0.2" />
        <circle cx="620" cy="70" r="10" fill="#E8D5B0" fillOpacity="0.35" />
        {/* Crescent shadow */}
        <circle cx="624" cy="67" r="8" fill="#1A1208" fillOpacity="0.4" />
      </g>

      {/* ═══ LANDSCAPE — always visible, draws in ═══ */}

      {/* Far mountains — outline only, no fill box */}
      <path
        d="M0 270 L60 210 L120 240 L200 175 L280 225 L360 165 L440 215 L520 185 L600 235 L680 195 L760 230 L800 215"
        fill="none"
        stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="0.8"
        className="pl-fade" style={{ animationDelay: "0.2s" }}
      />

      {/* Near mountains — outline only */}
      <path
        d="M0 310 L80 260 L160 285 L260 230 L340 275 L420 240 L520 265 L600 248 L680 280 L760 255 L800 270"
        fill="none"
        stroke="#C9A84C" strokeOpacity="0.18" strokeWidth="1"
        className="pl-fade" style={{ animationDelay: "0.4s" }}
      />

      {/* Ground line — no filled rect to avoid visible box */}
      <line x1="0" y1="325" x2="800" y2="325" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.8" className="pl-fade" style={{ animationDelay: "0.5s" }} />

      {/* Left trees */}
      <g className="pl-fade" style={{ animationDelay: "0.7s" }}>
        <line x1="110" y1="325" x2="110" y2="268" stroke="#C9A84C" strokeOpacity="0.25" strokeWidth="2" />
        <path d="M110 268 L92 292 L101 287 L88 306 L100 300 L94 316 L110 306 L126 316 L120 300 L132 306 L119 287 L128 292Z" fill="none" stroke="#C9A84C" strokeOpacity="0.2" strokeWidth="0.7" />
      </g>
      <g className="pl-fade" style={{ animationDelay: "0.8s" }}>
        <line x1="145" y1="325" x2="145" y2="284" stroke="#C9A84C" strokeOpacity="0.2" strokeWidth="1.5" />
        <path d="M145 284 L132 302 L139 298 L130 314 L140 308 L145 316 L150 308 L160 314 L151 298 L158 302Z" fill="none" stroke="#C9A84C" strokeOpacity="0.14" strokeWidth="0.6" />
      </g>

      {/* Right trees */}
      <g className="pl-fade" style={{ animationDelay: "0.75s" }}>
        <line x1="660" y1="325" x2="660" y2="275" stroke="#C9A84C" strokeOpacity="0.22" strokeWidth="1.8" />
        <path d="M660 275 L644 296 L652 292 L640 310 L651 304 L646 320 L660 310 L674 320 L669 304 L680 310 L668 292 L676 296Z" fill="none" stroke="#C9A84C" strokeOpacity="0.17" strokeWidth="0.7" />
      </g>
      <g className="pl-fade" style={{ animationDelay: "0.85s" }}>
        <line x1="695" y1="325" x2="695" y2="290" stroke="#C9A84C" strokeOpacity="0.17" strokeWidth="1.4" />
        <path d="M695 290 L684 306 L690 302 L682 315 L691 310 L695 318 L699 310 L708 315 L700 302 L706 306Z" fill="none" stroke="#C9A84C" strokeOpacity="0.12" strokeWidth="0.6" />
      </g>

      {/* Villa */}
      <g className="pl-fade" style={{ animationDelay: "1.0s" }}>
        <rect x="320" y="260" width="160" height="65" rx="1" stroke="#C9A84C" strokeOpacity="0.3" strokeWidth="1" fill="none" />
        <path d="M310 260 L400 218 L490 260" stroke="#C9A84C" strokeOpacity="0.35" strokeWidth="1.2" fill="none" />
        <line x1="400" y1="218" x2="400" y2="205" stroke="#C9A84C" strokeOpacity="0.3" strokeWidth="0.8" />
        <circle cx="400" cy="202" r="3" fill="#C9A84C" fillOpacity="0.2" />
        <rect x="338" y="276" width="16" height="20" rx="1" stroke="#C9A84C" strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
        <rect x="364" y="276" width="16" height="20" rx="1" stroke="#C9A84C" strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
        <rect x="420" y="276" width="16" height="20" rx="1" stroke="#C9A84C" strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
        <rect x="446" y="276" width="16" height="20" rx="1" stroke="#C9A84C" strokeOpacity="0.22" strokeWidth="0.7" fill="none" />
        <line x1="346" y1="276" x2="346" y2="296" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="338" y1="286" x2="354" y2="286" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="372" y1="276" x2="372" y2="296" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="364" y1="286" x2="380" y2="286" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="428" y1="276" x2="428" y2="296" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="420" y1="286" x2="436" y2="286" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="454" y1="276" x2="454" y2="296" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <line x1="446" y1="286" x2="462" y2="286" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.4" />
        <rect x="391" y="300" width="18" height="25" rx="9 9 0 0" stroke="#C9A84C" strokeOpacity="0.28" strokeWidth="0.7" fill="none" />
        <circle cx="405" cy="314" r="1" fill="#C9A84C" fillOpacity="0.35" />
        <path d="M320 325 L275 325 L275 308 M480 325 L525 325 L525 308" stroke="#C9A84C" strokeOpacity="0.18" strokeWidth="0.7" fill="none" />
        <ellipse cx="290" cy="322" rx="12" ry="6" fill="none" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.5" />
        <ellipse cx="510" cy="322" rx="10" ry="5" fill="none" stroke="#C9A84C" strokeOpacity="0.1" strokeWidth="0.5" />
      </g>

      {/* Path to villa */}
      <path
        d="M400 325 L396 345 L388 375 M400 325 L404 345 L412 375"
        stroke="#C9A84C" strokeOpacity="0.08" strokeWidth="0.5"
        fill="none"
        className="pl-fade" style={{ animationDelay: "1.3s" }}
      />

      {/* ═══ MOONLIGHT GLOW on landscape — brighter outlines that fade in ═══ */}
      <g className="pl-moonlight" filter="url(#moonGlowFilter)">
        {/* Mountains glow */}
        <path
          d="M0 270 L60 210 L120 240 L200 175 L280 225 L360 165 L440 215 L520 185 L600 235 L680 195 L760 230 L800 215"
          fill="none" stroke="#E8D5B0" strokeOpacity="0.2" strokeWidth="2"
        />
        <path
          d="M0 310 L80 260 L160 285 L260 230 L340 275 L420 240 L520 265 L600 248 L680 280 L760 255 L800 270"
          fill="none" stroke="#E8D5B0" strokeOpacity="0.25" strokeWidth="2"
        />
        {/* Trees glow */}
        <path d="M110 268 L92 292 L101 287 L88 306 L100 300 L94 316 L110 306 L126 316 L120 300 L132 306 L119 287 L128 292Z" fill="none" stroke="#E8D5B0" strokeOpacity="0.2" strokeWidth="1.5" />
        <path d="M145 284 L132 302 L139 298 L130 314 L140 308 L145 316 L150 308 L160 314 L151 298 L158 302Z" fill="none" stroke="#E8D5B0" strokeOpacity="0.15" strokeWidth="1.2" />
        <path d="M660 275 L644 296 L652 292 L640 310 L651 304 L646 320 L660 310 L674 320 L669 304 L680 310 L668 292 L676 296Z" fill="none" stroke="#E8D5B0" strokeOpacity="0.18" strokeWidth="1.5" />
        <path d="M695 290 L684 306 L690 302 L682 315 L691 310 L695 318 L699 310 L708 315 L700 302 L706 306Z" fill="none" stroke="#E8D5B0" strokeOpacity="0.12" strokeWidth="1.2" />
        {/* Villa glow */}
        <rect x="320" y="260" width="160" height="65" rx="1" fill="none" stroke="#E8D5B0" strokeOpacity="0.25" strokeWidth="1.5" />
        <path d="M310 260 L400 218 L490 260" fill="none" stroke="#E8D5B0" strokeOpacity="0.3" strokeWidth="1.8" />
      </g>

      {/* Window warm glow (fades in during night) */}
      <g className="pl-window-glow">
        <rect x="339" y="277" width="14" height="18" fill="#E8D5B0" fillOpacity="0.18" />
        <rect x="365" y="277" width="14" height="18" fill="#E8D5B0" fillOpacity="0.18" />
        <rect x="421" y="277" width="14" height="18" fill="#E8D5B0" fillOpacity="0.18" />
        <rect x="447" y="277" width="14" height="18" fill="#E8D5B0" fillOpacity="0.18" />
        <rect x="392" y="301" width="16" height="23" rx="8 8 0 0" fill="#E8D5B0" fillOpacity="0.22" />
      </g>
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────
export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    document.documentElement.style.overflow = "hidden";
    let cancelled = false;
    let loaded = 0;

    const tick = () => {
      if (cancelled) return;
      loaded++;
      const pct = Math.min(Math.round((loaded / TOTAL_TASKS) * 100), 100);
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct / 100})`;
      if (textRef.current) {
        textRef.current.textContent = pct >= 100 ? "Welcome" : `Loading experience  ${pct}%`;
      }
    };

    const dismiss = () => {
      if (cancelled || !overlay) return;
      document.documentElement.style.overflow = "";
      overlay.style.transition = "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)";
      overlay.style.transform = "translateY(-100%)";
      setTimeout(() => { overlay.style.display = "none"; }, 1000);
    };

    const minTimer = new Promise<void>((r) => setTimeout(r, MIN_DISPLAY_MS));

    const loadAssets = async () => {
      await Promise.all([
        ...PLACEHOLDER_IMAGES.map((s) => preloadImage(s).then(tick)),
        document.fonts.ready.then(tick),
        preloadJSChunks().then(tick),
      ]);
      tick();
    };

    Promise.all([loadAssets(), minTimer]).then(() => {
      if (cancelled) return;
      dismiss();
    });

    return () => {
      cancelled = true;
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-espresso"
      style={{ willChange: "transform" }}
    >
      {/* SVG Scene — full width, centered */}
      <div className="w-full max-w-3xl mx-auto px-6">
        <SceneIllustration />
      </div>

      {/* Wordmark — negative margin-right compensates for tracking on last letter */}
      <div className="relative flex justify-center overflow-hidden mt-4 md:mt-6 w-full px-4">
        {"VICITY".split("").map((char, i) => (
          <span
            key={i}
            className={`text-2xl sm:text-4xl md:text-6xl font-serif text-gradient select-none pl-letter ${i < 13 ? "tracking-[0.15em] sm:tracking-[0.3em]" : ""}`}
            style={{ animationDelay: `${2.8 + i * 0.06}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      <p className="mt-2.5 text-xs md:text-sm uppercase tracking-[0.35em] text-sand/50 font-sans pl-tagline text-center">
        ViCity
      </p>

      {/* Progress bar */}
      <div className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 w-48 md:w-64">
        <div className="h-px w-full bg-sand/10 rounded-full overflow-hidden">
          <div
            ref={barRef}
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 origin-left"
            style={{ transform: "scaleX(0)", transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </div>
        <p
          ref={textRef}
          className="mt-2.5 text-center text-[10px] tracking-[0.2em] uppercase text-sand/35 font-sans tabular-nums pl-status"
        >
          Loading experience  0%
        </p>
      </div>
    </div>
  );
}

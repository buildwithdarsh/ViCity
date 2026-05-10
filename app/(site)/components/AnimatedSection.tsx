"use client";

import { motion, useScroll, useTransform, useMotionValueEvent, MotionValue, useSpring } from "framer-motion";
import { ReactNode, useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { getBlurDataURL } from "@/lib/blur-placeholders";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

// ──────────────────────────────────────────────
// Core fade animations
// ──────────────────────────────────────────────

export function FadeIn({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -20px 0px" }}
      transition={{ duration: 0.9, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInLeft({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 1, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInRight({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 1, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 1, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Blur fade — Apple signature entrance
// ──────────────────────────────────────────────

export function BlurFadeIn({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10px" }}
      transition={{ duration: 0.7, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Stagger containers
// ──────────────────────────────────────────────

export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.8, ease },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Section heading — with animated underline
// ──────────────────────────────────────────────

export function SectionHeading({ eyebrow, title, description, center = true }: {
  eyebrow?: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <BlurFadeIn className={center ? "text-center" : ""}>
      {eyebrow && (
        <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-4 font-medium">
          {eyebrow}
        </p>
      )}
      <h2 className="text-display font-serif text-charcoal">
        {title}
      </h2>
      {description && (
        <p className="mt-6 text-warm-brown text-lg max-w-2xl leading-relaxed" style={center ? { margin: "1.5rem auto 0" } : undefined}>
          {description}
        </p>
      )}
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 48 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4, ease }}
        className={`h-[1.5px] bg-gold mt-7 ${center ? "mx-auto" : ""}`}
      />
    </BlurFadeIn>
  );
}

// ──────────────────────────────────────────────
// Page hero — cinematic header with parallax
// ──────────────────────────────────────────────

export function PageHero({ eyebrow, title, subtitle, backgroundImage }: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  backgroundImage?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "25%"]);

  return (
    <section ref={ref} className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden min-h-[50svh] flex items-end">
      {backgroundImage ? (
        <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
          <Image
            src={backgroundImage}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={getBlurDataURL(backgroundImage)}
          />
          <div className="hero-overlay-dark absolute inset-0" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-charcoal">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,168,76,0.08),transparent_60%)]" />
        </div>
      )}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-5 md:px-6 text-center w-full"
        style={{ opacity: textOpacity, y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 48 }}
          transition={{ duration: 1, ease }}
          className="h-[1px] bg-gold mx-auto mb-6"
        />
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease }}
          className="text-gold-300 text-xs uppercase tracking-[0.35em] mb-4 font-medium"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease }}
          className="text-display font-serif text-white"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-5 text-white/60 text-lg max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Parallax image wrapper
// ──────────────────────────────────────────────

export function ParallaxImage({ children, className = "", speed = 0.15 }: { children: ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Scroll-scale image — zooms in as it enters
// ──────────────────────────────────────────────

export function ScrollScaleImage({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5], [1.1, 1]);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ scale }}>
        {children}
      </motion.div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Scroll-reveal text — word-by-word opacity
// ──────────────────────────────────────────────

function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.4"],
  });
  return scrollYProgress;
}

function WordOpacity({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block mr-[0.25em] will-change-[opacity]">
      {word}
    </motion.span>
  );
}

export function ScrollRevealText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const progress = useScrollProgress(ref);
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return <WordOpacity key={`${word}-${i}`} word={word} range={[start, end]} progress={progress} />;
      })}
    </p>
  );
}

// ──────────────────────────────────────────────
// Scroll color fill text — words shift color
// ──────────────────────────────────────────────

function WordColorFill({ word, range, progress, fromColor, toColor }: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
  fromColor: string;
  toColor: string;
}) {
  const color = useTransform(progress, range, [fromColor, toColor]);
  return (
    <motion.span style={{ color }} className="inline-block mr-[0.25em] will-change-[color] transition-none">
      {word}
    </motion.span>
  );
}

export function ScrollColorText({
  text,
  className = "",
  fromColor = "rgb(161,161,170)",
  toColor = "rgb(26,18,8)",
}: {
  text: string;
  className?: string;
  fromColor?: string;
  toColor?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const progress = useScrollProgress(ref);
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <p ref={ref} className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = (i + 1) / words.length;
        return (
          <WordColorFill
            key={`${word}-${i}`}
            word={word}
            range={[start, end]}
            progress={progress}
            fromColor={fromColor}
            toColor={toColor}
          />
        );
      })}
    </p>
  );
}

// ──────────────────────────────────────────────
// Apple-style sticky scroll section
// Content cycles while pinned
// ──────────────────────────────────────────────

export function StickyScrollSection({ items, className = "" }: {
  items: { title: string; description: string; image: string; accent?: string }[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    setHasMounted(true);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (isMobile) return;
    const index = Math.min(Math.floor(v * items.length), items.length - 1);
    setActiveIndex(index);
  });

  // Mobile: simple stacked layout (only after mount to avoid hydration mismatch)
  if (hasMounted && isMobile) {
    return (
      <div className={className}>
        <div className="max-w-7xl mx-auto px-5 md:px-6 py-20 space-y-16">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.7, ease }}
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL(item.image)}
                />
                <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(26,18,8,0.15)] pointer-events-none rounded-2xl" />
              </div>
              <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-3 font-medium">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="text-headline font-serif text-charcoal">
                {item.title}
              </h3>
              <div className="w-10 h-[1.5px] bg-gold mt-4" />
              <p className="mt-4 text-warm-brown text-lg leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: sticky scroll experience
  return (
    <div ref={containerRef} className={className} style={{ height: `${items.length * 100}vh` }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 md:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text side */}
            <div className="relative min-h-[300px]">
              {items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={false}
                  animate={{
                    opacity: activeIndex === i ? 1 : 0,
                    y: activeIndex === i ? 0 : activeIndex > i ? -40 : 40,
                    filter: activeIndex === i ? "blur(0px)" : "blur(6px)",
                  }}
                  transition={{ duration: 0.6, ease }}
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  <p className="text-gold-500 text-xs uppercase tracking-[0.3em] mb-4 font-medium">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-headline font-serif text-charcoal">
                    {item.title}
                  </h3>
                  <div className="w-10 h-[1.5px] bg-gold mt-5" />
                  <p className="mt-5 text-warm-brown text-lg leading-relaxed max-w-lg">
                    {item.description}
                  </p>
                </motion.div>
              ))}
              {/* Progress dots */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
                {items.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      height: activeIndex === i ? 28 : 8,
                      backgroundColor: activeIndex === i ? "rgb(201,168,76)" : "rgb(232,213,176)",
                    }}
                    transition={{ duration: 0.5, ease }}
                    className="w-[3px] rounded-full"
                  />
                ))}
              </div>
            </div>

            {/* Image side */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden">
              {items.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={false}
                  animate={{
                    opacity: activeIndex === i ? 1 : 0,
                    scale: activeIndex === i ? 1 : 1.08,
                  }}
                  transition={{ duration: 0.8, ease }}
                  className="absolute inset-0"
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL(item.image)}
                  />
                </motion.div>
              ))}
              {/* Cinematic inner shadow */}
              <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(26,18,8,0.2)] pointer-events-none rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Horizontal scroll section
// ──────────────────────────────────────────────

export function HorizontalScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [scrollWidth, setScrollWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useState(() => {
    if (typeof window !== "undefined") {
      const update = () => {
        if (scrollRef.current) {
          setScrollWidth(scrollRef.current.scrollWidth);
          setContainerWidth(scrollRef.current.offsetWidth);
        }
      };
      setTimeout(update, 100);
    }
  });

  const x = useTransform(
    scrollYProgress,
    [0.1, 0.9],
    [0, -(scrollWidth - containerWidth)]
  );

  return (
    <div ref={containerRef} className={className} style={{ height: "300vh" }}>
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <motion.div ref={scrollRef} style={{ x }} className="flex gap-8 px-6 will-change-transform">
          {children}
        </motion.div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Magnetic hover — element follows cursor
// ──────────────────────────────────────────────

export function MagneticHover({ children, className = "", strength = 0.3 }: { children: ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Scroll-driven progress bar
// ──────────────────────────────────────────────

export function ScrollProgress({ className = "" }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left" }}
      className={`fixed top-0 left-0 right-0 h-[2px] bg-gold z-[100] ${className}`}
    />
  );
}

// ──────────────────────────────────────────────
// Cinematic section — full-bleed with parallax
// ──────────────────────────────────────────────

export function CinematicSection({ image, children, className = "", overlay = "dark" }: {
  image: string;
  children: ReactNode;
  className?: string;
  overlay?: "dark" | "light" | "none";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image
          src={image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL={getBlurDataURL(image)}
        />
        {overlay === "dark" && <div className="absolute inset-0 bg-charcoal/70" />}
        {overlay === "light" && <div className="absolute inset-0 bg-cream/60" />}
      </motion.div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Number counter with Apple-style precision
// ──────────────────────────────────────────────

export function AnimatedCounter({ value, suffix = "", prefix = "", decimals = 0 }: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.2"],
  });

  const springValue = useSpring(0, { stiffness: 50, damping: 20 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0.1) springValue.set(value);
  });

  const [display, setDisplay] = useState(0);
  useMotionValueEvent(springValue, "change", (v) => {
    setDisplay(v);
  });

  return (
    <span ref={ref}>
      {prefix}
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

// ──────────────────────────────────────────────
// Reveal on scroll — clip-path based reveal
// ──────────────────────────────────────────────

export function RevealOnScroll({ children, className = "", direction = "up" }: {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}) {
  const clipMap = {
    up: { hidden: "inset(100% 0 0 0)", visible: "inset(0 0 0 0)" },
    down: { hidden: "inset(0 0 100% 0)", visible: "inset(0 0 0 0)" },
    left: { hidden: "inset(0 100% 0 0)", visible: "inset(0 0 0 0)" },
    right: { hidden: "inset(0 0 0 100%)", visible: "inset(0 0 0 0)" },
  };

  return (
    <motion.div
      initial={{ clipPath: clipMap[direction].hidden }}
      whileInView={{ clipPath: clipMap[direction].visible }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 1.2, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

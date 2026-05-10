"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

/* ── Animation Variants ── */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const blurFadeIn = {
  hidden: { opacity: 0, y: 25, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

/* ── Benefits Data ── */

const benefits = [
  {
    num: "01",
    title: "Curated In-Villa Dining",
    desc: "BurgerBuddy's artisan creations delivered to your private suite — plated with the care ViCity guests deserve.",
  },
  {
    num: "02",
    title: "Dual Rewards Programme",
    desc: "Every BurgerBuddy order earns ViCity loyalty points. Every ViCity stay unlocks BurgerBuddy exclusives.",
  },
  {
    num: "03",
    title: "Limited-Edition Experiences",
    desc: "Seasonal villa+dining packages — private tastings, chef's table evenings, and curated pairings.",
  },
  {
    num: "04",
    title: "Concierge-Level Service",
    desc: "Your BurgerBuddy order at ViCity is handled by our villa staff — personalised, prompt, effortless.",
  },
];

/* ── Page Component ── */

export default function HandshakePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#FAF6EF]">
      {/* ━━━ HERO — Cinematic Dark ━━━ */}
      <section
        ref={heroRef}
        className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
        style={{ background: "#0E0B06" }}
      >
        {/* Gradient backdrop */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 35% 40%, rgba(201,168,76,0.08) 0%, transparent 55%), radial-gradient(ellipse at 70% 55%, rgba(245,166,35,0.04) 0%, transparent 45%)",
            }}
          />
          {/* Vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.5) 100%)",
            }}
          />
        </motion.div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 z-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* Floating gold particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-[#C9A84C]"
            style={{
              left: `${20 + i * 14}%`,
              top: `${25 + (i % 3) * 18}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.35, 0.1],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.7,
            }}
          />
        ))}

        {/* Hero content */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Eyebrow */}
            <motion.p
              variants={blurFadeIn}
              className="uppercase tracking-[0.4em] text-[10px] sm:text-[11px] font-light mb-10"
              style={{ color: "rgba(201,168,76,0.5)" }}
            >
              An Exclusive Collaboration
            </motion.p>

            {/* Brand lockup */}
            <motion.div variants={blurFadeIn} className="mb-6">
              <h1
                className="leading-[0.9] mb-4"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(3rem, 10vw, 8rem)",
                  fontWeight: 300,
                  color: "#FAF6EF",
                }}
              >
                ViCity
              </h1>

              {/* Ornamental divider */}
              <div className="flex items-center justify-center gap-4 my-5">
                <div className="w-14 h-px bg-gradient-to-r from-transparent to-[#C9A84C] opacity-25" />
                <div className="w-1.5 h-1.5 rotate-45 border border-[#C9A84C] opacity-30" />
                <div className="w-14 h-px bg-gradient-to-l from-transparent to-[#C9A84C] opacity-25" />
              </div>

              <h1
                className="leading-[0.95]"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(2.2rem, 7vw, 5.5rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                <span style={{ color: "#FAF6EF" }}>Burger</span>
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #F5A623, #FFBD4A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Buddy
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={blurFadeIn}
              className="text-[15px] sm:text-base max-w-lg mx-auto leading-[1.8] mb-14"
              style={{ color: "rgba(250,246,239,0.35)", fontWeight: 300 }}
            >
              Where the art of luxury hospitality meets the craft of artisan
              dining. A partnership designed for those who appreciate the
              exceptional.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/booking"
                className="inline-flex items-center justify-center px-10 py-4 text-[12px] font-medium tracking-[0.2em] uppercase transition-all duration-500 hover:scale-[1.02] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #D4AA52)",
                  color: "#0E0B06",
                  boxShadow: "0 8px 30px rgba(201,168,76,0.2)",
                }}
              >
                Book Your Stay
              </Link>
              <a
                href="#story"
                className="inline-flex items-center justify-center px-10 py-4 text-[12px] font-medium tracking-[0.2em] uppercase border transition-all duration-500 hover:bg-white/[0.03] hover:scale-[1.02]"
                style={{
                  borderColor: "rgba(201,168,76,0.15)",
                  color: "rgba(250,246,239,0.4)",
                }}
              >
                Discover More &darr;
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="w-[18px] h-[30px] rounded-full border border-[#C9A84C] opacity-20 flex justify-center pt-2">
            <div className="w-[3px] h-[8px] rounded-full bg-[#C9A84C] opacity-40" />
          </div>
        </motion.div>
      </section>

      {/* ━━━ Zone Transition ━━━ */}
      <div className="relative -mt-px z-20">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-10 sm:h-16"
        >
          <path
            d="M0 25 C360 55, 1080 0, 1440 25 L1440 60 L0 60Z"
            fill="#FAF6EF"
          />
        </svg>
      </div>

      {/* ━━━ THE STORY — Cream ━━━ */}
      <section id="story" className="relative py-24 sm:py-32 px-6 bg-[#FAF6EF]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto"
        >
          {/* Heading */}
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="uppercase tracking-[0.35em] text-[10px] font-medium text-[#C9A84C] mb-5">
              Our Story
            </p>
            <h2
              className="font-serif mb-8"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
                fontWeight: 400,
                color: "#1A1208",
              }}
            >
              Two Philosophies, One Vision
            </h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-14 h-px mx-auto bg-[#C9A84C] origin-center"
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp} className="space-y-6">
              <p className="text-[15px] leading-[1.85] text-[#6B5B3E]">
                <strong className="text-[#1A1208]">ViCity</strong> was born
                from the belief that luxury lives in the quiet details — the
                thread count, the curated silence, the golden hour on a private
                terrace.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#6B5B3E]">
                <strong className="text-[#1A1208]">BurgerBuddy</strong> shares
                that devotion to craft — turning the humble burger into a
                culinary statement, assembled with the precision of a
                fine-dining kitchen.
              </p>
              <p className="text-[15px] leading-[1.85] text-[#6B5B3E]">
                Together, we&apos;ve created something rare: an experience
                where every bite matches every moment of your stay — elevated,
                intentional, unforgettable.
              </p>
            </motion.div>

            {/* Visual card */}
            <motion.div variants={scaleIn}>
              <div
                className="aspect-[4/5] max-w-sm mx-auto rounded-sm overflow-hidden relative"
                style={{
                  background:
                    "linear-gradient(160deg, #0E0B06 0%, #1A1208 50%, #1E1710 100%)",
                  boxShadow: "0 24px 60px rgba(26,18,8,0.12)",
                }}
              >
                {/* Inner border */}
                <div className="absolute inset-4 rounded-sm border border-[rgba(201,168,76,0.08)] pointer-events-none" />

                {/* Glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[80px] bg-[rgba(201,168,76,0.06)]" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-10">
                  <p
                    className="uppercase tracking-[0.4em] text-[9px] mb-10"
                    style={{ color: "rgba(201,168,76,0.35)" }}
                  >
                    Exclusively Yours
                  </p>

                  <p
                    className="text-center leading-[1.1] mb-2"
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "clamp(2rem, 4vw, 2.8rem)",
                      fontWeight: 300,
                      color: "#FAF6EF",
                    }}
                  >
                    ViCity
                  </p>

                  <div className="flex items-center gap-3 my-4">
                    <div className="w-6 h-px bg-[#C9A84C] opacity-20" />
                    <div className="w-1 h-1 rounded-full bg-[#C9A84C] opacity-30" />
                    <div className="w-6 h-px bg-[#C9A84C] opacity-20" />
                  </div>

                  <p
                    className="text-center leading-[1.1]"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      fontWeight: 700,
                    }}
                  >
                    <span style={{ color: "#FAF6EF" }}>Burger</span>
                    <span
                      style={{
                        background:
                          "linear-gradient(135deg, #F5A623, #FFBD4A)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Buddy
                    </span>
                  </p>

                  <div className="w-10 h-px mt-10 bg-gradient-to-r from-[#C9A84C] to-[#F5A623] opacity-20" />

                  <p
                    className="uppercase tracking-[0.3em] text-[8px] mt-6"
                    style={{ color: "rgba(250,246,239,0.2)" }}
                  >
                    Flavour &middot; Luxury &middot; Together
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ━━━ BENEFITS — Dark Zone ━━━ */}
      <section
        className="relative py-24 sm:py-32 px-6"
        style={{ background: "#0E0B06" }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full blur-[100px] bg-[rgba(201,168,76,0.03)]" />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-20">
            <p className="uppercase tracking-[0.35em] text-[10px] font-medium text-[#C9A84C] mb-5">
              Your Privileges
            </p>
            <h2
              className="font-serif"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
                fontWeight: 400,
                color: "#FAF6EF",
              }}
            >
              The Art of Partnership
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                variants={blurFadeIn}
                whileHover={{
                  y: -3,
                  transition: {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                className="group relative p-8 sm:p-10 rounded-sm transition-all duration-500"
                style={{
                  background: "rgba(250,246,239,0.02)",
                  border: "1px solid rgba(201,168,76,0.06)",
                }}
              >
                {/* Number watermark */}
                <span
                  className="absolute top-5 right-6 text-[56px] font-serif leading-none pointer-events-none select-none"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 300,
                    color: "rgba(201,168,76,0.04)",
                  }}
                >
                  {b.num}
                </span>

                {/* Gold top line */}
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-0 group-hover:opacity-15 transition-opacity duration-700" />

                <h3
                  className="text-lg font-medium mb-3 relative z-10"
                  style={{
                    color: "#FAF6EF",
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  {b.title}
                </h3>
                <p
                  className="text-[13px] leading-[1.85] relative z-10"
                  style={{ color: "rgba(250,246,239,0.35)" }}
                >
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ━━━ FINAL CTA — Cream ━━━ */}
      <section className="relative py-28 sm:py-40 px-6 bg-[#FAF6EF] overflow-hidden">
        {/* Soft glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px] bg-[rgba(201,168,76,0.05)]" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-3xl mx-auto"
        >
          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="w-14 h-px bg-[#C9A84C] opacity-20" />
            <div className="w-1.5 h-1.5 rotate-45 border border-[#C9A84C] opacity-25" />
            <div className="w-14 h-px bg-[#C9A84C] opacity-20" />
          </div>

          <h2
            className="font-serif mb-6"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2rem, 6vw, 4rem)",
              fontWeight: 300,
              color: "#1A1208",
            }}
          >
            Experience the{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #D4AA52)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Extraordinary
            </span>
          </h2>

          <p className="text-[15px] leading-[1.85] text-[#6B5B3E] mb-12 max-w-lg mx-auto">
            Reserve your ViCity escape and savour BurgerBuddy&apos;s
            finest — delivered to your door with five-star care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center px-12 py-4 text-[12px] font-medium tracking-[0.2em] uppercase transition-all duration-500 hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #D4AA52)",
                color: "#0E0B06",
                boxShadow: "0 8px 30px rgba(201,168,76,0.18)",
              }}
            >
              Reserve Now
            </Link>
            <a
              href="https://burgerbuddy.example.com/menu"
              className="inline-flex items-center justify-center px-12 py-4 text-[12px] font-medium tracking-[0.2em] uppercase border transition-all duration-500 hover:scale-[1.02]"
              style={{
                borderColor: "#E8D5B0",
                color: "#1A1208",
              }}
            >
              View the Menu
            </a>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center justify-center gap-3 mt-16 opacity-30">
            <div className="w-6 h-px bg-[#C9A84C]" />
            <div className="w-1 h-1 rounded-full bg-[#C9A84C]" />
            <div className="w-6 h-px bg-[#C9A84C]" />
          </div>
        </motion.div>
      </section>
    </main>
  );
}

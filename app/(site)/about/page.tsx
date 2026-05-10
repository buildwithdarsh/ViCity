"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { getBlurDataURL } from "@/lib/blur-placeholders";
import {
  BlurFadeIn,
  FadeInLeft,
  FadeInRight,
  SectionHeading,
  StaggerContainer,
  StaggerItem,
  PageHero,
  CinematicSection,
  RevealOnScroll,
} from "../components/AnimatedSection";

const values = [
  {
    title: "Intentional Design",
    description:
      "Every corner, every texture, every light source is chosen with purpose. Spaces should feel effortless, but that ease is earned through obsessive attention to detail.",
  },
  {
    title: "Genuine Warmth",
    description:
      "Hospitality is not a service we perform. It is who we are. From the first message to the final goodbye, every interaction is personal and heartfelt.",
  },
  {
    title: "Memorable Experiences",
    description:
      "A stay should leave an imprint. We design moments that linger long after checkout, the kind people talk about and return to, again and again.",
  },
  {
    title: "Honest Ambition",
    description:
      "We are young and we are building. Every guest teaches us something new, and we carry that forward with humility and relentless drive to be better.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero ── */}
      <PageHero
        eyebrow="Our Story"
        title="About ViCity"
        subtitle="Not just a place to stay. A place to remember."
        backgroundImage="/images/living-room-sofa-landscape.webp"
      />

      {/* ── Mission Statement ── */}
      <section className="py-32 md:py-44">
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
          <BlurFadeIn>
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-6 font-medium">Our Mission</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal leading-tight">
              We believe the best spaces are the ones that make you feel something.
            </h2>
            <p className="mt-8 text-warm-brown text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              ViCity was born to build destinations where people gather, celebrate, and create lasting memories.
            </p>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] bg-gold mx-auto mt-10"
            />
          </BlurFadeIn>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="py-20 md:py-32 bg-cream">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeInLeft>
              <RevealOnScroll direction="up" className="rounded-3xl overflow-hidden">
                <Image
                  src="/images/sitting-area-brick-wall.webp"
                  alt="ViCity sitting area"
                  width={800}
                  height={600}
                  className="object-cover w-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/sitting-area-brick-wall.webp")}
                />
              </RevealOnScroll>
            </FadeInLeft>

            <FadeInRight>
              <p className="text-gold text-xs uppercase tracking-[0.3em] mb-4 font-medium">
                The Team
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-charcoal leading-tight">
                Built by Darsh Gupta,
                <br />
                <span className="text-gold">for you.</span>
              </h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 48 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="h-[1.5px] bg-gold mt-6"
              />
              <p className="mt-8 text-warm-brown text-lg leading-relaxed">
                ViCity started with a clear conviction: that
                hospitality should feel personal, not performed. That a space
                should tell a story the moment you walk in. Darsh Gupta brought
                that vision to life in Your City.
              </p>
              <p className="mt-5 text-warm-brown text-lg leading-relaxed">
                Our flagship, ViCity, became the proof of
                that belief. Every material hand-selected. Every detail
                considered. Not to impress, but to make guests feel something
                they rarely do in a rental: truly at home.
              </p>
              <p className="mt-5 text-warm-brown text-lg leading-relaxed">
                ViCity is not a corporation. It is a personal promise from Darsh Gupta
                to every guest: your stay will be worth remembering.
              </p>
            </FadeInRight>
          </div>
        </div>
      </section>

      {/* ── Cinematic Divider ── */}
      <CinematicSection
        image="/images/bedroom-brown-wide.webp"
        overlay="dark"
        className="min-h-[70vh] flex items-center justify-center"
      >
        <div className="py-24 md:py-44 px-5 md:px-6 text-center max-w-4xl mx-auto">
          <BlurFadeIn>
            <p className="text-gold-300 text-xs uppercase tracking-[0.35em] mb-6 font-medium">
              The Starting Point
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
              ViCity
            </h2>
            <p className="mt-8 text-white/60 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Our flagship project. A space where warm textures meet
              considered design. Where every room invites you to slow down,
              breathe, and stay a while longer than you planned.
            </p>
          </BlurFadeIn>
        </div>
      </CinematicSection>

      {/* ── Dual Image Reveal ── */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevealOnScroll direction="left" className="rounded-3xl overflow-hidden aspect-[4/3]">
              <Image
                src="/images/living-room-art-lamp.webp"
                alt="Living room with art and lamp"
                width={800}
                height={600}
                className="object-cover w-full h-full"
                placeholder="blur"
                blurDataURL={getBlurDataURL("/images/living-room-art-lamp.webp")}
              />
            </RevealOnScroll>
            <RevealOnScroll direction="right" className="rounded-3xl overflow-hidden aspect-[4/3]">
              <Image
                src="/images/bathroom-ginkgo-full.webp"
                alt="Bathroom with ginkgo details"
                width={800}
                height={600}
                className="object-cover w-full h-full"
                placeholder="blur"
                blurDataURL={getBlurDataURL("/images/bathroom-ginkgo-full.webp")}
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── Quote Divider ── */}
      <section className="py-20 md:py-28 bg-charcoal">
        <div className="max-w-3xl mx-auto px-5 md:px-6 text-center">
          <BlurFadeIn>
            <p className="text-xl md:text-3xl lg:text-4xl font-serif text-white/90 leading-relaxed italic">
              &ldquo;Not simply places to stay, but destinations where people gather, celebrate, and create lasting memories.&rdquo;
            </p>
            <p className="mt-6 text-gold text-sm uppercase tracking-[0.25em]">— ViCity Promise</p>
          </BlurFadeIn>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 md:py-32 bg-cream">
        <div className="max-w-5xl mx-auto px-5 md:px-6">
          <SectionHeading
            eyebrow="Our Values"
            title="What Drives Us"
            description="Four principles that shape every decision, every space, every guest experience."
          />

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10 md:gap-y-14 mt-14 md:mt-20">
            {values.map((value, i) => (
              <StaggerItem key={value.title}>
                <div className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-charcoal text-gold flex items-center justify-center text-lg font-serif group-hover:bg-gold group-hover:text-charcoal transition-colors duration-500">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-charcoal mb-3">
                        {value.title}
                      </h3>
                      <p className="text-warm-brown leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── Kitchen & Details Gallery ── */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7">
              <RevealOnScroll direction="up" className="rounded-3xl overflow-hidden aspect-[16/10]">
                <Image
                  src="/images/kitchen-cabinets.webp"
                  alt="Kitchen with custom cabinets"
                  width={1200}
                  height={750}
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/kitchen-cabinets.webp")}
                />
              </RevealOnScroll>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-6">
              <RevealOnScroll direction="right" className="rounded-3xl overflow-hidden aspect-square">
                <Image
                  src="/images/kitchen-accessories.webp"
                  alt="Kitchen accessories"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/kitchen-accessories.webp")}
                />
              </RevealOnScroll>
              <RevealOnScroll direction="right" className="rounded-3xl overflow-hidden aspect-square">
                <Image
                  src="/images/bathroom-leaf-closeup.webp"
                  alt="Bathroom leaf detail"
                  width={600}
                  height={600}
                  className="object-cover w-full h-full"
                  placeholder="blur"
                  blurDataURL={getBlurDataURL("/images/bathroom-leaf-closeup.webp")}
                />
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ── Cinematic Bedroom ── */}
      <CinematicSection
        image="/images/bedroom-blue-wide.webp"
        overlay="dark"
        className="min-h-[60vh] flex items-center justify-center"
      >
        <div className="py-24 md:py-44 px-5 md:px-6 text-center max-w-3xl mx-auto">
          <BlurFadeIn>
            <p className="text-gold-300 text-xs uppercase tracking-[0.35em] mb-6 font-medium">
              The Details
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
              Every room is designed to feel like the best version of home.
            </h2>
          </BlurFadeIn>
        </div>
      </CinematicSection>

      {/* ── Closing Statement ── */}
      <section className="py-24 md:py-44">
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-center">
          <BlurFadeIn>
            <p className="text-gold text-xs uppercase tracking-[0.3em] mb-6 font-medium">
              Looking Ahead
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-charcoal leading-tight">
              This is just the beginning.
            </h2>
            <p className="mt-8 text-warm-brown text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              ViCity is young, and that is our greatest strength. Every new
              project carries the lessons of the last, and the energy of
              someone who still has everything to prove. The best spaces we
              will ever build have not been built yet.
            </p>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 48 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-[1.5px] bg-gold mx-auto mt-10"
            />
          </BlurFadeIn>
        </div>
      </section>
    </>
  );
}

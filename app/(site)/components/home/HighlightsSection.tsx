"use client";

import { FiShield, FiMapPin, FiTruck } from "react-icons/fi";
import { SectionHeading, StaggerContainer, StaggerItem } from "../AnimatedSection";

const highlights = [
  {
    icon: FiShield,
    title: "Private & Secured",
    desc: "Inside a gated society with 24/7 security. The entire villa is exclusively yours.",
  },
  {
    icon: FiMapPin,
    title: "Highway Connected",
    desc: "Directly off the main highway. Smooth access, no complicated routes.",
  },
  {
    icon: FiTruck,
    title: "Everything Delivered",
    desc: "Zomato, Swiggy, and Blinkit deliver right to your door. Order anything, anytime.",
  },
];

export default function HighlightsSection() {
  return (
    <section className="py-28 bg-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <SectionHeading
          eyebrow="Why ViCity"
          title="Privacy You Can Feel"
          description="Secured, serviced, and designed entirely for you"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {highlights.map((item) => (
            <StaggerItem key={item.title}>
              <div className="text-center p-10 rounded-3xl bg-white/80 border border-sand/50 transition-all duration-700 group">
                <div className="w-16 h-16 rounded-2xl bg-gold-50 flex items-center justify-center mx-auto mb-6 group-hover:bg-gold group-hover:scale-110 transition-all duration-500">
                  <item.icon size={26} className="text-gold group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-serif text-charcoal mb-3">{item.title}</h3>
                <p className="text-warm-brown text-sm leading-relaxed">{item.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

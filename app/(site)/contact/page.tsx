"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiMail, FiClock, FiCheck, FiSend } from "react-icons/fi";
import { FadeInLeft, FadeInRight, PageHero, BlurFadeIn } from "../components/AnimatedSection";
import { TZ } from "@/lib/tz";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await TZ.storefront.contact.submit(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send message");
    }
    setLoading(false);
  };

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Contact Us"
        subtitle="Questions, requests, or just a hello — we're here for you"
        backgroundImage="/images/living-room-tv-staircase.webp"
      />

      {/* Content */}
      <section className="bg-cream py-16 md:py-28">
        <div className="max-w-7xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Contact Info */}
            <FadeInLeft>
              <h2 className="text-2xl font-serif text-charcoal mb-2">We&apos;d Love to Hear from You</h2>
              <div className="w-10 h-[2px] bg-gold mb-8" />

              {/* Email Primary CTA */}
              <motion.a
                href="mailto:hello@build.withdarsh.com"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-4 bg-charcoal text-white rounded-2xl px-6 py-5 mb-10 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                  <FiMail size={28} className="text-gold" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Email Us</p>
                  <p className="text-white/60 text-sm">hello@build.withdarsh.com — Typically replies within minutes</p>
                </div>
              </motion.a>

              {/* Contact Details */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors duration-500">
                    <FiMail size={20} className="text-gold group-hover:text-charcoal transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-charcoal font-medium mb-1">Email</h3>
                    <p className="text-warm-brown text-sm">hello@build.withdarsh.com</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors duration-500">
                    <FiClock size={20} className="text-gold group-hover:text-charcoal transition-colors duration-500" />
                  </div>
                  <div>
                    <h3 className="text-charcoal font-medium mb-1">Hours</h3>
                    <p className="text-warm-brown text-sm">Reservations: 8 AM – 10 PM</p>
                  </div>
                </motion.div>
              </div>

              {/* Location Card */}
              <BlurFadeIn delay={0.3}>
                <div className="mt-10 rounded-2xl bg-white border border-sand/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                      <FiMapPin size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-charcoal font-medium mb-2">Location</h3>
                      <p className="text-warm-brown text-sm leading-relaxed">
                        Abc, XYZ
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFadeIn>

              {/* Food Delivery Note */}
              <BlurFadeIn delay={0.4}>
                <div className="mt-4 rounded-2xl bg-white border border-sand/30 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0">
                      <FiCheck size={20} className="text-gold" />
                    </div>
                    <div>
                      <h3 className="text-charcoal font-medium mb-1">Food &amp; Essentials</h3>
                      <p className="text-warm-brown text-sm leading-relaxed">
                        Zomato, Swiggy &amp; Blinkit deliver directly to the villa
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFadeIn>
            </FadeInLeft>

            {/* Contact Form */}
            <FadeInRight>
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-sand/30">
                <h2 className="text-2xl font-serif text-charcoal mb-2">Send a Message</h2>
                <p className="text-warm-brown text-sm mb-6">We&apos;ll respond within 24 hours — your note matters to us</p>

                {sent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-2"
                  >
                    <FiCheck className="text-green-600" />
                    <p className="text-green-700 text-sm">Message sent successfully!</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm text-charcoal mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-sand/30 rounded-xl px-4 py-3 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none transition-colors placeholder:text-warm-brown/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-charcoal mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-sand/30 rounded-xl px-4 py-3 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none transition-colors placeholder:text-warm-brown/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-charcoal mb-1.5 block">Subject</label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full border border-sand/30 rounded-xl px-4 py-3 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none transition-colors"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="Reservation Inquiry">Reservation Inquiry</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Feedback">Feedback</option>
                      <option value="Events & Conferences">Events &amp; Conferences</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-charcoal mb-1.5 block">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className="w-full border border-sand/30 rounded-xl px-4 py-3 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none resize-none transition-colors placeholder:text-warm-brown/40"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gold text-charcoal py-3.5 rounded-xl hover:bg-gold/90 transition-all duration-300 uppercase tracking-wider text-sm font-medium hover:shadow-lg hover:shadow-gold/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FiSend size={15} />
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </FadeInRight>
          </div>
        </div>
      </section>
    </>
  );
}

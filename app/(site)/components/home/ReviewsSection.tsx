"use client";

import Link from "next/link";
import { FiStar, FiArrowRight } from "react-icons/fi";
import { SectionHeading, StaggerContainer, StaggerItem, BlurFadeIn } from "../AnimatedSection";

export interface HomeReview {
  id: string;
  rating: number;
  body: string;
  user: { name: string };
  roomType: { name: string };
}

interface ReviewsSectionProps {
  reviews: HomeReview[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section className="py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-5 md:px-6">
        <SectionHeading
          eyebrow="Guest Voices"
          title="In Their Own Words"
          description="The moments that made their stay unforgettable"
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {reviews.map((review) => (
            <StaggerItem key={review.id}>
              <div className="p-8 rounded-3xl bg-cream/50 border border-sand/40 hover:-translate-y-1 transition-all duration-700">
                <div className="flex gap-1 text-gold mb-5">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <FiStar key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <p className="text-charcoal leading-relaxed italic font-serif text-lg">
                  &ldquo;{review.body}&rdquo;
                </p>
                <div className="mt-6 pt-5 border-t border-sand/30">
                  <p className="text-charcoal font-medium text-sm">{review.user.name}</p>
                  <p className="text-warm-brown text-xs mt-0.5">ViCity</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <BlurFadeIn className="text-center mt-12">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-gold-600 text-sm uppercase tracking-wider hover:text-gold-700 transition-colors group"
          >
            Read All Reviews
            <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </BlurFadeIn>
      </div>
    </section>
  );
}

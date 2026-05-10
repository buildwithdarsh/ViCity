import { getCachedPublicReviews } from "@/lib/cache";
import { FiStar } from "react-icons/fi";
import { FadeIn, PageHero, BlurFadeIn } from "../components/AnimatedSection";
import Link from "next/link";

export const revalidate = 3600; // ISR: regenerate every 1 hour

interface Review {
  id: string;
  rating: number;
  body: string;
  createdAt: string;
  user: { name: string };
  roomType: { name: string };
}

async function getReviews(): Promise<Review[]> {
  try {
    const rawReviews = await getCachedPublicReviews();
    if (!Array.isArray(rawReviews)) return [];

    return (rawReviews as Record<string, unknown>[]).map((item) => ({
      id: (item['id'] as string) ?? '',
      rating: (item['rating'] as number) ?? 5,
      body: (item['body'] as string) ?? '',
      createdAt: (item['createdAt'] as string) ?? new Date().toISOString(),
      user: { name: ((item['user'] as Record<string, unknown>)?.['name'] as string) ?? 'Guest' },
      roomType: { name: ((item['roomType'] as Record<string, unknown>)?.['name'] as string) ?? '' },
    }));
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <>
      <PageHero
        eyebrow="Guest Experiences"
        title="Reviews"
        {...(reviews.length > 0
          ? { subtitle: `Rated ${avgRating.toFixed(1)} out of 5 by ${reviews.length} guests` }
          : {})}
        backgroundImage="/images/bedroom-blue-wide.webp"
      />

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <section className="py-14 bg-charcoal border-t border-white/5">
          <div className="max-w-md mx-auto px-5 md:px-6 text-center">
            <div className="flex items-center justify-center gap-5">
              <span className="text-5xl font-serif tracking-tight text-white">
                {avgRating.toFixed(1)}
              </span>
              <div className="text-left">
                <div className="flex gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar
                      key={i}
                      size={18}
                      fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-white/60 text-sm tracking-wide">
                  {reviews.length} reviews
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Reviews List */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-4xl mx-auto px-5 md:px-6">
          {reviews.length === 0 ? (
            <BlurFadeIn>
              <div className="text-center py-24">
                <FiStar size={40} className="text-warm-brown/30 mx-auto mb-4" />
                <p className="text-warm-brown text-lg font-light tracking-wide">
                  No reviews yet — be the first to share your experience.
                </p>
              </div>
            </BlurFadeIn>
          ) : (
            <div className="space-y-6 md:space-y-8">
              <h2 className="sr-only">Guest review list</h2>
              {reviews.map((review, index) => (
                <FadeIn key={review.id} delay={index * 0.05}>
                  <div className="bg-white border border-sand/30 rounded-3xl p-5 md:p-8 hover:-translate-y-1 transition-all duration-500 ease-out">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-5">
                      <div>
                        <div className="flex gap-1 text-gold mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FiStar
                              key={i}
                              size={14}
                              fill={i < review.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <p className="text-charcoal font-medium tracking-wide">
                          {review.user.name}
                        </p>
                        <p className="text-warm-brown text-xs tracking-wide mt-0.5">
                          ViCity
                        </p>
                      </div>
                      <span className="text-warm-brown/50 text-xs tracking-wide">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-charcoal/70 text-sm leading-relaxed">
                      {review.body}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-charcoal text-center">
        <FadeIn>
          <div className="max-w-2xl mx-auto px-5 md:px-6">
            <h2 className="text-3xl md:text-4xl font-serif text-white tracking-tight mb-4">
              Your Story Starts Here
            </h2>
            <p className="text-white/60 text-lg font-light leading-relaxed mb-10">
              Experience ViCity for yourself and share your stay with future
              guests. Every review helps us grow.
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center bg-gold text-charcoal px-10 py-4 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-gold/90 transition-colors duration-300 min-h-[48px] w-full sm:w-auto"
            >
              Explore the Villa
            </Link>
          </div>
        </FadeIn>
      </section>
    </>
  );
}

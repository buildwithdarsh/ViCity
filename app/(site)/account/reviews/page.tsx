"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiArrowLeft, FiStar, FiSend } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { TZ } from "@/lib/tz";


interface Review {
  id: string;
  rating: number;
  body: string;
  title?: string;
  status: string;
  createdAt: string;
  roomType?: { name: string };
  bookingId?: string;
}

import type { Booking } from "@/lib/types";

export default function MyReviewsPage() {
  const { openLoginModal, token: authToken } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const token = authToken || TZ.storefront.auth.getToken();
    if (!token) { openLoginModal(true); return; }

    Promise.all([
      TZ.storefront.reviews.myReviews(),
      TZ.storefront.property.listBookings(),
    ])
      .then(([reviewsList, bookingsRes]) => {
        setReviews((reviewsList || []) as unknown as Review[]);
        const bookingsList = ((bookingsRes as unknown as { data: Booking[] }).data || []) as Booking[];
        const checkedOut = bookingsList.filter((b: Booking) => b.status === "checked_out");
        setBookings(checkedOut);
        setLoading(false);
      })
      .catch(() => openLoginModal(true));
  }, [openLoginModal, authToken]);

  const reviewedBookingIds = new Set(reviews.map((r) => r.bookingId).filter(Boolean));
  const eligibleBookings = bookings.filter((b) => !reviewedBookingIds.has(b.id));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !body.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      // TODO: BE CreateReviewDto has no propertyBookingId field yet.
      // For now, we omit booking association. Once BE adds the field, pass it here.
      const review = await TZ.storefront.reviews.create({
        rating, ...(title ? { title } : {}), body,
      });

      setReviews((prev) => [review as unknown as Review, ...prev]);
      setSubmitSuccess(true);
      setShowForm(false);
      setSelectedBooking("");
      setRating(5);
      setTitle("");
      setBody("");
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit");
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-20 sm:pt-28 pb-24 sm:pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <div>
          <Link href="/account" className="hidden sm:inline-flex items-center gap-2 text-zinc-500 hover:text-charcoal text-sm mb-6 transition-colors">
            <FiArrowLeft size={14} /> Back to Account
          </Link>
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif text-charcoal">My Reviews</h1>
            {eligibleBookings.length > 0 && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal rounded-xl text-sm font-medium hover:bg-gold/90 transition-all"
              >
                <FiSend size={14} /> Write a Review
              </button>
            )}
          </div>
        </div>

        {submitSuccess && (
          <div className="mb-4 py-3 px-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm font-medium">
            Review submitted successfully! It will be visible after approval.
          </div>
        )}

        {showForm && (
          <div>
            <form onSubmit={handleSubmitReview} className="bg-white rounded-xl p-6 mb-6 border border-sand/20">
              <h2 className="text-lg font-serif text-charcoal mb-4">Write a Review</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-600 mb-1.5 block">Select Booking</label>
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    className="w-full border border-sand/40 rounded-lg px-3.5 py-2.5 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none"
                    required
                  >
                    <option value="">Choose a booking...</option>
                    {eligibleBookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookingReference} — ViCity
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-600 mb-1.5 block">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-gold transition-transform hover:scale-110"
                      >
                        <FiStar
                          size={24}
                          fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-600 mb-1.5 block">Title (optional)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-sand/40 rounded-lg px-3.5 py-2.5 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none"
                    placeholder="Summarize your experience"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-600 mb-1.5 block">Your Review</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-sand/40 rounded-lg px-3.5 py-2.5 text-sm text-charcoal bg-cream/30 focus:border-gold outline-none resize-none"
                    rows={4}
                    placeholder="Tell us about your stay..."
                    required
                    maxLength={2000}
                  />
                </div>

                {submitError && <p className="text-red-500 text-sm">{submitError}</p>}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting || !selectedBooking || !body.trim()}
                    className="flex-1 bg-gold text-charcoal py-3 rounded-xl hover:bg-gold/90 transition-all disabled:opacity-40 uppercase tracking-wider text-xs font-bold"
                  >
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setSubmitError(""); }}
                    className="px-6 py-3 rounded-xl border border-sand/40 text-sm text-zinc-500 hover:text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="w-4 h-4 bg-zinc-100 rounded" />
                    ))}
                  </div>
                  <div className="h-5 w-16 bg-zinc-100 rounded-full" />
                </div>
                <div className="h-4 w-48 bg-zinc-100 rounded" />
                <div className="h-3 w-full bg-zinc-50 rounded" />
                <div className="flex justify-between">
                  <div className="h-3 w-24 bg-zinc-50 rounded" />
                  <div className="h-3 w-20 bg-zinc-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 && !showForm ? (
          <div>
            <div className="bg-white rounded-3xl p-12 text-center">
              <FiStar size={32} className="text-zinc-300 mx-auto mb-4" />
              <p className="text-zinc-500">No reviews yet</p>
              <p className="text-zinc-400 text-sm mt-1">After your stay, you can leave a review</p>
              {eligibleBookings.length > 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center gap-2 text-gold hover:text-gold/80 text-sm font-medium transition-colors"
                >
                  <FiSend size={14} /> Write your first review
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id}>
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex gap-1 text-gold">
                      {Array.from({ length: r.rating }).map((_, i) => <FiStar key={i} size={14} fill="currentColor" />)}
                      {Array.from({ length: 5 - r.rating }).map((_, i) => <FiStar key={i} size={14} />)}
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-zinc-100 text-zinc-600"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                  {r.title && <h3 className="text-sm font-medium text-charcoal mb-1">{r.title}</h3>}
                  <p className="text-zinc-600 text-sm">{r.body}</p>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
                    <span>ViCity</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

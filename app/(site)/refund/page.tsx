import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Refund Policy | ViCity Payment Returns",
  description: "Understand ViCity refund processing timelines, payment return methods, and policy eligibility requirements.",
  path: "/refund",
});

export default function RefundPolicyPage() {
  return (
    <main className="pt-28 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal">Refund Policy</h1>
        <p className="mt-6 text-zinc-600 leading-relaxed">
          Refund timelines and payment return methods vary by payment provider, booking status, and applied cancellation conditions.
        </p>
      </div>
    </main>
  );
}

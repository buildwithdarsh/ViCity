import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy | ViCity Guest Data Terms",
  description: "Review how ViCity collects, processes, and protects guest information across bookings, communications, and services.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="pt-28 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal">Privacy Policy</h1>
        <p className="mt-6 text-zinc-600 leading-relaxed">
          ViCity processes guest information solely for reservations, service delivery, payment processing, and legal compliance.
        </p>
      </div>
    </main>
  );
}

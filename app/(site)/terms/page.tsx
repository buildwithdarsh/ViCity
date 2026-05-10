import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service | ViCity Booking Terms",
  description: "Read ViCity terms of service covering reservations, payments, guest conduct, and stay-related obligations.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main className="pt-28 pb-20 bg-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-5 md:px-6">
        <h1 className="text-3xl md:text-4xl font-serif text-charcoal">Terms of Service</h1>
        <p className="mt-6 text-zinc-600 leading-relaxed">
          These terms govern reservations, payments, stay conditions, and usage of ViCity digital services.
        </p>
      </div>
    </main>
  );
}

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Contact ViCity | Reservations and Support",
  description: "Contact ViCity for reservation assistance, guest support, event inquiries, and stay planning details.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Booking | Reserve, Confirm, and Track Stays",
  description: "Complete your reservation, payment confirmation, and booking lookup securely with ViCity.",
  path: "/booking",
  index: false,
});

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

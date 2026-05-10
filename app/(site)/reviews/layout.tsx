import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Guest Reviews for ViCity",
  description: "Read authentic guest reviews of ViCity, including ratings and stay feedback from travelers.",
  path: "/reviews",
});

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

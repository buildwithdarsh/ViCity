import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Gallery | Luxury Boutique Interiors and Spaces",
  description: "Browse ViCity gallery featuring curated interiors, suites, living spaces, and design details across our luxury boutique stay.",
  path: "/gallery",
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}

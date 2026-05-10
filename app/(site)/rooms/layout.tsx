import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "ViCity | Spaces and Amenities",
  description: "Explore the spaces at ViCity with premium amenities, elegant interiors, and comfortable boutique-stay details.",
  path: "/rooms",
});

export default function RoomsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

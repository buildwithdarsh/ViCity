import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "About ViCity | Story, Values, and Team",
  description: "Learn about ViCity, our hospitality philosophy, and the team behind our personalized luxury stay experience.",
  path: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}

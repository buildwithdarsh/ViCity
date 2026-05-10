import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Guest Authentication | Sign In and Account Access",
  description: "Sign in to your ViCity account, create a new profile, or recover account access securely.",
  path: "/auth/login",
  index: false,
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-cream overflow-y-auto">
      {children}
    </div>
  );
}

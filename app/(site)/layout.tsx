import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";
import Preloader from "./components/Preloader";
import SiteProviders from "./SiteProviders";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "ViCity | Luxury Boutique Stay",
  description: "Discover ViCity with elegant rooms, premium amenities, and personalized hospitality for a serene luxury escape.",
  path: "/",
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <Preloader />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <WhatsAppFloat />
    </SiteProviders>
  );
}

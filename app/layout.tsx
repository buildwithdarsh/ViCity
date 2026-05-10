import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { siteUrl } from "@/lib/seo";
import MockProvider from "@/src/mock/MockProvider";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["300", "400", "500", "600", "700"], display: "swap" });

const defaultTitle = "ViCity | Luxury Boutique Stay";
const defaultDescription = "Stay in a refined boutique property with elegant rooms, curated amenities, and warm hospitality. Book your luxury getaway at ViCity today.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | ViCity",
  },
  description: defaultDescription,
  keywords: ["luxury boutique stay", "boutique booking", "boutique stay", "vicity"],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: "ViCity",
    type: "website",
    images: [{ url: "/images/living-room-sofa-landscape.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/images/living-room-sofa-landscape.webp"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ViCity",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: [
      "mailto:hello@build.withdarsh.com",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        email: "hello@build.withdarsh.com",
        contactType: "reservations",
        areaServed: "IN",
      },
    ],
  };

  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${cormorant.variable} font-sans`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <MockProvider>
          {children}
        </MockProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

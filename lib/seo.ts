import type { Metadata } from "next";

const appUrl = (process.env['APP_URL'] || process.env['NEXT_PUBLIC_APP_URL'] || "http://localhost:6912").replace(/\/$/, "");

export const siteUrl = appUrl;

function absoluteUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  index?: boolean;
  imagePath?: string;
  type?: "website" | "article";
};

export function buildPageMetadata({
  title,
  description,
  path,
  index = true,
  imagePath = "/images/living-room-sofa-landscape.webp",
  type = "website",
}: BuildMetadataOptions): Metadata {
  const canonical = path.startsWith("/") ? path : `/${path}`;
  const image = absoluteUrl(imagePath);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: index
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        },
    openGraph: {
      title,
      description,
      url: absoluteUrl(canonical),
      siteName: "ViCity",
      type,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

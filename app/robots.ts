import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/gallery", "/contact", "/reviews", "/privacy", "/terms", "/cancellation", "/refund"],
        disallow: ["/admin", "/admin/*", "/account", "/account/*", "/auth", "/auth/*", "/booking", "/booking/*", "/api/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

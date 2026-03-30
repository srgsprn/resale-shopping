import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/stripe/webhook"],
    },
    sitemap: "https://resale-shopping.ru/sitemap.xml",
  };
}

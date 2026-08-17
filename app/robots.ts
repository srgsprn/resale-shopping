import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/account", "/account/", "/checkout", "/cart", "/wishlist", "/auth/"],
    },
    sitemap: "https://resale-shopping.ru/sitemap.xml",
    host: "https://resale-shopping.ru",
  };
}

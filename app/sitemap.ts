export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://resale-shopping.ru";
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: { in: ["ACTIVE", "SOLD_OUT"] } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticPages = [
    "",
    "/catalog",
    "/about",
    "/prodaja",
    "/pokupka",
    "/delivery",
    "/assurance",
    "/brands",
    "/koncepcia",
    "/conserj",
    "/gift-cards",
    "/new",
    "/prodat",
    "/contacts",
  ];

  return [
    ...staticPages.map((url) => ({
      url: `${base}${url}`,
      lastModified: new Date(),
      changeFrequency: url === "" || url === "/catalog" ? ("daily" as const) : ("weekly" as const),
      priority: url === "" ? 1 : url === "/catalog" ? 0.9 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${base}/catalog?category=${encodeURIComponent(c.slug)}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

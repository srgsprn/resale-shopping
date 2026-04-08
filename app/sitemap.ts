export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://resale-shopping.ru";
  const products = await prisma.product.findMany({ where: { status: { in: ["ACTIVE", "SOLD_OUT"] } }, select: { slug: true, updatedAt: true } });

  const staticPages = ["", "/catalog", "/about", "/prodaja", "/pokupka", "/delivery", "/assurance", "/brands", "/koncepcia", "/oferta"];

  return [
    ...staticPages.map((url) => ({ url: `${base}${url}`, lastModified: new Date() })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt })),
  ];
}

import { unstable_cache } from "next/cache";

import { PAGE_REVALIDATE_SECONDS } from "@/lib/isr";
import { prisma } from "@/lib/prisma";

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  category: true,
} as const;

export type CachedProduct = NonNullable<Awaited<ReturnType<typeof loadProductBySlug>>>;

async function loadProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
}

export function getCachedProductBySlug(slug: string) {
  return unstable_cache(() => loadProductBySlug(slug), ["product-page", slug], {
    revalidate: PAGE_REVALIDATE_SECONDS,
    tags: ["product", `product-${slug}`],
  })();
}

/** Минимальный набор для generateMetadata. */
async function loadProductMetaBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      shortName: true,
      brand: true,
      conditionLabel: true,
      color: true,
      material: true,
      gender: true,
      priceMinor: true,
      currency: true,
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
}

export function getCachedProductMetaBySlug(slug: string) {
  return unstable_cache(() => loadProductMetaBySlug(slug), ["product-meta", slug], {
    revalidate: PAGE_REVALIDATE_SECONDS,
    tags: ["product", `product-${slug}`],
  })();
}

export { productInclude };

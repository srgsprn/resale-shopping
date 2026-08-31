import { unstable_cache } from "next/cache";

import {
  buildCatalogWhere,
  catalogCacheKey,
  catalogOrderBy,
  CATALOG_PAGE_SIZE,
  type CatalogSearchParams,
} from "@/lib/catalog-query";
import { catalogListingWhere } from "@/lib/catalog-listing-filter";
import { PAGE_REVALIDATE_SECONDS } from "@/lib/isr";
import { prisma } from "@/lib/prisma";

export type CatalogPageData = {
  products: Awaited<ReturnType<typeof loadCatalogPageData>>["products"];
  total: number;
  page: number;
  totalPages: number;
  categories: Awaited<ReturnType<typeof loadCatalogPageData>>["categories"];
  brands: string[];
};

async function loadCatalogPageData(params: CatalogSearchParams, page: number) {
  const where = buildCatalogWhere(params);
  const orderBy = catalogOrderBy(params.sort);

  const total = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const [products, categories, brandRows] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
      orderBy,
      skip: (safePage - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { status: { in: ["ACTIVE", "SOLD_OUT"] }, ...catalogListingWhere() },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    }),
  ]);

  return {
    products,
    total,
    page: safePage,
    totalPages,
    categories,
    brands: brandRows.map((row) => row.brand.trim()).filter(Boolean),
  };
}

export function getCatalogPageData(params: CatalogSearchParams, page: number) {
  const key = catalogCacheKey(params, page);
  return unstable_cache(() => loadCatalogPageData(params, page), ["catalog-page", key], {
    revalidate: PAGE_REVALIDATE_SECONDS,
    tags: ["catalog"],
  })();
}

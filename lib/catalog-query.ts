import { catalogListingWhere } from "@/lib/catalog-listing-filter";
import type { Prisma } from "@prisma/client";

export const CATALOG_PAGE_SIZE = 48;

export type CatalogSearchParams = {
  category?: string;
  q?: string;
  sort?: string;
  brand?: string;
  gender?: string;
  color?: string;
  discount?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

export function buildCatalogWhere(params: CatalogSearchParams): Prisma.ProductWhereInput {
  const minPrice = Number.parseInt(params.minPrice || "", 10);
  const maxPrice = Number.parseInt(params.maxPrice || "", 10);
  const minMinor = Number.isFinite(minPrice) ? Math.max(0, minPrice) * 100 : undefined;
  const maxMinor = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) * 100 : undefined;
  const discountOn = params.discount === "1";
  const genderFilter =
    params.gender === "women"
      ? { contains: "жен", mode: "insensitive" as const }
      : params.gender === "men"
        ? { contains: "муж", mode: "insensitive" as const }
        : undefined;

  return {
    status: { in: ["ACTIVE", "SOLD_OUT"] },
    ...catalogListingWhere(),
    brand: params.brand ? { equals: params.brand, mode: "insensitive" as const } : undefined,
    gender: genderFilter,
    color: params.color ? { contains: params.color, mode: "insensitive" as const } : undefined,
    category: params.category ? { slug: params.category } : undefined,
    compareAtMinor: discountOn ? { gt: 0 } : undefined,
    priceMinor:
      minMinor != null || maxMinor != null
        ? {
            ...(minMinor != null ? { gte: minMinor } : {}),
            ...(maxMinor != null ? { lte: maxMinor } : {}),
          }
        : undefined,
    OR: params.q
      ? [
          { name: { contains: params.q, mode: "insensitive" as const } },
          { brand: { contains: params.q, mode: "insensitive" as const } },
        ]
      : undefined,
  };
}

export function catalogOrderBy(sort?: string) {
  if (sort === "price_asc") return { priceMinor: "asc" as const };
  return { priceMinor: "desc" as const };
}

export function catalogCacheKey(params: CatalogSearchParams, page: number) {
  return JSON.stringify({
    category: params.category ?? "",
    q: params.q ?? "",
    sort: params.sort ?? "price_desc",
    brand: params.brand ?? "",
    gender: params.gender ?? "",
    color: params.color ?? "",
    discount: params.discount ?? "",
    minPrice: params.minPrice ?? "",
    maxPrice: params.maxPrice ?? "",
    page,
  });
}

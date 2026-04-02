import type { Prisma } from "@prisma/client";

/** Служебные / не «витринные» позиции в общем каталоге и новинках. */
export const CATALOG_LISTING_EXCLUDED_SLUGS = ["chanel-classic-flap-black"] as const;

/**
 * Только товары витрины: без подарочных карт и без исключённых slug.
 * Подарочные карты живут на /gift-cards и имеют slug gift-card-*.
 */
export function catalogListingWhere(): Prisma.ProductWhereInput {
  return {
    slug: { notIn: [...CATALOG_LISTING_EXCLUDED_SLUGS] },
    NOT: { slug: { startsWith: "gift-card" } },
  };
}

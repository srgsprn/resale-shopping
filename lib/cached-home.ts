import { unstable_cache } from "next/cache";

import { PAGE_REVALIDATE_SECONDS } from "@/lib/isr";
import { prisma } from "@/lib/prisma";
import { getSearchNavItems, siteNavJsonLd } from "@/lib/site-nav";
import type { Prisma } from "@prisma/client";

const HOME_EXCLUDED_SLUGS = ["chanel-classic-flap-black", "louis-vuitton-capucines"];

const homeCatalogWhere: Pick<Prisma.ProductWhereInput, "AND"> = {
  AND: [
    { slug: { notIn: HOME_EXCLUDED_SLUGS } },
    { NOT: { slug: { startsWith: "gift-card" } } },
    { images: { some: {} } },
  ],
};

export type HomePageData = {
  featured: Awaited<ReturnType<typeof loadHomePageData>>["featured"];
  latest: Awaited<ReturnType<typeof loadHomePageData>>["latest"];
  searchNavJsonLd: ReturnType<typeof siteNavJsonLd>;
};

async function loadHomePageData() {
  const discountCandidates = await prisma.product.findMany({
    where: { status: "ACTIVE", ...homeCatalogWhere },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const tasteCandidates = await prisma.product.findMany({
    where: { status: { in: ["ACTIVE", "SOLD_OUT"] }, ...homeCatalogWhere },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const searchNav = await getSearchNavItems();

  return {
    featured: discountCandidates.slice(0, 8),
    latest: tasteCandidates.slice(0, 8),
    searchNavJsonLd: siteNavJsonLd(searchNav),
  };
}

export const getHomePageData = unstable_cache(loadHomePageData, ["home-page"], {
  revalidate: PAGE_REVALIDATE_SECONDS,
  tags: ["home"],
});

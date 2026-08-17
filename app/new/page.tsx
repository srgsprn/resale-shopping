export const dynamic = "force-dynamic";

import { ProductCard } from "@/components/product-card";
import { catalogListingWhere } from "@/lib/catalog-listing-filter";
import { prisma } from "@/lib/prisma";
import { PAGE_SEO } from "@/lib/site-seo";
import type { Metadata } from "next";

export const metadata: Metadata = PAGE_SEO.newArrivals;

export default async function NewArrivalsPage() {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const recent = await prisma.product.findMany({
    where: {
      status: { in: ["ACTIVE", "SOLD_OUT"] },
      ...catalogListingWhere(),
      createdAt: { gte: since },
    },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    take: 24,
    orderBy: { createdAt: "desc" },
  });

  const fallback =
    recent.length > 0
      ? recent
      : await prisma.product.findMany({
          where: { status: { in: ["ACTIVE", "SOLD_OUT"] }, ...catalogListingWhere() },
          include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
          take: 24,
          orderBy: { createdAt: "desc" },
        });

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Новинки брендовых вещей resale</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Свежие поступления: купите брендовые вещи resale и second hand одежду, пока лот в наличии. Полный ассортимент — в каталоге.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {fallback.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

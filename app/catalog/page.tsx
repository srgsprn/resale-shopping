export const dynamic = "force-dynamic";

import Link from "next/link";
import type { Metadata } from "next";

import { ProductCard } from "@/components/product-card";
import { catalogListingWhere } from "@/lib/catalog-listing-filter";
import { buildPageSeo } from "@/lib/page-seo";
import { prisma } from "@/lib/prisma";

const seo = buildPageSeo({
  pageType: "category",
  topic: "каталог люксовых вещей",
  titleName: "Каталог",
  details: { category: "Каталог" },
});

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  alternates: { canonical: "/catalog" },
};

type Props = {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; brand?: string }>;
};

const sortOptions = [
  { value: "newest", label: "Новизна" },
  { value: "price_asc", label: "Цена: сначала дешевле" },
  { value: "price_desc", label: "Цена: сначала дороже" },
] as const;

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;

  const orderBy =
    params.sort === "price_asc"
      ? { priceMinor: "asc" as const }
      : params.sort === "price_desc"
        ? { priceMinor: "desc" as const }
        : { createdAt: "desc" as const };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: { in: ["ACTIVE", "SOLD_OUT"] },
        ...catalogListingWhere(),
        brand: params.brand ? { equals: params.brand, mode: "insensitive" } : undefined,
        category: params.category ? { slug: params.category } : undefined,
        OR: params.q
          ? [
              { name: { contains: params.q, mode: "insensitive" } },
              { brand: { contains: params.q, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
      orderBy,
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Каталог{params.brand ? `: ${params.brand}` : ""}
      </h1>

      <form className="grid gap-3 rounded-2xl border border-[#d9d2c8] bg-white p-4 md:grid-cols-4">
        <input
          name="q"
          defaultValue={params.q || ""}
          placeholder="Что вы ищете?"
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        />
        <input type="hidden" name="brand" value={params.brand || ""} />

        <select
          name="category"
          defaultValue={params.category || ""}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>{category.name}</option>
          ))}
        </select>

        <select
          name="sort"
          defaultValue={params.sort || "newest"}
          className="rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button type="submit" className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white">Применить</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog?category=${category.slug}`}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs uppercase tracking-[0.1em] text-zinc-700"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

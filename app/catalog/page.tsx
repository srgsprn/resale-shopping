export const dynamic = "force-dynamic";

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
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    brand?: string;
    gender?: string;
    color?: string;
    discount?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

const sortOptions = [
  { value: "price_desc", label: "По убыванию цены" },
  { value: "price_asc", label: "По возрастанию цены" },
] as const;

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const minPrice = Number.parseInt(params.minPrice || "", 10);
  const maxPrice = Number.parseInt(params.maxPrice || "", 10);
  const minMinor = Number.isFinite(minPrice) ? Math.max(0, minPrice) * 100 : undefined;
  const maxMinor = Number.isFinite(maxPrice) ? Math.max(0, maxPrice) * 100 : undefined;
  const discountOn = params.discount === "1";

  const orderBy =
    params.sort === "price_asc"
      ? { priceMinor: "asc" as const }
      : params.sort === "price_desc"
        ? { priceMinor: "desc" as const }
        : { priceMinor: "desc" as const };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: { in: ["ACTIVE", "SOLD_OUT"] },
        ...catalogListingWhere(),
        brand: params.brand ? { equals: params.brand, mode: "insensitive" } : undefined,
        gender: params.gender ? { equals: params.gender, mode: "insensitive" } : undefined,
        color: params.color ? { equals: params.color, mode: "insensitive" } : undefined,
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

  const brands = [...new Set(products.map((p) => p.brand.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));
  const genders = [...new Set(products.map((p) => (p.gender || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));
  const colors = [...new Set(products.map((p) => (p.color || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"));

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">
        Каталог{params.brand ? `: ${params.brand}` : ""}
      </h1>

      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <form className="h-fit space-y-4 rounded-[26px] border border-[#d9d2c8] bg-[#faf8f5] p-4 md:p-5 lg:sticky lg:top-24">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Поиск</label>
            <input
              name="q"
              defaultValue={params.q || ""}
              placeholder="Что вы ищете?"
              className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#a57d58]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Цена от</label>
              <input
                name="minPrice"
                defaultValue={params.minPrice || ""}
                inputMode="numeric"
                className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#a57d58]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700">Цена до</label>
              <input
                name="maxPrice"
                defaultValue={params.maxPrice || ""}
                inputMode="numeric"
                className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3 py-2 text-sm outline-none focus:border-[#a57d58]"
              />
            </div>
          </div>
          <div className="h-1 rounded-full bg-[#e5d9ca]" />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Все категории</label>
            <select
              name="category"
              defaultValue={params.category || ""}
              className="w-full rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category.id} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Бренд</label>
            <select
              name="brand"
              defaultValue={params.brand || ""}
              className="w-full rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
            >
              <option value="">Все бренды</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Пол</label>
            <select
              name="gender"
              defaultValue={params.gender || ""}
              className="w-full rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
            >
              <option value="">Любой</option>
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Цвет</label>
            <select
              name="color"
              defaultValue={params.color || ""}
              className="w-full rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
            >
              <option value="">Любой</option>
              {colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-800">
            <input type="checkbox" name="discount" value="1" defaultChecked={discountOn} className="h-4 w-4 rounded border-[#d9d2c8]" />
            Скидка
          </label>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Сортировать по:</label>
            <select
              name="sort"
              defaultValue={params.sort || "price_desc"}
              className="w-full rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-full border-2 border-[#6b5344] bg-[#e8dcc8] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 shadow-sm hover:bg-[#dfc9ae]"
          >
            Применить
          </button>
        </form>

        <div className="space-y-4">
          <p className="text-sm text-zinc-600">Найдено товаров: {products.length}</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

import type { Metadata } from "next";

import { CatalogPriceRange } from "@/components/catalog-price-range";
import { ProductCard } from "@/components/product-card";
import { catalogListingWhere } from "@/lib/catalog-listing-filter";
import { prisma } from "@/lib/prisma";
import { pageMeta, PAGE_SEO } from "@/lib/site-seo";

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

function hasExtraCatalogFilters(params: Awaited<Props["searchParams"]>) {
  return Boolean(
    params.q ||
      params.color ||
      params.gender ||
      params.discount ||
      params.minPrice ||
      params.maxPrice ||
      (params.sort && params.sort !== "price_desc") ||
      (params.brand && params.category),
  );
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const extra = hasExtraCatalogFilters(params);

  if (params.category && !params.brand && !extra) {
    const category = await prisma.category.findFirst({
      where: { slug: params.category, isActive: true },
      select: { name: true, slug: true },
    });
    if (category) {
      return pageMeta({
        title: `${category.name}: брендовые вещи resale`.slice(0, 58),
        description: `Купите ${category.name.toLowerCase()} — брендовые вещи resale и second hand одежду люкс-брендов. Проверка подлинности, актуальные лоты — оформите заказ в магазине.`,
        path: `/catalog?category=${encodeURIComponent(category.slug)}`,
        keywords: [category.name, "купить брендовые вещи resale"],
      });
    }
  }

  if (params.brand && !params.category && !extra) {
    return pageMeta({
      title: `${params.brand}: брендовые вещи resale — магазин`,
      description: `Купите брендовые вещи ${params.brand} resale: оригиналы и second hand одежда с проверкой подлинности. Смотрите лоты в каталоге и оформите заказ онлайн.`,
      path: `/catalog?brand=${encodeURIComponent(params.brand)}`,
      keywords: [params.brand, "купить брендовые вещи resale"],
    });
  }

  if (extra) {
    return {
      ...PAGE_SEO.catalog,
      robots: { index: false, follow: true },
    };
  }

  return PAGE_SEO.catalog;
}

const sortOptions = [
  { value: "price_desc", label: "По убыванию цены" },
  { value: "price_asc", label: "По возрастанию цены" },
] as const;

function SelectField({
  name,
  defaultValue,
  options,
}: {
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        defaultValue={defaultValue}
        className="w-full appearance-none rounded-xl border border-[#d8ccbb] bg-gradient-to-b from-[#f7efe3] to-[#f2e6d6] px-3 py-2 pr-12 text-sm text-zinc-900 outline-none focus:border-[#a57d58]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#d4c6b2] bg-white px-2 py-1 text-[10px] text-zinc-600">
        ▾
      </span>
    </div>
  );
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
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
        gender: genderFilter,
        color: params.color ? { contains: params.color, mode: "insensitive" } : undefined,
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
  const colors = [
    "Бежевый",
    "Белый",
    "Голубой",
    "Зеленый",
    "Коричневый",
    "Красный",
    "Розовый",
    "Серый",
    "Синий",
    "Черный",
  ];

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">
        {params.category
          ? `${categories.find((c) => c.slug === params.category)?.name || "Каталог"}: брендовые вещи resale`
          : params.brand
            ? `${params.brand}: брендовые вещи resale`
            : "Каталог брендовых вещей resale"}
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
        {params.category
          ? `Купите ${(categories.find((c) => c.slug === params.category)?.name || "лоты").toLowerCase()} — брендовые вещи resale и second hand одежду с проверкой подлинности.`
          : params.brand
            ? `Купите брендовые вещи ${params.brand} resale: актуальные лоты second hand одежды и аксессуаров в нашем магазине.`
            : "Купите брендовые вещи resale в каталоге: сумки, одежда и аксессуары люкс-брендов. Second hand брендовая одежда с проверкой подлинности."}
      </p>

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
          <CatalogPriceRange
            minName="minPrice"
            maxName="maxPrice"
            initialMin={Number.isFinite(minPrice) ? minPrice : 0}
            initialMax={Number.isFinite(maxPrice) ? maxPrice : 8000000}
            lowerBound={0}
            upperBound={8000000}
          />
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Все категории</label>
            <SelectField
              name="category"
              defaultValue={params.category || ""}
              options={[
                { value: "", label: "Все категории" },
                ...categories.map((category) => ({ value: category.slug, label: category.name })),
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Бренд</label>
            <SelectField
              name="brand"
              defaultValue={params.brand || ""}
              options={[{ value: "", label: "Все бренды" }, ...brands.map((brand) => ({ value: brand, label: brand }))]}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Пол</label>
            <SelectField
              name="gender"
              defaultValue={params.gender || ""}
              options={[
                { value: "", label: "Любой" },
                { value: "women", label: "Женский" },
                { value: "men", label: "Мужской" },
              ]}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Цвет</label>
            <SelectField
              name="color"
              defaultValue={params.color || ""}
              options={[{ value: "", label: "Любой" }, ...colors.map((color) => ({ value: color, label: color }))]}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-800">
            <input type="checkbox" name="discount" value="1" defaultChecked={discountOn} className="h-4 w-4 rounded border-[#d9d2c8]" />
            Скидка
          </label>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700">Сортировать по:</label>
            <SelectField
              name="sort"
              defaultValue={params.sort || "price_desc"}
              options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
            />
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

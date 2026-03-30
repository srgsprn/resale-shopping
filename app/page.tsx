export const dynamic = "force-dynamic";

import Link from "next/link";

import { HomeDiscountsSection } from "@/components/home-discounts-section";
import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [featured, categories, latest] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 8,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 6 }),
    prisma.product.findMany({
      where: { status: { in: ["ACTIVE", "SOLD_OUT"] } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-12 pb-6 md:space-y-16 md:pb-8">
      <section className="rounded-[24px] bg-[#dfd4c5] px-5 py-12 text-balance shadow-sm md:rounded-[28px] md:px-12 md:py-20">
        <p className="mb-3 text-[11px] uppercase tracking-[0.26em] text-zinc-700 md:text-xs md:tracking-[0.28em]">Легкий шоппинг с Альфа</p>
        <h1 className="max-w-3xl text-[1.65rem] font-semibold leading-[1.15] tracking-tight md:text-5xl md:leading-tight">
          Магазин брендовых сумок, одежды и аксессуаров с premium resale эстетикой
        </h1>
        <div className="mt-7 flex flex-wrap gap-3 md:mt-8">
          <Link
            href="/catalog"
            className="rounded-full border border-zinc-800/85 bg-[#ebe6df] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-900 shadow-sm transition hover:bg-white"
          >
            В каталог
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-zinc-800/50 bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-900 transition hover:border-zinc-800 hover:bg-white/40"
          >
            Подробнее
          </Link>
        </div>
      </section>

      <section className="px-0.5">
        <h2 className="mb-4 px-0.5 text-xl font-semibold tracking-tight md:mb-5 md:text-2xl">Категории</h2>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${c.slug}`}
              className="rounded-2xl border border-[#d9d2c8] bg-[#f8f6f2] px-3 py-4 text-center text-[11px] font-medium uppercase leading-snug tracking-[0.08em] text-zinc-900 transition hover:border-zinc-400 hover:bg-white md:px-4 md:py-5 md:text-sm md:tracking-[0.1em]"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <div className="px-0.5">
        <HomeDiscountsSection products={featured} />
      </div>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white px-5 py-9 text-balance shadow-sm md:rounded-[28px] md:px-10 md:py-10">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Консьерж сервис</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Абсолютно новые вещи из Европы. Ваши самые желанные лоты с персональным сопровождением менеджера.
        </p>
        <Link
          href="/about"
          className="mt-5 inline-block rounded-full border border-zinc-800/80 bg-[#f8f6f2] px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-white"
        >
          Подробнее
        </Link>
      </section>

      <section className="px-0.5">
        <h2 className="mb-4 px-0.5 text-xl font-semibold tracking-tight md:mb-5 md:text-2xl">Красиво и со вкусом</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

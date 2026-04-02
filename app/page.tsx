export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";

import { HomeDiscountsSection } from "@/components/home-discounts-section";
import { ProductCard } from "@/components/product-card";
import { HOME_HERO_IMAGE, HOME_HERO_IMAGE_ALT } from "@/lib/hero-assets";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Не показываем на главной в «Скидки» / «Красиво и со вкусом». */
const HOME_EXCLUDED_SLUGS = ["chanel-classic-flap-black", "louis-vuitton-capucines"];

const homeCatalogWhere: Pick<Prisma.ProductWhereInput, "AND"> = {
  AND: [
    { slug: { notIn: HOME_EXCLUDED_SLUGS } },
    { NOT: { slug: { startsWith: "gift-card" } } },
    { images: { some: {} } },
  ],
};

export default async function HomePage() {
  const discountCandidates = await prisma.product.findMany({
    where: { status: "ACTIVE", ...homeCatalogWhere },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  const featured = discountCandidates.slice(0, 8);

  const tasteCandidates = await prisma.product.findMany({
    where: { status: { in: ["ACTIVE", "SOLD_OUT"] }, ...homeCatalogWhere },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  const latest = tasteCandidates.slice(0, 8);

  return (
    <div className="space-y-12 pb-6 md:space-y-16 md:pb-8">
      <section className="overflow-hidden rounded-[24px] bg-[#dfd4c5] shadow-sm md:rounded-[28px]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,46%)] lg:items-stretch">
          <div className="order-2 flex flex-col justify-center px-5 py-10 text-balance md:px-10 md:py-14 lg:order-1 lg:px-12 lg:py-16 xl:px-14">
            <h1 className="max-w-xl text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-zinc-900 md:text-4xl md:leading-tight lg:text-[2.35rem] xl:text-5xl">
              Магазин брендовых сумок, одежды и аксессуаров с премиальной ресейл-эстетикой
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-700 md:text-base">
              Отобранные лоты, бережная подача и внимание к деталям.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
              <Link
                href="/about"
                className="rounded-full border border-zinc-800/50 bg-transparent px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-zinc-900 transition hover:border-zinc-800 hover:bg-white/40"
              >
                Подробнее
              </Link>
            </div>
          </div>

          <div className="relative order-1 min-h-[min(72vw,420px)] sm:min-h-[380px] lg:order-2 lg:min-h-[440px]">
            <Image
              src={HOME_HERO_IMAGE}
              alt={HOME_HERO_IMAGE_ALT}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-[center_25%]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#dfd4c5] via-[#dfd4c5]/20 to-transparent lg:bg-gradient-to-l lg:from-[#dfd4c5] lg:via-[#dfd4c5]/15 lg:to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </section>

      <div className="px-0.5">
        <HomeDiscountsSection products={featured} />
      </div>

      <section className="w-full overflow-hidden rounded-xl border border-[#d4c9bc] bg-gradient-to-r from-[#f0e8de] via-[#e9dccf] to-[#e0d0c0] shadow-sm md:rounded-2xl">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:py-1 sm:pl-3 sm:pr-1 md:gap-4 md:pl-4">
          <div className="min-w-0 flex-1 px-3 py-2 text-balance sm:py-1.5 sm:pl-0 md:py-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <h2 className="text-[11px] font-semibold tracking-tight text-zinc-900 md:text-xs">Консьерж сервис</h2>
              <span className="hidden text-[9px] uppercase tracking-[0.12em] text-zinc-500 sm:inline">личный байер</span>
            </div>
            <p className="mt-0.5 max-w-3xl text-[10px] leading-snug text-zinc-800 md:text-[11px] md:leading-relaxed">
              <span className="block">Твой личный байер от Resale Shopping.</span>
              <span className="block">Привезём новые лоты из Европы и США</span>
              <span className="block font-medium text-zinc-900">Всего за 14 дней! Сделаем с первого раза.</span>
            </p>
            <div className="mt-1.5">
              <Link
                href="/conserj"
                className="inline-flex items-center justify-center rounded-full border border-[#b8a99a] bg-white/70 px-2.5 py-1 text-[9px] font-semibold tracking-[0.06em] text-[#3d342c] shadow-sm backdrop-blur-sm transition hover:bg-white md:px-3 md:text-[10px]"
              >
                Подробнее
              </Link>
            </div>
          </div>
          <div className="relative h-[52px] w-full shrink-0 overflow-hidden rounded-lg sm:h-14 sm:w-[88px] sm:rounded-l-none sm:rounded-r-xl md:h-16 md:w-[104px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.freepik.com/free-photo/view-women-s-purse-tiles-with-mediterranean-aesthetics_23-2150916730.jpg?semt=ais_hybrid&w=740&q=80"
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
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

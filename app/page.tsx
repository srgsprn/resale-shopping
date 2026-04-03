export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";

import { HomeDiscountsSection } from "@/components/home-discounts-section";
import { ProductCard } from "@/components/product-card";
import {
  CONCIERGE_HERO_ALT,
  CONCIERGE_HERO_IMAGE,
  CONCIERGE_SHORT_COPY,
} from "@/lib/concierge-assets";
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

      <section className="w-full overflow-hidden rounded-[24px] border border-[#d9d2c8] shadow-sm">
        {/* Мобила: фото на весь блок + лёгкий blur, текст поверх */}
        <div className="relative min-h-[min(56vw,280px)] w-full overflow-hidden md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CONCIERGE_HERO_IMAGE}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-110 object-cover object-center blur-[3px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#f6f3ef]/90 via-[#f6f3ef]/35 to-[#dfd2c4]/70"
          />
          <div className="relative z-10 flex min-h-[min(56vw,280px)] flex-col px-4 pb-5 pt-4">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Консьерж сервис</h2>
              <p className="mt-2 w-full max-w-md text-[13px] leading-relaxed text-zinc-800 sm:text-sm">
                {CONCIERGE_SHORT_COPY}
              </p>
            </div>
            <div className="flex shrink-0 justify-center pt-2">
              <Link
                href="/conserj"
                className="inline-flex items-center justify-center rounded-full border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-900"
              >
                Подробнее
              </Link>
            </div>
          </div>
        </div>

        {/* Десктоп: ~×1.5 к предыдущему компакту; фото на всю высоту ряда */}
        <div className="hidden gap-0 bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5] md:grid md:grid-cols-[1.35fr_0.65fr] md:items-stretch">
          <div className="flex flex-col justify-center px-5 py-4 md:px-6 md:py-5">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 lg:text-2xl">Консьерж сервис</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-800">{CONCIERGE_SHORT_COPY}</p>
            <Link
              href="/conserj"
              className="mt-4 inline-flex w-fit items-center justify-center rounded-full border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-900"
            >
              Подробнее
            </Link>
          </div>
          <div className="relative min-h-[144px] w-full overflow-hidden bg-[#e8dcc8] lg:min-h-[156px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CONCIERGE_HERO_IMAGE}
              alt={CONCIERGE_HERO_ALT}
              className="absolute inset-0 h-full w-full object-cover object-center"
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

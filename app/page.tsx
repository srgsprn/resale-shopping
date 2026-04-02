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

      <section className="w-full overflow-hidden rounded-[18px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5] shadow-sm md:rounded-[20px]">
        <div className="grid gap-0 md:grid-cols-[1.25fr_0.75fr] md:items-stretch">
          <div className="px-3 py-2.5 text-balance md:px-5 md:py-3">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">Консьерж сервис</h2>
            <p className="mt-1 max-w-2xl text-[11px] leading-snug text-zinc-800 md:text-xs">
              Тихий подбор и сопровождение на каждом шаге.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/conserj"
                className="inline-flex items-center justify-center rounded-full border border-[#c4b5a4] bg-gradient-to-r from-[#efe6db] to-[#dcc9b5] px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-[#3d342c] transition hover:from-[#f2ebe3] hover:to-[#e2d2c0] md:px-4"
              >
                Подробнее
              </Link>
            </div>
          </div>
          <div className="relative min-h-[64px] max-md:max-h-[88px] md:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://img.freepik.com/free-photo/view-women-s-purse-tiles-with-mediterranean-aesthetics_23-2150916730.jpg?semt=ais_hybrid&w=740&q=80"
              alt="Консьерж сервис"
              className="h-full w-full object-cover md:min-h-[72px]"
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

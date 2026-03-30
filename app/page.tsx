export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";

import { HomeDiscountsSection } from "@/components/home-discounts-section";
import { ProductCard } from "@/components/product-card";
import { HOME_HERO_IMAGE, HOME_HERO_IMAGE_ALT } from "@/lib/hero-assets";
import { CONCIERGE_IMAGE, CONCIERGE_IMAGE_ALT } from "@/lib/concierge-assets";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 8,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { status: { in: ["ACTIVE", "SOLD_OUT"] } },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-12 pb-6 md:space-y-16 md:pb-8">
      <section className="overflow-hidden rounded-[24px] bg-[#dfd4c5] shadow-sm md:rounded-[28px]">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,46%)] lg:items-stretch">
          <div className="order-2 flex flex-col justify-center px-5 py-10 text-balance md:px-10 md:py-14 lg:order-1 lg:px-12 lg:py-16 xl:px-14">
            <h1 className="max-w-xl text-[1.65rem] font-semibold leading-[1.15] tracking-tight text-zinc-900 md:text-4xl md:leading-tight lg:text-[2.35rem] xl:text-5xl">
              Магазин брендовых сумок, одежды и аксессуаров с премиальной ресейл-эстетикой
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-700 md:text-base">
              Отобранные лоты, бережная подача и внимание к деталям — как в лучших онлайн-бутиках.
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

      <section className="overflow-hidden rounded-[24px] border border-[#d4a8a0] bg-white px-5 py-9 text-balance shadow-sm md:rounded-[28px] md:px-10 md:py-10">
        <div className="grid gap-8 md:grid-cols-[1fr_320px] md:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#b45a53] md:text-xs">
              Личный ассистент
            </p>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-[#b45a53] md:text-2xl">
              Консьерж сервис
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-700 md:text-base">
              Тихий подбор, аккуратные детали и сопровождение на каждом шаге — чтобы вы получили идеальный лот без лишних действий.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block rounded-full border border-[#b45a53]/45 bg-[#dfd4c5] px-5 py-2.5 text-xs uppercase tracking-[0.14em] text-[#6a2a24] transition hover:bg-white"
            >
              Подробнее
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#b45a53]/20 to-[#dfd4c5]/10 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[22px] border border-[#d9d2c8] bg-[#f6f3ef]">
              <Image
                src={CONCIERGE_IMAGE}
                alt={CONCIERGE_IMAGE_ALT}
                width={520}
                height={620}
                className="h-full w-full object-cover"
                sizes="320px"
                priority={false}
              />
            </div>
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

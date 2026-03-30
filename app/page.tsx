export const dynamic = "force-dynamic";

import Link from "next/link";

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
    <div className="space-y-16 pb-8">
      <section className="rounded-[28px] bg-[#dfd4c5] px-6 py-14 md:px-12 md:py-20">
        <p className="mb-3 text-xs uppercase tracking-[0.28em] text-zinc-700">Легкий шоппинг с Альфа</p>
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          Магазин брендовых сумок, одежды и аксессуаров с premium resale эстетикой
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalog" className="rounded-full bg-zinc-900 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em] text-white">Купить</Link>
          <Link href="/about" className="rounded-full border border-zinc-800 px-6 py-3 text-xs font-medium uppercase tracking-[0.14em]">Подробнее</Link>
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold">Категории</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog?category=${c.slug}`} className="rounded-2xl border border-[#d9d2c8] bg-[#f8f6f2] px-4 py-5 text-center text-sm font-medium uppercase tracking-[0.1em] hover:bg-white">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold">Скидки</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d9d2c8] bg-white px-6 py-10 md:px-10">
        <h2 className="text-2xl font-semibold">Консьерж сервис</h2>
        <p className="mt-2 max-w-2xl text-zinc-700">Абсолютно новые вещи из Европы. Ваши самые желанные лоты с персональным сопровождением менеджера.</p>
        <Link href="/about" className="mt-5 inline-block rounded-full border border-zinc-800 px-5 py-2 text-xs uppercase tracking-[0.14em]">Подробнее</Link>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold">Красиво и со вкусом</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

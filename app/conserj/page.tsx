export const dynamic = "force-dynamic";

import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { prisma } from "@/lib/prisma";

const advantages = [
  "Новые вещи с бирками из актуальных коллекций мировых брендов под ваш запрос.",
  "Защищенная оплата: все расчеты проходят через безопасный формат сделки.",
  "Подлинность 100%: каждый товар перед отправкой проверяют эксперты в офисе Resale Shopping.",
  "Доставка к порогу: курьер согласует дату и время и привезет заказ прямо к двери.",
];

export default async function ConserjPage() {
  const latest = await prisma.product.findMany({
    where: { status: { in: ["ACTIVE", "SOLD_OUT"] } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#d9d2c8] p-6 md:p-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/conserj-hero.jpg"
          alt="Консьерж-шопинг"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#f6f3ef]/82" />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-600">Консьерж сервис</p>
          <h1 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Твой личный байер от Resale Shopping. Привезем новые лоты из Европы и США всего за 14 дней.
          </h1>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
            >
              Создать заявку
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Оставьте заявку, и наш менеджер свяжется с вами для уточнения заказа
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {advantages.map((item) => (
            <li key={item} className="rounded-2xl border border-[#d9d2c8] bg-white p-5 text-sm leading-relaxed text-zinc-700">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Новинки</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

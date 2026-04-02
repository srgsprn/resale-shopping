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

const CONCIERGE_SIDE_IMAGE =
  "https://img.freepik.com/free-photo/view-women-s-purse-tiles-with-mediterranean-aesthetics_23-2150916730.jpg?semt=ais_hybrid&w=740&q=80";

export default async function ConserjPage() {
  const latest = await prisma.product.findMany({
    where: { status: { in: ["ACTIVE", "SOLD_OUT"] } },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 2 } },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr] md:items-stretch">
          <div className="flex flex-col justify-center px-5 py-8 md:px-8 md:py-10">
            <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-600">Консьерж сервис</p>
            <h1 className="mt-3 max-w-xl text-xl font-semibold leading-snug tracking-tight text-zinc-900 md:text-2xl">
              Твой личный байер от Resale Shopping. Привезем новые лоты из Европы и США всего за 14 дней.
            </h1>
            <div className="mt-6">
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center rounded-full border border-[#c4b5a4] bg-gradient-to-r from-[#efe6db] to-[#dcc9b5] px-6 py-3 text-xs font-semibold tracking-[0.12em] text-[#3d342c] transition hover:from-[#f2ebe3] hover:to-[#e2d2c0]"
              >
                Создать заявку
              </Link>
            </div>
          </div>
          <div className="relative min-h-[200px] md:min-h-[280px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CONCIERGE_SIDE_IMAGE}
              alt="Консьерж и подбор аксессуаров"
              className="h-full min-h-[200px] w-full object-cover md:min-h-full"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Оставьте заявку, и наш менеджер свяжется с вами для уточнения заказа
        </h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {advantages.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-[#d9d2c8] bg-[#faf8f5] p-5 text-sm leading-relaxed text-zinc-700"
            >
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

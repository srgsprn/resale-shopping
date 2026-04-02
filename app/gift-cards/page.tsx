"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const NOMINALS = [
  { label: "50 000 ₽", slug: "gift-card-50000" },
  { label: "100 000 ₽", slug: "gift-card-100000" },
  { label: "500 000 ₽", slug: "gift-card-500000" },
] as const;

const DESIGNS = [
  {
    label: "Классика",
    image:
      "https://images.unsplash.com/photo-1513885535751-752b5c77bd33?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Линия",
    image:
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Моно",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80",
  },
  {
    label: "Премиум",
    image:
      "https://images.unsplash.com/photo-1607344645866-009c370b1424?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function GiftCardsPage() {
  const router = useRouter();
  const [designIdx, setDesignIdx] = useState(0);
  const [slug, setSlug] = useState<string>(NOMINALS[0].slug);

  const design = useMemo(() => DESIGNS[designIdx]!, [designIdx]);

  const prevDesign = () => setDesignIdx((i) => (i === 0 ? DESIGNS.length - 1 : i - 1));
  const nextDesign = () => setDesignIdx((i) => (i === DESIGNS.length - 1 ? 0 : i + 1));

  const onBuy = () => {
    const params = new URLSearchParams({ gift: slug, design: String(designIdx) });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Подарочная карта</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-800 md:text-sm">
            Карта Resale Shopping — удобный подарок: получатель сам выберет лот в каталоге. Укажите в примечании к
            заказу имя и фамилию, которые напечатаем на карте.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-4 rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6">
          <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Выберите дизайн карты</p>
          <div className="relative overflow-hidden rounded-2xl border border-[#d9d2c8] bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={design.image} alt={design.label} className="aspect-[16/10] w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/35 to-transparent p-6">
              <p className="text-center text-lg font-semibold tracking-wide text-white drop-shadow md:text-xl">
                Resale Shopping
              </p>
            </div>
            <div className="absolute inset-y-0 left-2 flex items-center">
              <button
                type="button"
                onClick={prevDesign}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-lg text-zinc-800 shadow transition hover:bg-white"
                aria-label="Предыдущий дизайн"
              >
                ❮
              </button>
            </div>
            <div className="absolute inset-y-0 right-2 flex items-center">
              <button
                type="button"
                onClick={nextDesign}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-lg text-zinc-800 shadow transition hover:bg-white"
                aria-label="Следующий дизайн"
              >
                ❯
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-zinc-600">
            {design.label} · {designIdx + 1} / {DESIGNS.length}
          </p>
        </div>

        <div className="space-y-6 rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 md:text-xl">Номинал</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {NOMINALS.map((n) => (
                <button
                  key={n.slug}
                  type="button"
                  onClick={() => setSlug(n.slug)}
                  className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    slug === n.slug
                      ? "border-zinc-900 bg-zinc-900 text-[#f6f3ef]"
                      : "border-[#d9d2c8] bg-[#faf8f5] text-zinc-800 hover:border-zinc-600"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#d9d2c8] bg-[#faf8f5] p-4 text-sm leading-relaxed text-zinc-700">
            Карта Resale Shopping — идеальный подарок. В примечании к заказу укажите имя и фамилию, которые будут
            указаны на карте. После оплаты отправим электронную карту на указанный email.
          </div>

          <button
            type="button"
            onClick={onBuy}
            className="w-full rounded-full border border-zinc-800 bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 shadow-sm transition hover:brightness-105"
          >
            Купить
          </button>

          <a
            href="/oferta-docs/oferta-yandex-split.pdf"
            target="_blank"
            rel="noreferrer"
            className="block text-center text-xs text-zinc-600 underline-offset-4 hover:text-zinc-900 hover:underline"
          >
            Условия и регламент использования
          </a>
        </div>
      </section>
    </div>
  );
}

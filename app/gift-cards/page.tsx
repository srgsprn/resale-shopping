"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const NOMINALS = [
  {
    label: "50 000 ₽",
    slug: "gift-card-50000",
    image: "/gift-cards/card-50000.png",
    objectPosition: "center 58%",
    zoom: 1.065,
  },
  {
    label: "100 000 ₽",
    slug: "gift-card-100000",
    image: "/gift-cards/card-100000.png",
    objectPosition: "center center",
    zoom: 1,
  },
  {
    label: "500 000 ₽",
    slug: "gift-card-500000",
    image: "/gift-cards/card-500000.png",
    objectPosition: "center 52%",
    zoom: 1.06,
  },
] as const;

export default function GiftCardsPage() {
  const router = useRouter();
  const [slug, setSlug] = useState<string>(NOMINALS[0].slug);

  const selectedNominal = useMemo(() => NOMINALS.find((n) => n.slug === slug) ?? NOMINALS[0], [slug]);

  const onBuy = () => {
    const designIdx = NOMINALS.findIndex((n) => n.slug === slug);
    const params = new URLSearchParams({ gift: slug, design: String(Math.max(0, designIdx)) });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Подарочная карта</h1>
          <p className="mt-2 max-w-2xl text-sm font-normal leading-relaxed text-zinc-800">
            Карта Resale Shopping — идеальный подарок. В примечании к заказу укажите имя и фамилию, которые будут
            указаны на карте. После оплаты отправим электронную карту на указанный e-mail.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
        <div className="space-y-4 rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6">
          <div className="relative aspect-[2.06/1] overflow-hidden rounded-2xl border border-[#d9d2c8] bg-[#f4f1ec]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedNominal.image}
              alt={`Подарочная карта ${selectedNominal.label}`}
              className="h-full w-full object-cover shadow-[0_12px_24px_rgba(24,24,27,0.16)]"
              style={{
                objectPosition: selectedNominal.objectPosition,
                transform: `scale(${selectedNominal.zoom})`,
              }}
            />
          </div>
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
                  className={`rounded-full border px-6 py-3 text-sm font-semibold uppercase tracking-[0.1em] transition ${
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

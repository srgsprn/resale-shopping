import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GiftCardsPage() {
  return (
    <section className="mx-auto max-w-5xl space-y-7">
      <div className="overflow-hidden rounded-[30px] border border-[#d9d2c8] bg-gradient-to-r from-[#ece3d8] via-[#e3d6c4] to-[#d8c7b0] p-7 md:p-10">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-700">Подарочная карта</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">Подарите premium resale выбор</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-800 md:text-base">
          Электронная подарочная карта resale-shopping.ru позволяет получателю выбрать идеальный лот из каталога:
          аксессуары, сумки, часы и украшения ведущих брендов.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[50000, 100000, 200000, 300000].map((amount) => (
            <button
              key={amount}
              type="button"
              className="rounded-full border border-zinc-800/30 bg-white/70 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-white"
            >
              {new Intl.NumberFormat("ru-RU").format(amount)} ₽
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Мгновенная доставка", "Карта отправляется на email сразу после подтверждения заказа."],
          ["Гибкий номинал", "Можно выбрать сумму и персонализировать поздравление."],
          ["Стильная подача", "Эстетичная digital-карта в фирменном стиле resale-shopping."],
        ].map(([title, text]) => (
          <article key={title} className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">{title}</h2>
            <p className="mt-2 text-sm text-zinc-700">{text}</p>
          </article>
        ))}
      </div>

      <div className="rounded-[24px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Как оформить карту</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>Оставьте заявку с желаемым номиналом.</li>
          <li>Менеджер подтвердит детали и способ оплаты.</li>
          <li>Получите карту и отправьте ее получателю.</li>
        </ol>
        <Link
          href="/conserj"
          className="mt-5 inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
        >
          Оформить подарочную карту
        </Link>
      </div>
    </section>
  );
}

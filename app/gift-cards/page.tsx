import Link from "next/link";

export const dynamic = "force-dynamic";

export default function GiftCardsPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-6 rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Подарочные карты</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700">
          Оформите подарок за несколько минут: получатель выберет товары самостоятельно из каталога resale-shopping.ru.
          Подробности и дизайн карты мы подготовим по вашему запросу.
        </p>
      </div>

      <div className="rounded-[22px] border border-[#d9d2c8] bg-[#f6f3ef] p-5 md:p-6">
        <h2 className="text-lg font-semibold">Как это работает</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
          <li>Вы оставляете контакты.</li>
          <li>Мы согласуем сумму и формат.</li>
          <li>Вы получаете подарок (онлайн/по запросу).</li>
        </ol>
      </div>

      <Link
        href="/about"
        className="inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-zinc-800"
      >
        Связаться
      </Link>
    </section>
  );
}


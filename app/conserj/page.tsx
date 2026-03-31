import Link from "next/link";

export default function ConserjPage() {
  const showcase = [
    { name: "Celine Triomphe", price: "70 000 ₽", split: "17 500₽ x 4 платежа в Сплит" },
    { name: "Chanel 22 Hobo", price: "325 000 ₽", split: "" },
    { name: "Loewe Anagram", price: "58 000 ₽", split: "14 500₽ x 4 платежа в Сплит" },
    { name: "Louis Vuitton Alma BB", price: "160 000 ₽", split: "" },
  ];

  return (
    <section className="space-y-8">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-600">Консьерж сервис</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
          Твой личный байер от Resale Shopping.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Привезем новые лоты из Европы и США всего за 14 дней.
        </p>
        <Link
          href="/checkout"
          className="mt-7 inline-flex rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
        >
          Создать заявку
        </Link>
      </div>

      <div className="rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Оставьте заявку и наш менеджер свяжется с вами для уточнения заказа
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">По вашему запросу</h3>
            <p className="mt-2 text-sm text-zinc-600">Новые вещи с бирками из актуальных коллекций мировых брендов.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Защищенная оплата</h3>
            <p className="mt-2 text-sm text-zinc-600">Все расчеты через безопасную сделку.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Подлинность 100%</h3>
            <p className="mt-2 text-sm text-zinc-600">Каждый товар перед отправкой проверяют эксперты в офисе.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Доставка к порогу</h3>
            <p className="mt-2 text-sm text-zinc-600">Курьер согласует дату и время и доставит заказ прямо к двери.</p>
          </article>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Новинки</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {showcase.map((item) => (
            <article key={item.name} className="rounded-2xl border border-[#d9d2c8] p-4">
              <p className="font-medium text-zinc-900">{item.name}</p>
              <p className="mt-1 text-sm text-zinc-700">{item.price}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-400">Нет в наличии</p>
              {item.split ? <p className="mt-2 text-xs text-zinc-500">{item.split}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

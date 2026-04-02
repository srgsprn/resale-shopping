export default function InstallmentsPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="p-5 md:p-6">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Рассрочка и кредит</h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-800 md:text-sm">
              Теперь бренды стали еще ближе вместе с рассрочкой. Оформляйте покупку в несколько платежей без лишней
              бюрократии.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1400&q=80"
            alt="Рассрочка и кредит"
            className="h-[165px] w-full object-cover md:h-[200px]"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#d9d2c8] bg-white p-6 md:p-8">
        <p className="text-base font-semibold text-zinc-900 md:text-lg">
          К банкам-партнерам присоединились новые программы - оформлять покупку стало еще проще.
        </p>
        <ul className="mt-5 space-y-2 text-sm leading-relaxed text-zinc-800 md:text-base">
          <li>
            <span className="font-semibold text-[#a16f39]">Рассрочка 0%:</span> на 4, 6 или 10 месяцев.
          </li>
          <li>
            <span className="font-semibold text-[#a16f39]">Классический кредит:</span> до 500 000 ₽.
          </li>
          <li>
            <span className="font-semibold text-[#a16f39]">Оформление:</span> за несколько минут, без скрытых комиссий.
          </li>
        </ul>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {["Т-Банк", "Альфа-Банк", "Сбер", "ВТБ"].map((bank) => (
            <div
              key={bank}
              className="rounded-xl border border-[#d9d2c8] bg-[#f6efe5] px-4 py-3 text-center text-sm font-semibold text-[#7c5430]"
            >
              {bank}
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm leading-relaxed text-zinc-700 md:text-base">
          Напишите нам - поможем подобрать лучший вариант и оформить покупку. Или выберите оплату рассрочкой при
          оформлении заказа.
        </p>
      </section>
    </div>
  );
}

export default function DeliveryPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#ece7df] via-[#e3ddd2] to-[#d6cdc0]">
        <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
          <div className="p-5 md:p-6">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Доставка и возврат</h1>
            <p className="mt-2 text-xs leading-relaxed text-zinc-800 md:text-sm">
              Прозрачные условия по каждому сценарию доставки и понятный регламент возврата.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1400&q=80"
            alt="Доставка и сервис"
            className="h-[150px] w-full object-cover md:h-[185px]"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Москва и МО</h2>
          <p className="mt-2 text-sm text-zinc-700">Бесплатная доставка от 10 000 ₽, срок обычно 7-10 дней после оплаты.</p>
        </article>
        <article className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">По России</h2>
          <p className="mt-2 text-sm text-zinc-700">Отправка оплаченных заказов транспортными службами с трекингом.</p>
        </article>
        <article className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">Международно</h2>
          <p className="mt-2 text-sm text-zinc-700">Возможна доставка по предоплате с учетом пошлин и правил страны назначения.</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-[#f8f6f2] p-6">
        <h2 className="text-lg font-semibold">Условия возврата</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-700">
          <li><span className="font-semibold text-zinc-900">1.</span> Срок возврата: 3 дня с момента получения.</li>
          <li><span className="font-semibold text-zinc-900">2.</span> Нужны сохраненные бирки и исходное состояние товара.</li>
          <li><span className="font-semibold text-zinc-900">3.</span> Товары от частных продавцов могут иметь ограничения на возврат.</li>
          <li><span className="font-semibold text-zinc-900">4.</span> После проверки оформляется возврат средств.</li>
        </ul>
      </section>
    </div>
  );
}

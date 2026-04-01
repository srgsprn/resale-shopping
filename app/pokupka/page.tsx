export default function PurchaseInfoPage() {
  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-2xl overflow-hidden rounded-[18px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="grid gap-2 md:grid-cols-[1.45fr_0.55fr] md:items-stretch">
          <div className="p-2.5 md:p-3">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl">Как купить</h1>
            <p className="mt-1 max-w-md text-[10px] leading-relaxed text-zinc-800 md:text-[11px]">
              Путь покупки выстроен так же, как на премиальных resale-платформах: прозрачные карточки товара, понятное
              оформление заказа и предсказуемая доставка.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80"
            alt="Девушка фотографирует сумку на телефон"
            className="h-[70px] w-full object-cover md:h-[86px]"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          ["Выберите товар", "Изучите описание, фотографии и характеристики, чтобы быть уверенными в выборе."],
          ["Добавьте в корзину", "Сохраните лот и продолжите покупки или перейдите сразу к оформлению."],
          ["Оформите заказ", "Проверьте позиции и заполните данные для доставки и связи."],
          ["Выберите способ оплаты", "СБП, банковские карты, Яндекс Сплит, рассрочка и другие доступные способы."],
          ["Подтверждение заказа", "Дождитесь подтверждения заказа и звонка менеджера."],
          [
            "Доставка",
            "Мы осуществляем доставку в пределах 7-ми дней с момента подтверждения заказа. Вы сможете ожидать свой товар в оговоренные сроки, а также получите уведомление, когда ваш заказ будет отправлен.",
          ],
        ].map(([title, text], i) => (
          <article key={title} className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
            <div className="mb-2 inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#d9a35b] px-2 text-xs font-semibold text-white">
              {i + 1}
            </div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-700">{text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

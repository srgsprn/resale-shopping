import Link from "next/link";

export default function SaleInPage() {
  return (
    <div className="space-y-8">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[22px] border border-[#d9d2c8] bg-gradient-to-r from-[#f0dfca] via-[#ead2b7] to-[#e0c29e]">
        <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
          <div className="p-4 md:p-5">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Как продать</h1>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-800 md:text-sm">
              Мы берем на себя операционную часть продажи: проверку, публикацию и сопровождение сделки до выплаты.
            </p>
            <Link
              href="/prodat"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-900"
            >
              Продать
            </Link>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1400&q=80"
            alt="Человек фотографирует сумку на телефон"
            className="h-[140px] w-full object-cover md:h-[170px]"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[
          [
            "Опубликуйте товар",
            "Регистрация и создание объявления: войдите на платформу и максимально заполните карточку товара. Укажите описание, комплект, добавьте качественные фото и зафиксируйте справедливую цену.",
          ],
          [
            "Соответствие товара требованиям",
            "После проверки менеджер связывается с вами для согласования условий сделки, забора товара и проведения аутентификации. После успешных этапов лот публикуется на витрине.",
          ],
          [
            "Отслеживайте доставку до покупателя",
            "В личном кабинете можно контролировать процесс продажи и логистики до финальной передачи покупателю.",
          ],
          [
            "Получите выплату",
            "Укажите расчетный счет и банковские реквизиты в личном кабинете для получения выплаты по завершенной сделке.",
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

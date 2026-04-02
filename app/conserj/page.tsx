import Link from "next/link";

const STEPS: [string, string][] = [
  [
    "Опишите запрос",
    "Бренд, модель, желаемый бюджет и сроки — чем точнее пожелания, тем быстрее личный байер подберёт варианты в Европе и США.",
  ],
  [
    "Подбор и согласование",
    "Мы предлагаем подходящие лоты, согласовываем условия, стоимость и логистику до передачи заказа вам.",
  ],
  [
    "Выкуп и доставка",
    "После согласования выкупаем товар и организуем доставку: обычно новые позиции приходят в течение около 14 дней.",
  ],
  [
    "Проверка подлинности",
    "Каждый товар проходит проверку экспертов Resale Shopping перед отправкой — подлинность и состояние фиксируются прозрачно.",
  ],
  [
    "Удобная передача",
    "Согласуем доставку курьером или самовывоз — так же предсказуемо, как при покупке с витрины магазина.",
  ],
  [
    "Сопровождение",
    "Менеджер на связи на всех этапах: от первого запроса до получения заказа и ответов после покупки.",
  ],
];

const HERO_IMAGE =
  "https://img.freepik.com/free-photo/view-women-s-purse-tiles-with-mediterranean-aesthetics_23-2150916730.jpg?semt=ais_hybrid&w=1400&q=80";

function ConserjHeroCopy() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Консьерж сервис</h1>
      <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-800 md:text-sm">
        Твой личный байер от Resale Shopping. Привезём новые лоты из Европы и США всего за 14 дней — сделаем с
        первого раза. Сервис оформлен в том же духе, что и раздел «Как купить»: понятные шаги и спокойное
        сопровождение сделки.
      </p>
      <Link
        href="mailto:help@resale-shopping.ru?subject=%D0%9A%D0%BE%D0%BD%D1%81%D1%8C%D0%B5%D1%80%D0%B6%20%D1%81%D0%B5%D1%80%D0%B2%D0%B8%D1%81"
        className="mt-4 inline-flex items-center justify-center rounded-full border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-900"
      >
        Оставить заявку
      </Link>
    </>
  );
}

export default function ConserjPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8]">
        {/* Мобила: фото целиком (contain) на фоне блока, текст и кнопка поверх */}
        <div className="relative min-h-[min(100vw,480px)] bg-[#ebe4d8] md:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain object-center"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#f6f3ef]/78 via-[#f6f3ef]/25 to-[#dfd2c4]/55"
          />
          <div className="relative z-10 p-4 pb-8 pt-6">
            <ConserjHeroCopy />
          </div>
        </div>

        {/* Десктоп: без изменений — градиент + колонка с картинкой */}
        <div className="hidden bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5] md:block">
          <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr] md:items-stretch">
            <div className="p-4 md:p-5">
              <ConserjHeroCopy />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_IMAGE}
              alt="Консьерж сервис"
              className="h-[165px] w-full object-cover md:h-[200px]"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {STEPS.map(([title, text], i) => (
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

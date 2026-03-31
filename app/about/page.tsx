import Link from "next/link";

export const dynamic = "force-dynamic";

const principles = [
  {
    title: "Простота использования",
    text: "Каждый пользователь может за считанные минуты зарегистрироваться на платформе и начать продавать или покупать вещи.",
  },
  {
    title: "Удобство платформы",
    text: "Мы предлагаем широкий набор функций, чтобы экономить ваше время и делать поиск лотов максимально комфортным.",
  },
  {
    title: "Безопасность",
    text: "На платформе действует многоуровневая система контроля сделки, которая защищает каждую транзакцию.",
  },
  {
    title: "Обратная связь",
    text: "Наша команда на связи ежедневно с 10:00 до 22:00 и постоянно улучшает сервис на основе ваших отзывов.",
  },
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <p className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">О нас</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">Resale Shopping</h1>
        <p className="mt-5 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Resale Shopping — международный сервис в России, где можно купить и перепродать товары известных брендов.
          Значительная часть лотов поставляется напрямую из Европы.
        </p>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Магазины и частные продавцы размещают у нас новые и практически новые вещи известных брендов с уценкой до 90%.
          Премиальные вещи — это не только покупка с удовольствием, но и инвестиция в гардероб: на дистанции стоимость многих
          позиций растет.
        </p>
      </section>

      <section className="rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Как работает сервис</h2>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Resale Shopping объединяет лучшие практики международных resale-платформ и адаптирует их под понятный и безопасный
          клиентский путь.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {principles.map((item) => (
            <li key={item.title} className="rounded-2xl border border-[#d9d2c8] bg-white p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Проверка подлинности</h2>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Перед отправкой отдел аутентификации Resale Shopping проверяет каждую позицию на подлинность и соответствие описанию.
          После успешной проверки к отправлению прикладывается сертификат подлинности.
        </p>
        <Link
          href="/assurance"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-zinc-800/60 bg-[#dfd4c5] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-white"
        >
          Подробнее
        </Link>
      </section>
    </div>
  );
}

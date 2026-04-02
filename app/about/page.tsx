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
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-10">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Resale Shopping</h1>
            <p className="mt-5 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
              Resale Shopping — это международный сервис в России, предлагающий приобрести и осуществить перепродажу
              товаров известных брендов. Также большая часть вещей на нашей платформе представлена прямиком из Европы.
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
              Модные магазины и частные продавцы выставляют на нашей платформе новые и практически новые вещи известных
              брендов с уценкой до 90%.
            </p>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
              Люксовые вещи являются не просто приятной покупкой, но и модной инвестицией в гардероб. Стоимость
              приобретенных изделий на дистанции растет, что делает такой формат покупки еще более осмысленным.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://alfa-resale.ru/wp-content/uploads/2026/01/IMG_3734-1024x572.jpeg"
            alt="О компании Resale Shopping"
            className="h-full min-h-[260px] w-full object-cover"
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Как работает сервис</h2>
        <p className="mt-4 max-w-4xl text-sm leading-relaxed text-zinc-700 md:text-base">
          Resale Shopping стремится обеспечить лучший опыт покупки и продажи брендовых вещей, опираясь на успешные
          практики международных платформ и пожелания пользователей.
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

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">О нас в СМИ</h2>
        <div className="mx-auto mt-5 grid max-w-4xl grid-cols-2 justify-items-center gap-4 md:grid-cols-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://alfa-resale.ru/wp-content/uploads/2025/05/64c2713bc83ae6fb270796c8_61e1ea92724df534c3ac7fdf_image-1024x576.png" alt="СМИ 1" className="h-16 w-full rounded-xl border border-[#d9d2c8] bg-white object-contain p-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://alfa-resale.ru/wp-content/uploads/2025/05/Vc.ru-logo-e1746687239574.png" alt="СМИ 2" className="h-16 w-full rounded-xl border border-[#d9d2c8] bg-white object-contain p-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://alfa-resale.ru/wp-content/uploads/2025/05/2cbd6d6fc7df101797d57dc818cd917d-e1746682360309.jpg" alt="СМИ 3" className="h-16 w-full rounded-xl border border-[#d9d2c8] bg-white object-contain p-2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://alfa-resale.ru/wp-content/uploads/2025/05/RBK_logo.svg-1024x273.png" alt="СМИ 4" className="h-16 w-full rounded-xl border border-[#d9d2c8] bg-white object-contain p-2" />
        </div>
      </section>

    </div>
  );
}

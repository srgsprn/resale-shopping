import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="space-y-8">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Resale Shopping</h1>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700 md:text-base">
          Resale Shopping - это международный сервис в России, предлагающий приобрести и осуществить
          перепродажу товаров известных брендов. Также большая часть вещей на нашей платформе представлена
          прямиком из Европы.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700 md:text-base">
          Модные магазины и частные продавцы выставляют на нашей платформе новые и практически новые вещи
          известных брендов с уценкой до 90%.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700 md:text-base">
          Люксовые вещи являются не просто приятной покупкой, но и модной инвестицией в вашем гардеробе.
          Цены на приобретенные изделия растут каждый год.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Как работает сервис?</h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700 md:text-base">
          Resale Shopping стремится обеспечить лучший опыт покупки и продажи брендовых вещей, опираясь на
          успешные практики зарубежных интернет-магазинов и пожелания наших пользователей.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Простота использования</h3>
            <p className="mt-2 text-sm text-zinc-600">Регистрация и старт покупки или продажи за считанные минуты.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Удобство платформы</h3>
            <p className="mt-2 text-sm text-zinc-600">Функциональность, которая экономит время на каждом шаге.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Безопасность</h3>
            <p className="mt-2 text-sm text-zinc-600">Многоуровневый контроль сделки и проверка подлинности товаров.</p>
          </article>
          <article className="rounded-2xl border border-[#d9d2c8] bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Обратная связь</h3>
            <p className="mt-2 text-sm text-zinc-600">Команда на связи ежедневно и постоянно улучшает сервис.</p>
          </article>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Проверка подлинности</h2>
        <p className="mt-4 text-sm leading-relaxed text-zinc-700 md:text-base">
          Перед отправкой отдел аутентификации Resale Shopping тщательно проверяет каждую позицию на
          подлинность и соответствие заявленным характеристикам.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 md:text-base">
          После успешного прохождения проверки к отправлению прикладывается сертификат подлинности от
          Resale Shopping.
        </p>
        <Link
          href="/assurance"
          className="mt-6 inline-flex rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
        >
          Подробнее
        </Link>
      </div>
    </section>
  );
}

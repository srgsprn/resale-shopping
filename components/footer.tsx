import Link from "next/link";

const clientLinks = [
  ["Концепция", "/koncepcia"],
  ["Как купить", "/pokupka"],
  ["Как продать", "/prodaja"],
  ["Доставка и возврат", "/delivery"],
  ["Рассрочка", "/rassrochka"],
] as const;

const companyLinks = [
  ["О нас", "/about"],
  ["Гарантия подлинности", "/assurance"],
  ["Оферта", "/oferta"],
  ["Бренды", "/brands"],
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#d9d2c8] bg-[#f1ece5]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-8">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">Клиентам</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            {clientLinks.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">О компании</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            {companyLinks.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">Контакты</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li><a href="mailto:help@resale-shopping.ru">help@resale-shopping.ru</a></li>
            <li><a href="tel:+74950050186">8 495 005 01 86</a></li>
            <li><a href="https://wa.me/79260050186" target="_blank" rel="noreferrer">WhatsApp</a></li>
            <li><a href="https://t.me/alfa_resale" target="_blank" rel="noreferrer">Telegram</a></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">Telegram</h3>
          <p className="mb-3 text-sm text-zinc-700">Подписчики канала первыми видят новые лоты.</p>
          <a href="https://t.me/alfa_resale" target="_blank" rel="noreferrer" className="inline-block rounded-full bg-zinc-900 px-4 py-2 text-xs uppercase tracking-[0.14em] text-white">
            Подписаться
          </a>
        </div>
      </div>
      <div className="border-t border-[#d9d2c8] px-4 py-4 text-center text-xs text-zinc-600 md:px-8">
        © {new Date().getFullYear()} resale-shopping.ru
      </div>
    </footer>
  );
}

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
            <li className="flex items-center gap-3">
              <a
                href="https://max.ru/join/J1pA3IqKoZAqlMXSy6fNV6cgneaAxuPL_PECo3MX_qU"
                target="_blank"
                rel="noreferrer"
                aria-label="MAX"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ede4] text-white ring-1 ring-[#d9d2c8] transition hover:bg-white"
              >
                {/* Иконка MAX (favicon с max.ru) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://max.ru/favicon.ico" alt="" className="h-5 w-5 rounded-sm" />
              </a>

              <a
                href="https://t.me/resaleshoppingg"
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ede4] text-[#229ED9] ring-1 ring-[#d9d2c8] transition hover:bg-white"
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 text-[#229ED9]">
                  <path
                    d="M9.16 19.1 10.4 13.7 16.2 9.2c.35-.25.75-.2.58.35l-2.15 6.4c-.08.25-.32.45-.58.45L11 14.5l-1.96 1.6Z"
                    fill="currentColor"
                    opacity="0.95"
                  />
                  <path
                    d="M19.6 4.8 4.9 10.7c-1.1.44-1.08 1.08-.2 1.34l3.95 1.23 7.88-6.07c.43-.31.82-.15.5.2l-6.1 7.25-.22 3.15c.42.16.72.1.98-.1l2.01-1.5 3.25 2.4c.6.33 1.1.16 1.26-.6L21 5.9c.23-1.03-.42-1.55-1.4-1.1Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em]">Telegram</h3>
          <p className="mb-3 text-sm text-zinc-700">Подписчики канала первыми видят новые лоты.</p>
          <a
            href="https://t.me/resaleshoppingg"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 py-2 text-xs uppercase tracking-[0.14em] text-white transition hover:bg-[#1D8FCC]"
          >
            <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
                <path
                  d="M9.16 19.1 10.4 13.7 16.2 9.2c.35-.25.75-.2.58.35l-2.15 6.4c-.08.25-.32.45-.58.45L11 14.5l-1.96 1.6Z"
                  fill="currentColor"
                  opacity="0.95"
                />
                <path
                  d="M19.6 4.8 4.9 10.7c-1.1.44-1.08 1.08-.2 1.34l3.95 1.23 7.88-6.07c.43-.31.82-.15.5.2l-6.1 7.25-.22 3.15c.42.16.72.1.98-.1l2.01-1.5 3.25 2.4c.6.33 1.1.16 1.26-.6L21 5.9c.23-1.03-.42-1.55-1.4-1.1Z"
                  fill="currentColor"
                />
              </svg>
            </span>
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

import Link from "next/link";

import { getSiteNavItems } from "@/lib/site-nav";

/** Серверное меню: ссылки есть в HTML, Яндекс может взять их в быстрые ссылки. */
export async function HeaderCategoryNav() {
  const navItems = await getSiteNavItems();

  return (
    <nav
      className="-mx-3 border-t border-[#d9d2c8]/50 px-3 pb-2.5 pt-1 md:-mx-8 md:px-8"
      aria-label="Разделы сайта"
    >
      <div className="grid w-full grid-cols-5 gap-x-1 pb-1 md:gap-x-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group relative flex min-h-[2.75rem] items-center justify-center px-0.5 py-2 text-center text-[9px] font-medium uppercase leading-snug tracking-[0.12em] text-zinc-500 transition-colors duration-200 hover:text-zinc-900 sm:text-[10px] sm:tracking-[0.14em] md:min-h-0 md:px-1 md:text-[11px] md:tracking-[0.18em]"
          >
            <span className="relative z-10 text-balance">{item.label}</span>
            <span
              className="pointer-events-none absolute inset-x-1 bottom-1.5 h-px origin-left scale-x-0 bg-zinc-800/70 transition-transform duration-300 ease-out group-hover:scale-x-100 sm:inset-x-2 md:inset-x-3"
              aria-hidden
            />
          </Link>
        ))}
      </div>
      <Link href="/contacts" className="sr-only">
        Контакты
      </Link>
    </nav>
  );
}

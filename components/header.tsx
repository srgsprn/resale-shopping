import Link from "next/link";

import { HeaderCartBadge } from "@/components/header-cart-badge";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8] bg-[#f6f3ef]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-3 md:gap-4 md:px-8">
        <Link
          href="/prodaja"
          className="hidden rounded-full border border-zinc-800/90 bg-[#ebe6df] px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-zinc-900 md:inline-block"
        >
          Продать
        </Link>

        <Link href="/" className="min-w-0 text-base font-semibold tracking-[0.08em] text-zinc-900 md:text-xl">
          <span className="truncate">RESALE SHOPPING</span>
        </Link>

        <nav className="ml-auto flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-zinc-700 md:gap-6 md:text-xs md:tracking-[0.14em]">
          <Link href="/catalog" className="whitespace-nowrap hover:text-zinc-900">
            Каталог
          </Link>
          <Link href="/wishlist" className="hidden whitespace-nowrap hover:text-zinc-900 sm:inline">
            Избранное
          </Link>
          <HeaderCartBadge />
        </nav>
      </div>
    </header>
  );
}

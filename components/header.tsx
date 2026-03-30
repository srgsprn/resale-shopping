import Link from "next/link";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderCategoryNav } from "@/components/header-category-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link
            href="/prodaja"
            className="hidden rounded-full border border-zinc-800/25 bg-white/50 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-800 transition hover:border-zinc-800/50 hover:bg-white md:inline-flex"
          >
            Продать
          </Link>

          <Link href="/" className="min-w-0 text-[15px] font-semibold tracking-[0.06em] text-zinc-900 md:text-lg">
            <span className="truncate">RESALE SHOPPING</span>
          </Link>

          <nav className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-zinc-600 md:gap-5 md:text-[11px] md:tracking-[0.14em]">
            <Link
              href="/catalog"
              className="whitespace-nowrap rounded-md px-1.5 py-1 transition hover:bg-zinc-900/5 hover:text-zinc-900"
            >
              Каталог
            </Link>
            <Link
              href="/wishlist"
              className="hidden whitespace-nowrap rounded-md px-1.5 py-1 transition hover:bg-zinc-900/5 hover:text-zinc-900 sm:inline"
            >
              Избранное
            </Link>
            <HeaderCartBadge />
          </nav>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

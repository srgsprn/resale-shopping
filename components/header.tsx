import Image from "next/image";
import Link from "next/link";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { HeaderMainLinks } from "@/components/header-main-links";
import { HeaderTelegramSubscribeButton } from "@/components/header-telegram-subscribe";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link
            href="/prodaja"
            className="hidden rounded-full border border-zinc-900 bg-zinc-900 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[#f6f3ef] transition hover:bg-zinc-800 md:inline-flex"
          >
            Продать
          </Link>

          <Link
            href="/"
            className="flex h-11 w-11 items-center justify-center rounded-2xl transition hover:bg-zinc-900/5"
            aria-label="Главная"
          >
            <Image
              src="/resale-icon.png"
              alt="Resale shopping"
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl object-contain"
              priority
            />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <HeaderMainLinks />
            <HeaderCartBadge />
            <HeaderTelegramSubscribeButton />
          </div>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

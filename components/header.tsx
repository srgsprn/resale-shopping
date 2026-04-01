import Link from "next/link";
import Image from "next/image";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderAuthButton } from "@/components/header-auth-button";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { HeaderMainLinks } from "@/components/header-main-links";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-center gap-3 py-2 md:gap-4 md:py-3">
          <Link
            href="/"
            className="flex h-12 w-20 items-center justify-center rounded-3xl md:h-20 md:w-36"
            aria-label="Главная"
          >
            <Image
              src="/resale-icon.png"
              alt="Resale shopping"
              width={144}
              height={80}
              className="h-12 w-20 rounded-3xl object-contain md:h-20 md:w-36"
              priority
            />
          </Link>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <Link
              href="/prodaja"
              className="inline-flex items-center justify-center rounded-full border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-900 shadow-sm transition hover:brightness-105 md:text-[11px]"
            >
              Продать
            </Link>
            <HeaderMainLinks />
            <HeaderCartBadge />
            <HeaderAuthButton />
          </div>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

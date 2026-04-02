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
            className="flex h-11 shrink-0 items-center justify-center rounded-2xl border border-[#e5ddd4] bg-[#faf8f5] px-2.5 py-1.5 md:h-12 md:px-3.5"
            aria-label="Главная"
          >
            <Image
              src="/resale-icon.png"
              alt="Resale shopping"
              width={240}
              height={96}
              className="h-8 w-auto max-h-8 max-w-[10.5rem] object-contain md:h-9 md:max-h-9 md:max-w-[15rem]"
              priority
            />
          </Link>

          <div className="ml-auto flex h-10 items-center gap-2 md:gap-3">
            <Link
              href="/prodaja"
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[#c4b5a4] bg-gradient-to-r from-[#efe6db] to-[#dcc9b5] px-4 text-[11px] font-semibold tracking-[0.06em] text-[#3d342c] shadow-sm transition hover:from-[#f2ebe3] hover:to-[#e2d2c0] md:px-5 md:text-xs"
            >
              Продать
            </Link>
            <div className="flex h-10 items-center gap-0.5 md:gap-1">
              <HeaderMainLinks />
              <HeaderCartBadge />
              <HeaderAuthButton />
            </div>
          </div>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

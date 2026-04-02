import Link from "next/link";
import Image from "next/image";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderAuthButton } from "@/components/header-auth-button";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { HeaderMainLinks } from "@/components/header-main-links";
import { HeaderSellButton } from "@/components/header-sell-button";

export function Header() {
  return (
    <header className="relative z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80 md:sticky md:top-0">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-center gap-3 py-2 md:gap-4 md:py-3">
          <Link
            href="/"
            className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full md:h-12 md:w-12"
            aria-label="Главная"
          >
            <Image
              src="/resale-icon.png"
              alt="Resale shopping"
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </Link>

          <div className="ml-auto flex h-10 items-center gap-2 md:gap-3">
            <HeaderSellButton />
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

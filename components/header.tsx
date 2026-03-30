import Link from "next/link";
import Image from "next/image";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { HeaderMainLinks } from "@/components/header-main-links";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-center gap-3 py-3 md:gap-4">
          <Link
            href="/"
            className="flex h-14 w-16 items-center justify-center rounded-3xl transition hover:bg-zinc-900/5 md:h-28 md:w-32"
            aria-label="Главная"
          >
            <Image
              src="/resale-icon.png"
              alt="Resale shopping"
              width={112}
              height={112}
              className="h-14 w-16 rounded-3xl object-contain md:h-28 md:w-32"
              priority
            />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <HeaderMainLinks />
            <HeaderCartBadge />
          </div>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

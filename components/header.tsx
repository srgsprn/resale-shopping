import Link from "next/link";
import Image from "next/image";

import { HeaderCartBadge } from "@/components/header-cart-badge";
import { HeaderCategoryNav } from "@/components/header-category-nav";
import { HeaderMainLinks } from "@/components/header-main-links";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9d2c8]/80 bg-[#f6f3ef]/90 backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f3ef]/80">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex items-end gap-3 py-2 md:gap-4 md:py-3">
          <Link
            href="/"
            className="flex h-12 w-20 cursor-pointer items-center justify-center rounded-3xl md:h-20 md:w-36"
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

          <div className="ml-auto flex items-center gap-2 pb-0.5 md:gap-3 md:pb-1">
            <HeaderMainLinks />
            <HeaderCartBadge />
          </div>
        </div>

        <HeaderCategoryNav />
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Cat = { id: string; name: string; slug: string };

export function HeaderCategoryNav() {
  const [categories, setCategories] = useState<Cat[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as Cat[];
        if (!cancelled && Array.isArray(data)) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (categories === null) {
    return (
      <nav
        className="-mx-3 border-t border-[#d9d2c8]/50 px-3 pb-2.5 pt-1 md:-mx-8 md:px-8"
        aria-label="Категории"
      >
        <div className="flex gap-2 overflow-hidden py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-3 w-14 shrink-0 animate-pulse rounded bg-zinc-200/80 md:w-20"
              aria-hidden
            />
          ))}
        </div>
      </nav>
    );
  }

  if (categories.length === 0) return null;

  return (
    <nav className="w-full border-t border-[#d9d2c8]/50" aria-label="Навигация">
      <div className="mx-auto max-w-7xl px-3 md:px-8">
        <div className="flex w-full items-center gap-0 overflow-x-auto overscroll-x-contain pb-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(() => {
            const slugBy = (re: RegExp) =>
              categories.find((c) => re.test(c.name))?.slug;

            const jewelrySlug = slugBy(/ювелир/i);
            const beltsSlug = slugBy(/ремн/i);
            const shoesSlug = slugBy(/обув/i);
            const mittensSlug = slugBy(/вареж/i);
            const bagsSlug = slugBy(/сумк/i);
            const accessoriesSlug = slugBy(/аксесс/i);

            const navItems: Array<{ label: string; href: string }> = [
              { label: "Бренды", href: "/brands" },
              { label: "Каталог", href: "/catalog" },
              { label: "Новинки", href: "/catalog?sort=newest" },
              {
                label: "Ювелирные изделия",
                href: jewelrySlug ? `/catalog?category=${encodeURIComponent(jewelrySlug)}` : "/catalog?sort=newest",
              },
              {
                label: "Ремни",
                href: beltsSlug ? `/catalog?category=${encodeURIComponent(beltsSlug)}` : "/catalog",
              },
              {
                label: "Обувь",
                href: shoesSlug ? `/catalog?category=${encodeURIComponent(shoesSlug)}` : "/catalog",
              },
              {
                label: "Варежки",
                href: mittensSlug ? `/catalog?category=${encodeURIComponent(mittensSlug)}` : "/catalog",
              },
              {
                label: "Сумки",
                href: bagsSlug ? `/catalog?category=${encodeURIComponent(bagsSlug)}` : "/catalog",
              },
              {
                label: "Аксессуары",
                href: accessoriesSlug ? `/catalog?category=${encodeURIComponent(accessoriesSlug)}` : "/catalog",
              },
              { label: "Подарочные карты", href: "/gift-cards" },
            ];

            return navItems.map((it) => (
              <Link
                key={it.label}
                href={it.href}
                className="group relative whitespace-nowrap px-2.5 py-2 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500 transition-colors duration-200 hover:text-zinc-900 md:px-3 md:text-[11px] md:tracking-[0.18em]"
              >
                <span className="relative z-10">{it.label}</span>
                <span
                  className="pointer-events-none absolute inset-x-2 bottom-1.5 h-px origin-left scale-x-0 bg-zinc-800/70 transition-transform duration-300 ease-out group-hover:scale-x-100 md:inset-x-3"
                  aria-hidden
                />
              </Link>
            ));
          })()}
        </div>
      </div>
    </nav>
  );
}

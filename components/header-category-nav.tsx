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
        <div className="grid w-full grid-cols-5 gap-x-1 py-2 md:gap-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="mx-auto h-3 w-full max-w-[4.5rem] animate-pulse rounded bg-zinc-200/80 md:max-w-none"
              aria-hidden
            />
          ))}
        </div>
      </nav>
    );
  }

  if (categories.length === 0) return null;

  const categorySlugBy = (re: RegExp) =>
    categories.find((c) => re.test(c.name))?.slug;

  const jewelrySlug = categorySlugBy(/ювелир/i);
  const watchSlug = categorySlugBy(/час/i);

  const navItems: Array<{ label: string; href: string }> = [
    { label: "Каталог", href: "/catalog" },
    { label: "Новинки", href: "/new" },
    {
      label: "Ювелирные украшения",
      href: jewelrySlug ? `/catalog?category=${encodeURIComponent(jewelrySlug)}` : "/catalog",
    },
    {
      label: "Часы",
      href: watchSlug ? `/catalog?category=${encodeURIComponent(watchSlug)}` : "/catalog",
    },
    { label: "Подарочная карта", href: "/gift-cards" },
  ];

  return (
    <nav
      className="-mx-3 border-t border-[#d9d2c8]/50 px-3 pb-2.5 pt-1 md:-mx-8 md:px-8"
      aria-label="Категории"
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
    </nav>
  );
}

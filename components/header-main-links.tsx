"use client";

import Link from "next/link";
const heartIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
    <path
      d="M12.001 20.001s-7.25-4.55-9.4-8.36C.91 8.7 2.14 5.96 4.82 5.14c1.62-.5 3.37.1 4.45 1.39 1.08-1.29 2.83-1.89 4.45-1.39 2.68.82 3.91 3.56 2.22 6.5-2.15 3.81-9.44 8.36-9.44 8.36Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const cartIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
    <path
      d="M6.5 9.2h14l-1.2 11H7.7L6.5 9.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 9.2 5.5 5.8H2.8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export function HeaderMainLinks() {
  return (
    <nav className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] md:gap-5 md:text-[11px] md:tracking-[0.14em]">
      <Link
        href="/wishlist"
        className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 transition hover:bg-zinc-900/5 hover:text-zinc-900"
      >
        <span className="sr-only">Избранное</span>
        {heartIcon}
      </Link>

      {/* cart is rendered by HeaderCartBadge */}
    </nav>
  );
}


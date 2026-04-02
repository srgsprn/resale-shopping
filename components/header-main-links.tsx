"use client";

import Link from "next/link";
const heartIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
    <path
      d="M20.84 4.61c-1.54-1.53-4.03-1.53-5.57 0l-1.27 1.27-1.27-1.27a3.94 3.94 0 0 0-5.57 0 3.94 3.94 0 0 0 0 5.57l1.27 1.27L14 17.06l5.61-5.61 1.27-1.27a3.94 3.94 0 0 0-.04-5.57Z"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function HeaderMainLinks() {
  return (
    <nav className="flex items-center">
      <Link
        href="/wishlist"
        className="inline-flex h-10 w-10 flex-none items-center justify-center text-zinc-700 transition hover:text-zinc-900"
      >
        <span className="sr-only">Избранное</span>
        {heartIcon}
      </Link>

      {/* cart is rendered by HeaderCartBadge */}
    </nav>
  );
}


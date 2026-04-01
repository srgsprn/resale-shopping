"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { readWishlist, toggleWishlistItem, type WishlistItem } from "@/lib/wishlist";

export function WishlistToggleButton({ item }: { item: WishlistItem }) {
  const { data: session, status } = useSession();
  const userKey = useMemo(() => session?.user?.email ?? "", [session?.user?.email]);
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!userKey) return;
    const sync = () => setVersion((v) => v + 1);
    window.addEventListener("resale-wishlist-updated", sync);
    return () => window.removeEventListener("resale-wishlist-updated", sync);
  }, [userKey]);

  if (status === "loading") return null;
  const active = Boolean(userKey) && readWishlist(userKey).some((entry) => entry.id === item.id);

  return (
    <button
      type="button"
      onClick={() => {
        if (!userKey) {
          signIn("yandex", { callbackUrl: `/product/${item.slug}` });
          return;
        }
        toggleWishlistItem(userKey, item);
        setVersion((v) => v + 1);
      }}
      aria-label={active ? "Убрать из избранного" : "Добавить в избранное"}
      title={active ? "Убрать из избранного" : "Добавить в избранное"}
      className={`inline-flex h-9 w-9 items-center justify-center leading-none transition ${
        active
          ? "text-red-600"
          : "text-zinc-500 hover:text-zinc-900"
      }`}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} aria-hidden className="h-5 w-5 shrink-0">
        <path
          d="M20.84 4.61c-1.54-1.53-4.03-1.53-5.57 0l-1.27 1.27-1.27-1.27a3.94 3.94 0 0 0-5.57 0 3.94 3.94 0 0 0 0 5.57l1.27 1.27L14 17.06l5.61-5.61 1.27-1.27a3.94 3.94 0 0 0-.04-5.57Z"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

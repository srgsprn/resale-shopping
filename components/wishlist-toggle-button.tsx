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
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
        active
          ? "border-red-500 bg-red-50 text-red-600"
          : "border-[#d9d2c8] bg-white text-zinc-500 hover:border-zinc-800 hover:text-zinc-900"
      }`}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} aria-hidden className="h-5 w-5">
        <path
          d="M12.001 20.001s-7.25-4.55-9.4-8.36C.91 8.7 2.14 5.96 4.82 5.14c1.62-.5 3.37.1 4.45 1.39 1.08-1.29 2.83-1.89 4.45-1.39 2.68.82 3.91 3.56 2.22 6.5-2.15 3.81-9.44 8.36-9.44 8.36Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

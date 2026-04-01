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
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white"
          : "border-[#d9d2c8] bg-white text-zinc-700 hover:border-zinc-800 hover:text-zinc-900"
      }`}
    >
      {active ? "В избранном" : "В избранное"}
    </button>
  );
}

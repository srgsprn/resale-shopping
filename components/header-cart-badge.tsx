"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function cartCount(): number {
  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return 0;
    const arr = JSON.parse(raw) as { quantity?: number }[];
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((n, i) => n + (typeof i.quantity === "number" ? i.quantity : 0), 0);
  } catch {
    return 0;
  }
}

export function HeaderCartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(cartCount());
    const onUpdate = () => setCount(cartCount());
    window.addEventListener("resale-cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("resale-cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-1.5 py-1 transition hover:bg-zinc-900/5 hover:text-zinc-900"
    >
      <span aria-hidden>Корзина</span>
      {count > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-semibold text-[#f6f3ef]">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

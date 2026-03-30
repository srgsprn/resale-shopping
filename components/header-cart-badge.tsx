"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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
  const prev = useRef(0);
  const [popKey, setPopKey] = useState(0);

  useEffect(() => {
    const initial = cartCount();
    prev.current = initial;
    setCount(initial);

    const onUpdate = () => {
      const next = cartCount();
      if (next > prev.current) setPopKey((k) => k + 1);
      prev.current = next;
      setCount(next);
    };
    window.addEventListener("resale-cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("resale-cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const cartIcon = useMemo(
    () => (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6 md:h-7 md:w-7">
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
    ),
    [],
  );

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center rounded-md px-1.5 py-1.5 text-zinc-700 transition hover:bg-zinc-900/5 hover:text-zinc-900"
    >
      <span className="sr-only">Корзина</span>
      {cartIcon}

      {count > 0 ? (
        <motion.span
          key={popKey}
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-semibold text-[#f6f3ef] md:h-6 md:min-w-6 md:text-[11px]"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      ) : null}
    </Link>
  );
}

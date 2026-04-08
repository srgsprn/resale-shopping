"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

import { dispatchCartUpdated } from "@/lib/cart-events";
import { formatMoney } from "@/lib/money";

type CartItem = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
  quantity: number;
};

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  const persistItems = (next: CartItem[]) => {
    setItems(next);
    localStorage.setItem("cart", JSON.stringify(next));
    dispatchCartUpdated();
  };

  const removeItem = (id: string) => {
    persistItems(items.filter((i) => i.id !== id));
  };

  const changeQty = (id: string, delta: number) => {
    const next = items
      .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
      .filter((i) => i.quantity > 0);
    persistItems(next);
  };

  useEffect(() => {
    const onUpdate = () => setItems(loadCart());
    window.addEventListener("resale-cart-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("resale-cart-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  const totalMinor = useMemo(() => items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0), [items]);

  const placeholder = "https://placehold.co/160x160/f4f4f5/71717a?text=+";

  return (
    <>
      {items.length === 0 ? (
        <section className="mx-auto flex min-h-[min(70vh,640px)] w-full max-w-2xl flex-col items-center justify-center gap-8 px-4 py-12 text-center md:min-h-[60vh] md:py-16">
          <div className="flex justify-center">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-14 w-14 text-zinc-700">
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
          </div>

          <h1 className="text-2xl font-normal tracking-tight text-zinc-900 md:text-3xl">
            ВАША КОРЗИНА ДЛЯ ПОКУПОК ПУСТА
          </h1>

          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-10 py-3 text-center text-xs font-semibold tracking-[0.14em] text-zinc-900"
          >
            Перейти в каталог
          </Link>
        </section>
      ) : (
        <section className="space-y-8">
          <h1 className="text-3xl font-semibold tracking-tight">Корзина</h1>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[24px] border border-[#d9d2c8] bg-white p-4 md:gap-5 md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d9d2c8] bg-white text-zinc-700 transition hover:bg-[#f4f0ea]"
                    aria-label="Удалить товар"
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
                      <path
                        d="M4 7h16M9 7V5h6v2m-7 0 1 12h6l1-12"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-28 md:w-28"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl || placeholder} alt="" className="h-full w-full object-cover" />
                  </Link>

                  <Link href={`/product/${item.slug}`} className="min-w-0 text-base font-medium text-zinc-900 hover:underline">
                    {item.name}
                  </Link>

                  <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9d2c8] bg-[#faf8f5] px-2 py-1">
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, -1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e6ddd2] bg-white text-zinc-700 hover:bg-[#f4f0ea]"
                      aria-label="Уменьшить количество"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-zinc-900">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQty(item.id, 1)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#e6ddd2] bg-white text-zinc-700 hover:bg-[#f4f0ea]"
                      aria-label="Увеличить количество"
                    >
                      +
                    </button>
                  </div>

                  <p className="text-right text-base font-semibold md:text-lg">
                    {formatMoney(item.priceMinor * item.quantity, item.currency)}
                  </p>
                </article>
              ))}
            </div>

            <aside className="rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-700">Итого заказа</h2>
              <div className="mt-5 space-y-2 border-b border-[#d9d2c8] pb-4 text-sm text-zinc-700">
                <p className="flex items-center justify-between">
                  <span>Товаров:</span>
                  <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                </p>
                <p className="flex items-center justify-between text-base font-semibold text-zinc-900">
                  <span>К оплате:</span>
                  <span>{formatMoney(totalMinor)}</span>
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/checkout"
                  className={`inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 ${
                    items.length === 0 ? "pointer-events-none opacity-40" : ""
                  }`}
                  aria-disabled={items.length === 0}
                >
                  Оформить заказ
                </Link>
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-full border border-[#d0c6b9] bg-white px-8 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:bg-[#f4f0ea]"
                >
                  Продолжить покупки
                </Link>
              </div>
            </aside>
          </div>
        </section>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

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
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
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
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">Корзина</h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-[24px] border border-[#d9d2c8] bg-white p-4 md:gap-5 md:p-5"
            >
              <Link href={`/product/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-28 md:w-28">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl || placeholder} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.brand}</p>
                  <Link href={`/product/${item.slug}`} className="font-medium text-zinc-900 hover:underline">
                    {item.name}
                  </Link>
                  <p className="text-sm text-zinc-600">
                    {item.quantity} × {formatMoney(item.priceMinor, item.currency)}
                  </p>
                </div>
                <p className="text-right text-base font-semibold md:text-lg">{formatMoney(item.priceMinor * item.quantity, item.currency)}</p>
              </div>
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
  );
}

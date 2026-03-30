"use client";

import { useMemo, useState } from "react";

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

export default function CartPage() {
  const [items] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    return JSON.parse(localStorage.getItem("cart") || "[]");
  });
  const [loading, setLoading] = useState(false);

  const totalMinor = useMemo(() => items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0), [items]);

  const checkout = async () => {
    setLoading(true);
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      }),
    });

    const json = await response.json();
    if (json.url) {
      window.location.href = json.url;
      return;
    }
    setLoading(false);
    alert(json.error || "Checkout error");
  };

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold">Корзина</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.brand}</p>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-600">x{item.quantity}</p>
            </div>
            <p>{formatMoney(item.priceMinor * item.quantity, item.currency)}</p>
          </article>
        ))}
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <p className="mb-4 text-lg font-medium">Итого: {formatMoney(totalMinor)}</p>
        <button
          type="button"
          onClick={checkout}
          disabled={loading || items.length === 0}
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Переход к оплате..." : "Оформить заказ"}
        </button>
      </div>
    </section>
  );
}

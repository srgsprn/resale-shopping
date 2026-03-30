"use client";

import { useState } from "react";

type CartProduct = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
};

export function AddToCartButton({ product }: { product: CartProduct }) {
  const [added, setAdded] = useState(false);

  const onClick = () => {
    const current = JSON.parse(localStorage.getItem("cart") || "[]") as Array<CartProduct & { quantity: number }>;
    const existing = current.find((i) => i.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(current));
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
    >
      {added ? "Добавлено" : "Добавить в корзину"}
    </button>
  );
}

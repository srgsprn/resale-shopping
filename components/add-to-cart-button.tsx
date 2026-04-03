"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import clsx from "clsx";

import { dispatchCartUpdated } from "@/lib/cart-events";

type CartProduct = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
};

export function AddToCartButton({
  product,
  className,
}: {
  product: CartProduct;
  className?: string;
}) {
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const onClick = () => {
    const current = JSON.parse(localStorage.getItem("cart") || "[]") as Array<CartProduct & { quantity: number }>;
    const existing = current.find((i) => i.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      current.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(current));
    dispatchCartUpdated();
    setAdded(true);
    window.setTimeout(() => {
      router.push("/cart");
    }, 260);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800",
        className,
      )}
    >
      {added ? "Добавлено" : "Добавить в корзину"}
    </button>
  );
}

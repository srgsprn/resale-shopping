"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

import { formatMoney } from "@/lib/money";
import { stripResaleShoppingSuffix } from "@/lib/product-name";
import { readWishlist, type WishlistItem } from "@/lib/wishlist";

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const userKey = useMemo(() => session?.user?.email ?? "", [session?.user?.email]);
  const [, setVersion] = useState(0);

  useEffect(() => {
    if (!userKey) return;
    const sync = () => setVersion((v) => v + 1);
    window.addEventListener("resale-wishlist-updated", sync);
    return () => window.removeEventListener("resale-wishlist-updated", sync);
  }, [userKey]);

  if (status === "loading") {
    return <section className="rounded-2xl border border-zinc-200 bg-white p-6">Загружаем избранное…</section>;
  }

  if (!session?.user) {
    return (
      <section className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Избранное</h1>
        <p className="mt-2 text-sm text-zinc-700">
          Авторизуйтесь в личном кабинете, чтобы сохранять понравившиеся товары и возвращаться к ним в один клик.
        </p>
        <Link
          href="/auth/signin"
          className="mt-5 inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
        >
          Войти
        </Link>
      </section>
    );
  }
  const items: WishlistItem[] = userKey ? readWishlist(userKey) : [];

  return (
    <section className="space-y-5">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Избранное</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Здесь собраны товары, которые вы отметили. Выберите лот, чтобы посмотреть детали и оформить заказ.
        </p>
        <Link
          href="/account"
          className="mt-4 inline-block text-sm text-[#7c5430] underline-offset-4 hover:underline"
        >
          ← Личный кабинет
        </Link>
      </div>
      {items.length === 0 ? (
        <section className="rounded-[24px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 text-sm text-zinc-700">
          Пока нет сохраненных товаров. Откройте каталог и добавьте лоты в избранное.
        </section>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => {
            const displayName = stripResaleShoppingSuffix(item.name);
            return (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[#d9d2c8] bg-white">
                <Link href={`/product/${item.slug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || "https://placehold.co/800x800/f4f4f5/18181b?text=Resale"}
                    alt={displayName}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="space-y-1 p-4">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">{item.brand}</p>
                    <h2 className="line-clamp-2 text-sm font-medium text-zinc-900">{displayName}</h2>
                    <p className="text-sm text-zinc-800">{formatMoney(item.priceMinor, item.currency)}</p>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

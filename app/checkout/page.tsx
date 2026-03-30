"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function load() {
      setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    }
    load();
    window.addEventListener("resale-cart-updated", load);
    return () => window.removeEventListener("resale-cart-updated", load);
  }, []);

  const totalMinor = useMemo(() => items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0), [items]);
  const currency = items[0]?.currency ?? "RUB";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Корзина пуста");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          customer: {
            email,
            fullName,
            phone: phone || undefined,
            note: note || undefined,
          },
        }),
      });

      const json = (await response.json()) as { url?: string; error?: string };
      if (!response.ok) {
        setError(json.error || "Ошибка оформления");
        setLoading(false);
        return;
      }
      if (json.url) {
        if (json.url.includes("manual=1")) {
          localStorage.setItem("cart", "[]");
          window.dispatchEvent(new Event("resale-cart-updated"));
        }
        window.location.href = json.url;
        return;
      }
      setError("Пустой ответ сервера");
    } catch {
      setError("Сеть недоступна, попробуйте ещё раз");
    }
    setLoading(false);
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#d9d2c8] bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold">Оформление заказа</h1>
        <p className="text-zinc-600">В корзине пока нет товаров.</p>
        <Link href="/catalog" className="inline-block rounded-full border border-zinc-800 bg-[#f8f6f2] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em]">
          В каталог
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="mb-2 text-3xl font-semibold tracking-tight">Данные для заказа</h1>
        <p className="mb-8 text-sm text-zinc-600">
          Сначала контакты и состав заказа, затем безопасная оплата (если на сервере настроен Stripe).
        </p>
        <form onSubmit={onSubmit} className="max-w-xl space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              Имя и фамилия
            </label>
            <input
              id="fullName"
              required
              autoComplete="name"
              value={fullName}
              onChange={(ev) => setFullName(ev.target.value)}
              className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              Телефон (необязательно)
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="note" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
              Комментарий к заказу
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(ev) => setNote(ev.target.value)}
              className="w-full resize-none rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full border border-zinc-800 bg-[#b8a99a] px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-900 shadow-sm disabled:opacity-50"
            >
              {loading ? "Создаём заказ…" : "Продолжить к оплате"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="rounded-full px-6 py-3 text-xs uppercase tracking-[0.14em] text-zinc-600 underline-offset-4 hover:underline"
            >
              Назад в корзину
            </button>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-[28px] border border-[#d9d2c8] bg-[#f8f6f2] p-6 lg:sticky lg:top-24">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-700">Ваш заказ</h2>
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl || "https://placehold.co/120x120/f4f4f5/71717a?text=+"}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl border border-white object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-zinc-500">{item.brand}</p>
                <p className="line-clamp-2 text-sm font-medium">{item.name}</p>
                <p className="text-xs text-zinc-600">
                  {item.quantity} × {formatMoney(item.priceMinor, item.currency)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-[#d9d2c8] pt-4 text-lg font-semibold">
          Итого: {formatMoney(totalMinor, currency)}
        </p>
      </aside>
    </div>
  );
}

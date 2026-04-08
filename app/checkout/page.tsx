"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { formatMoney } from "@/lib/money";

const DESIGN_LABELS = ["С бантом", "Классика", "Подарочный"];

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

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const giftSlug = searchParams.get("gift");
  const designParam = searchParams.get("design");
  const designIdx = designParam ? Math.min(Math.max(parseInt(designParam, 10) || 0, 0), DESIGN_LABELS.length - 1) : 0;

  const [items, setItems] = useState<CartItem[]>([]);
  const [giftLoading, setGiftLoading] = useState(() => Boolean(giftSlug));
  const [giftError, setGiftError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [messengerType, setMessengerType] = useState<"telegram" | "max">("telegram");
  const [messengerHandle, setMessengerHandle] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (giftSlug) {
      fetch(`/api/products/${encodeURIComponent(giftSlug)}`)
        .then(async (res) => {
          if (!res.ok) {
            const j = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(j.error || "Карта недоступна. Запустите обновление каталога: npm run db:seed");
          }
          return res.json() as Promise<{
            id: string;
            slug: string;
            brand: string;
            name: string;
            priceMinor: number;
            currency: string;
            imageUrl: string;
          }>;
        })
        .then((p) => {
          setItems([
            {
              id: p.id,
              slug: p.slug,
              brand: p.brand,
              name: p.name,
              priceMinor: p.priceMinor,
              currency: p.currency,
              imageUrl: p.imageUrl,
              quantity: 1,
            },
          ]);
        })
        .catch((e) => setGiftError(e instanceof Error ? e.message : "Ошибка загрузки"))
        .finally(() => setGiftLoading(false));
      return;
    }

    function load() {
      setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    }
    load();
    window.addEventListener("resale-cart-updated", load);
    return () => window.removeEventListener("resale-cart-updated", load);
  }, [giftSlug]);

  const totalMinor = useMemo(() => items.reduce((sum, i) => sum + i.priceMinor * i.quantity, 0), [items]);
  const currency = items[0]?.currency ?? "RUB";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError("Корзина пуста");
      return;
    }
    let mergedNote = note.trim();
    if (giftSlug) {
      const designLine = `Дизайн карты: ${DESIGN_LABELS[designIdx]}`;
      mergedNote = mergedNote ? `${mergedNote}\n${designLine}` : designLine;
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
            address: address || undefined,
            messengerType: messengerType || undefined,
            messengerHandle: messengerHandle || undefined,
            note: mergedNote || undefined,
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
        // Корзину очищаем только на странице успеха (ClearCartOnSuccess), иначе до редиректа
        // срабатывает resale-cart-updated и на мгновение показывается «корзина пуста».
        window.location.href = json.url;
        return;
      }
      setError("Пустой ответ сервера");
    } catch {
      setError("Сеть недоступна, попробуйте ещё раз");
    }
    setLoading(false);
  };

  if (giftSlug && giftLoading) {
    return (
      <section className="mx-auto max-w-lg rounded-2xl border border-[#d9d2c8] bg-white p-8 text-center text-sm text-zinc-600">
        Загружаем данные карты…
      </section>
    );
  }

  if (giftSlug && giftError) {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[#d9d2c8] bg-white p-8 text-center">
        <p className="text-sm text-red-700">{giftError}</p>
        <Link
          href="/gift-cards"
          className="inline-block rounded-full border border-zinc-800 bg-[#f8f6f2] px-6 py-3 text-xs font-medium uppercase tracking-[0.14em]"
        >
          Назад к подарочной карте
        </Link>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <nav className="text-left text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-800">
            Главная
          </Link>
        </nav>
        <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-10 md:p-14">
          <h1 className="mt-4 text-2xl font-semibold uppercase tracking-tight text-zinc-900 md:text-3xl">
            Ваша корзина для покупок пуста
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-zinc-600">
            Мы приглашаем вас ознакомиться с ассортиментом нашего магазина. Наверняка вы сможете найти что-то для себя!
          </p>
          <Link
            href="/catalog"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-zinc-800 bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] px-8 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
          >
            Возвращение в магазин
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-800">
          Главная
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_460px]">
        <section>
          <h1 className="mb-8 mt-2 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">Оформить заказ</h1>
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
                Контактный телефон
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="address" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                Адрес
              </label>
              <input
                id="address"
                required
                autoComplete="street-address"
                value={address}
                onChange={(ev) => setAddress(ev.target.value)}
                className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="messengerType" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Мессенджер
                </label>
                <div className="flex items-center gap-2 rounded-2xl border border-[#d9d2c8] bg-white p-2">
                  <button
                    type="button"
                    aria-label="Telegram"
                    onClick={() => setMessengerType("telegram")}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${messengerType === "telegram" ? "border-[#3f7fbe] bg-[#eef6ff]" : "border-[#d9d2c8] bg-white"}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5 text-[#229ED9]">
                      <path d="M9.16 19.1 10.4 13.7 16.2 9.2c.35-.25.75-.2.58.35l-2.15 6.4c-.08.25-.32.45-.58.45L11 14.5l-1.96 1.6Z" fill="currentColor" opacity="0.95" />
                      <path d="M19.6 4.8 4.9 10.7c-1.1.44-1.08 1.08-.2 1.34l3.95 1.23 7.88-6.07c.43-.31.82-.15.5.2l-6.1 7.25-.22 3.15c.42.16.72.1.98-.1l2.01-1.5 3.25 2.4c.6.33 1.1.16 1.26-.6L21 5.9c.23-1.03-.42-1.55-1.4-1.1Z" fill="currentColor" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="MAX"
                    onClick={() => setMessengerType("max")}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${messengerType === "max" ? "border-[#3f7fbe] bg-[#eef6ff]" : "border-[#d9d2c8] bg-white"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="https://max.ru/favicon.ico" alt="MAX" className="h-5 w-5 rounded-sm" />
                  </button>
                  <div className="ml-auto flex h-8 w-8 -translate-x-1 items-center justify-center rounded-full border border-[#d9d2c8] bg-white text-zinc-700 shadow-sm">
                    ▾
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="messengerHandle" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                  Контакт в мессенджере
                </label>
                <input
                  id="messengerHandle"
                  required
                  placeholder={messengerType === "telegram" ? "@username" : "@max"}
                  value={messengerHandle}
                  onChange={(ev) => setMessengerHandle(ev.target.value)}
                  className="w-full rounded-2xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
                />
              </div>
            </div>
            <div>
              <label htmlFor="note" className="mb-1 block text-xs font-medium uppercase tracking-[0.12em] text-zinc-600">
                {giftSlug ? "Примечание к заказу (имя на карте и пожелания)" : "Комментарий к заказу"}
              </label>
              <textarea
                id="note"
                rows={4}
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
                {loading ? "Создаём заказ…" : "Оформить"}
              </button>
              <button
                type="button"
                onClick={() => router.push(giftSlug ? "/gift-cards" : "/cart")}
                className="rounded-full px-6 py-3 text-xs uppercase tracking-[0.14em] text-zinc-600 underline-offset-4 hover:underline"
              >
                Назад
              </button>
            </div>
          </form>
        </section>

        <aside className="h-fit rounded-[28px] border border-[#d9d2c8] bg-[#faf8f5] p-6 md:p-7 lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-700">Ваш заказ</h2>
          <ul className="mt-4 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl || "https://placehold.co/120x120/f4f4f5/71717a?text=+"}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-white object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-zinc-500">{item.brand}</p>
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{item.name}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-[#d9d2c8] pt-4 text-lg font-semibold">
            Итого: {formatMoney(totalMinor, currency)}
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-lg rounded-2xl border border-[#d9d2c8] bg-white p-8 text-center text-sm text-zinc-600">
          Загрузка…
        </section>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

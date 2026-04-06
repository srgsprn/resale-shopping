"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/brands", label: "Бренды" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/seo-pages", label: "SEO" },
  { href: "/admin/users", label: "Пользователи" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkCls = (href: string) => {
    const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
    return `block rounded-xl px-3 py-2 text-sm font-medium transition ${
      active ? "bg-zinc-900 text-[#f6f3ef]" : "text-zinc-700 hover:bg-white/80"
    }`;
  };

  return (
    <>
      <button
        type="button"
        className="fixed left-3 top-3 z-40 rounded-lg border border-[#d9d2c8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-800 md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Меню
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-60 border-r border-[#d9d2c8] bg-[#f1ece5] pt-14 md:static md:z-0 md:pt-0 ${
          open ? "flex" : "hidden md:flex"
        } flex-col`}
      >
        <div className="border-b border-[#e5dfd6] px-4 py-4">
          <Link href="/admin" className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">
            Resale Admin
          </Link>
          <p className="mt-1 text-xs text-zinc-500">resale-shopping.ru</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(item.href)} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#e5dfd6] p-2">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-700 hover:bg-white/80"
          >
            Выход
          </button>
        </div>
      </aside>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          aria-label="Закрыть меню"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "next-auth/react";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/categories", label: "Категории" },
  { href: "/admin/brands", label: "Бренды" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/users", label: "Пользователи" },
];

type Props = {
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export function AdminSidebar({ mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();

  const linkCls = (href: string) => {
    const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
    return `block rounded-xl px-3 py-3 text-base font-medium transition md:py-2 md:text-sm ${
      active
        ? "border border-[#8b7355] bg-[#faf6f0] text-zinc-900 shadow-sm"
        : "text-zinc-800 active:bg-white/90 md:hover:bg-white/90"
    }`;
  };

  return (
    <>
      <aside
        id="admin-nav-drawer"
        className={`fixed inset-y-0 left-0 z-[90] flex w-[min(18rem,88vw)] max-w-[320px] flex-col border-r border-[#d9d2c8] bg-[#f1ece5] shadow-xl transition-transform duration-200 ease-out md:static md:z-0 md:w-60 md:max-w-none md:translate-x-0 md:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[#e5dfd6] px-3 py-3 md:hidden">
          <span className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-800">Разделы</span>
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-11 min-w-11 items-center justify-center rounded-xl border border-[#d9d2c8] bg-white text-zinc-800"
            aria-label="Закрыть меню"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-3 md:space-y-0.5 md:py-4 md:pt-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkCls(item.href)}
              onClick={() => onMobileClose()}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-[#e5dfd6] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/admin/login" })}
            className="w-full rounded-xl px-3 py-3 text-left text-base font-medium text-zinc-700 active:bg-white/80 md:py-2 md:text-sm md:hover:bg-white/80"
          >
            Выход
          </button>
        </div>
      </aside>
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-[80] bg-zinc-900/40 backdrop-blur-[2px] md:hidden"
          aria-label="Закрыть меню"
          onClick={onMobileClose}
        />
      ) : null}
    </>
  );
}

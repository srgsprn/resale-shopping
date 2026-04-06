"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  menuOpen: boolean;
  onMenuToggle: () => void;
};

export function AdminTopbar({ menuOpen, onMenuToggle }: Props) {
  return (
    <header className="sticky top-0 z-[70] flex min-h-[3.25rem] items-center justify-between gap-2 border-b border-[#d9d2c8] bg-[#faf8f5]/95 px-2 pt-[max(0.35rem,env(safe-area-inset-top))] pb-2 backdrop-blur-md supports-[backdrop-filter]:bg-[#faf8f5]/88 md:static md:z-auto md:min-h-12 md:justify-end md:gap-4 md:px-6 md:py-2 md:pt-2">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-expanded={menuOpen}
        aria-controls="admin-nav-drawer"
        className="flex h-12 min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#5c4a3d] bg-gradient-to-b from-[#f0e4d4] to-[#e4d4c0] px-4 text-sm font-bold tracking-wide text-zinc-900 shadow-md ring-2 ring-[#c9b89c]/40 active:scale-[0.98] md:hidden"
      >
        <span className="flex flex-col gap-1.5" aria-hidden>
          <span className="block h-0.5 w-6 rounded-full bg-zinc-900" />
          <span className="block h-0.5 w-6 rounded-full bg-zinc-900" />
          <span className="block h-0.5 w-6 rounded-full bg-zinc-900" />
        </span>
        <span>Меню</span>
      </button>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-3 md:flex-none">
        <Link
          href="/"
          className="truncate text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
        >
          На сайт
        </Link>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/admin/login" })}
          className="shrink-0 rounded-full border border-[#c4b8a8] bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-zinc-900 shadow-sm active:bg-[#f5f0e8] sm:px-4 md:hover:bg-[#f5f0e8]"
        >
          Выход
        </button>
      </div>
    </header>
  );
}

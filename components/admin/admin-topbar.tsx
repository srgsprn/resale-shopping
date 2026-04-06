"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AdminTopbar() {
  return (
    <header className="flex h-12 shrink-0 items-center justify-end gap-3 border-b border-[#d9d2c8] bg-[#faf8f5]/95 px-4 backdrop-blur md:gap-4 md:px-6">
      <Link
        href="/"
        className="text-sm font-medium text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
      >
        На сайт
      </Link>
      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/admin/login" })}
        className="rounded-full border border-[#c4b8a8] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-zinc-900 shadow-sm hover:bg-[#f5f0e8]"
      >
        Выход
      </button>
    </header>
  );
}

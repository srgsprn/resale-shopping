"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function AdminToolbar() {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return null;
  }

  const display = session.user.name?.trim() || session.user.email;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="text-zinc-600">
        <span className="font-medium text-zinc-800">{display}</span>
        {session.user.email && session.user.name?.trim() ? (
          <span className="ml-1 text-zinc-500">({session.user.email})</span>
        ) : null}{" "}
        <span className="rounded-full bg-zinc-200/80 px-2 py-0.5 text-xs text-zinc-800">{session.user.role}</span>
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-full border border-zinc-400 px-3 py-1 text-xs uppercase tracking-[0.1em] text-zinc-800 hover:bg-white"
      >
        Выйти
      </button>
      <Link href="/" className="text-xs text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline">
        На сайт
      </Link>
    </div>
  );
}

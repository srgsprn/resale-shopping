"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

const userIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6">
    <path
      d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M4 20.2c1.7-3 4.5-4.5 8-4.5s6.3 1.5 8 4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const linkClass =
  "inline-flex h-10 w-10 flex-none cursor-pointer items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-200/50 hover:text-zinc-900 active:scale-95";

export function HeaderAuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="inline-block h-10 w-10 flex-none rounded-full bg-zinc-200/70" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className={linkClass}
        aria-label="Войти в личный кабинет"
        title="Личный кабинет — войти"
      >
        {userIcon}
      </Link>
    );
  }

  return (
    <Link
      href="/wishlist"
      className={linkClass}
      aria-label="Личный кабинет"
      title="Избранное"
    >
      {userIcon}
    </Link>
  );
}

/** Кнопка выхода для страниц кабинета (шапка ведёт в избранное, не в signOut). */
export function SignOutLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "text-sm text-zinc-600 underline-offset-4 transition hover:text-zinc-900 hover:underline"
      }
    >
      Выйти из аккаунта
    </button>
  );
}

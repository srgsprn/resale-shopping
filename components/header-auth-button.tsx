"use client";

import { useSession, signIn, signOut } from "next-auth/react";

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

export function HeaderAuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="inline-block h-10 w-10 flex-none rounded-md bg-zinc-200/70" aria-hidden />;
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn("yandex", { callbackUrl: "/wishlist" })}
        className="inline-flex h-10 w-10 flex-none items-center justify-center text-zinc-700 transition hover:text-zinc-900"
        aria-label="Войти"
      >
        {userIcon}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex h-10 w-10 flex-none items-center justify-center text-zinc-700 transition hover:text-zinc-900"
      aria-label="Выйти"
      title="Выйти"
    >
      {userIcon}
    </button>
  );
}

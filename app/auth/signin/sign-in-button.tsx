"use client";

import { signIn } from "next-auth/react";

export function SignInButton() {
  const providerReady = Boolean(process.env.NEXT_PUBLIC_AUTH_YANDEX_ENABLED === "1");

  return (
    <button
      type="button"
      onClick={() => signIn("yandex", { callbackUrl: "/wishlist" })}
      disabled={!providerReady}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-900 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-[#fc3f1d] text-[10px] font-bold text-white">Я</span>
      {providerReady ? "Войти через Yandex" : "Yandex OAuth не настроен"}
    </button>
  );
}

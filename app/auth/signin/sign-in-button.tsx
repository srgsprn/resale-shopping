"use client";

import { signIn } from "next-auth/react";
import clsx from "clsx";

type Props = {
  callbackUrl?: string;
  className?: string;
  label?: string;
  /**
   * С сервера: есть ли AUTH_YANDEX_ID + AUTH_YANDEX_SECRET (не зависит от пересборки с NEXT_PUBLIC_*).
   * Если не передано — fallback на NEXT_PUBLIC_AUTH_YANDEX_ENABLED=1.
   */
  yandexReady?: boolean;
};

export function SignInButton({ callbackUrl = "/account", className, label, yandexReady }: Props) {
  const fromBuild =
    process.env.NEXT_PUBLIC_AUTH_YANDEX_ENABLED === "1" ||
    process.env.NEXT_PUBLIC_AUTH_YANDEX_ENABLED === "true";
  const providerReady = yandexReady ?? fromBuild;

  return (
    <button
      type="button"
      onClick={() => signIn("yandex", { callbackUrl })}
      disabled={!providerReady}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900 bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-[#fc3f1d] text-[10px] font-bold text-white">
        Я
      </span>
      {providerReady ? (label ?? "Войти через Yandex") : "Yandex OAuth не настроен"}
    </button>
  );
}

"use client";

import { signIn } from "next-auth/react";
import clsx from "clsx";

type Props = {
  callbackUrl?: string;
  className?: string;
  label?: string;
  /** Короткая подпись под основным текстом (только при готовом провайдере) */
  hint?: string;
  /**
   * С сервера: есть ли AUTH_YANDEX_ID + AUTH_YANDEX_SECRET (не зависит от пересборки с NEXT_PUBLIC_*).
   * Если не передано — fallback на NEXT_PUBLIC_AUTH_YANDEX_ENABLED=1.
   */
  yandexReady?: boolean;
};

export function SignInButton({
  callbackUrl = "/account",
  className,
  label,
  hint = "Один аккаунт Яндекса для входа и регистрации",
  yandexReady,
}: Props) {
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
        "flex w-full min-h-[54px] items-center gap-3 rounded-[14px] border border-zinc-800 bg-zinc-950 py-2.5 pl-2.5 pr-4 text-left",
        "shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-[background-color,box-shadow,transform] duration-200",
        "hover:-translate-y-px hover:bg-zinc-900 hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]",
        "active:translate-y-0 active:shadow-md",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
        className,
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fc3f1d] shadow-none outline-none ring-0"
        aria-hidden
      >
        <span className="select-none font-sans text-[17px] font-black leading-none tracking-tight text-white">
          Я
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug tracking-tight text-white">
          {providerReady ? (label ?? "Войти через Яндекс") : "Яндекс OAuth не настроен"}
        </span>
        {providerReady && hint ? (
          <span className="mt-0.5 block text-[12px] leading-snug text-zinc-400">{hint}</span>
        ) : null}
      </span>
    </button>
  );
}

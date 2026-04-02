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
        "flex w-full min-h-[54px] items-center gap-3 rounded-[14px] border border-[#d9cec2] bg-gradient-to-b from-white to-[#faf8f5] py-2.5 pl-2.5 pr-4 text-left",
        "shadow-[0_2px_8px_rgba(62,48,36,0.06)] transition-[border-color,box-shadow,transform] duration-200",
        "hover:-translate-y-px hover:border-[#c9a86c] hover:shadow-[0_4px_14px_rgba(62,48,36,0.1)]",
        "active:translate-y-0 active:shadow-sm",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none",
        className,
      )}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-[#fc3f1d] shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]"
        aria-hidden
      >
        <span className="select-none font-sans text-[17px] font-black leading-none tracking-tight text-white">Я</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug tracking-tight text-zinc-900">
          {providerReady ? (label ?? "Войти через Яндекс") : "Яндекс OAuth не настроен"}
        </span>
        {providerReady && hint ? (
          <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{hint}</span>
        ) : null}
      </span>
    </button>
  );
}

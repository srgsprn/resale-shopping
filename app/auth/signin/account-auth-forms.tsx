"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

import { SignInButton } from "./sign-in-button";

const inputClass =
  "mt-1 w-full rounded-md border border-[#d9d2c8] bg-[#faf8f5] px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:border-zinc-500 focus:ring-1";

const labelClass = "block text-sm font-medium text-zinc-800";

const passwordLoginBtnClass =
  "w-full rounded-md border border-[#c9b89c] bg-zinc-200/90 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 shadow-sm transition hover:enabled:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-40";

const regPrimaryBtnClass =
  "w-full rounded-md border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50";

function AccountAuthFormsBody({ yandexReady }: { yandexReady: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const canPasswordLogin = loginEmail.trim().length > 0 && loginPassword.length > 0;

  async function handlePasswordLogin() {
    setLoginError(null);
    if (!canPasswordLogin) return;
    setLoginPending(true);
    try {
      const res = await signIn("credentials", {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setLoginError("Неверный email или пароль.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoginPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Мой аккаунт</h1>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-6 shadow-sm md:p-8">
          <h2 className="border-b border-[#ebe6df] pb-3 text-lg font-semibold text-zinc-900">Авторизоваться</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="login-email" className={labelClass}>
                Имя пользователя или email <span className="text-red-600">*</span>
              </label>
              <input
                id="login-email"
                name="username"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="email@example.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="login-password" className={labelClass}>
                Пароль <span className="text-red-600">*</span>
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-zinc-700">
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 rounded border-[#d9d2c8] text-[#a16f39]"
                />
                Запомнить меня
              </label>
              <Link href="mailto:help@resale-shopping.ru" className="text-[#a16f39] underline-offset-2 hover:underline">
                Забыли пароль?
              </Link>
            </div>
            {loginError ? <p className="text-sm text-red-600">{loginError}</p> : null}
            <button
              type="button"
              disabled={!canPasswordLogin || loginPending}
              onClick={() => void handlePasswordLogin()}
              className={passwordLoginBtnClass}
            >
              {loginPending ? "Вход…" : "Войти"}
            </button>
            <SignInButton
              yandexReady={yandexReady}
              callbackUrl={callbackUrl}
              className="w-full rounded-md border-0 bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-sm hover:brightness-105"
              label="Войти через Yandex"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-6 shadow-sm md:p-8">
          <h2 className="border-b border-[#ebe6df] pb-3 text-lg font-semibold text-zinc-900">Регистрация</h2>

          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="reg-email" className={labelClass}>
                Email address <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className={inputClass}
              />
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                На ваш электронный адрес будет отправлена ссылка для установки нового пароля.
              </p>
            </div>

            <div>
              <label htmlFor="reg-phone" className={labelClass}>
                Ваш номер <span className="text-red-600">*</span>
              </label>
              <div className="mt-1 flex overflow-hidden rounded-md border border-[#d9d2c8] bg-[#faf8f5] focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-400">
                <input
                  id="reg-phone"
                  name="tel"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+7 …"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-zinc-900 outline-none"
                />
                <button
                  type="button"
                  disabled
                  title="Отправка SMS — в разработке"
                  className="shrink-0 border-l border-[#d9d2c8] bg-[#ebe6df] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500"
                >
                  Отправить код
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-600">
                На указанный номер телефона будет отправлено SMS-сообщение с кодом.
              </p>
            </div>

            <SignInButton
              yandexReady={yandexReady}
              callbackUrl={callbackUrl}
              className={regPrimaryBtnClass}
              label="Регистрация"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export function AccountAuthForms({ yandexReady }: { yandexReady: boolean }) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-sm text-zinc-500">Загрузка формы…</div>
      }
    >
      <AccountAuthFormsBody yandexReady={yandexReady} />
    </Suspense>
  );
}

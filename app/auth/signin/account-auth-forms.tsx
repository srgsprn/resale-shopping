"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

import { SignInButton } from "./sign-in-button";

const inputClass =
  "mt-1 w-full rounded-md border border-[#d9d2c8] bg-[#faf8f5] px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:border-zinc-500 focus:ring-1";

const labelClass = "block text-sm font-medium text-zinc-800";

const grayDisabledBtnClass =
  "w-full cursor-not-allowed rounded-md border border-[#e5ddd4] bg-zinc-100 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400";

const passwordLoginBtnClass =
  "w-full rounded-md border border-[#c9b89c] bg-zinc-200/90 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 shadow-sm transition hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-45";

function AccountAuthFormsBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPending, setLoginPending] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [regEmail, setRegEmail] = useState("");
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");
  const [regPending, setRegPending] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  const canPasswordLogin = loginEmail.trim().length > 0 && loginPassword.length > 0;
  const canRegister =
    regEmail.trim().length > 0 &&
    regPassword.length >= 8 &&
    regPassword === regPassword2;

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

  async function handleRegister() {
    setRegError(null);
    if (regPassword !== regPassword2) {
      setRegError("Пароли не совпадают.");
      return;
    }
    if (regPassword.length < 8) {
      setRegError("Пароль не короче 8 символов.");
      return;
    }
    setRegPending(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          name: regName.trim() || undefined,
        }),
      });
      const data = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) {
        setRegError(data.error ?? "Не удалось зарегистрироваться.");
        return;
      }
      const res = await signIn("credentials", {
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        setRegError("Аккаунт создан. Войдите с паролем слева.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setRegPending(false);
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
                type="email"
                autoComplete="username"
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
              className={canPasswordLogin && !loginPending ? passwordLoginBtnClass : grayDisabledBtnClass}
            >
              {loginPending ? "Вход…" : "Войти"}
            </button>
            <SignInButton
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
                Email <span className="text-red-600">*</span>
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
            </div>
            <div>
              <label htmlFor="reg-name" className={labelClass}>
                Имя
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                autoComplete="name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="reg-password" className={labelClass}>
                Пароль <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-zinc-500">Не короче 8 символов.</p>
            </div>
            <div>
              <label htmlFor="reg-password2" className={labelClass}>
                Повтор пароля <span className="text-red-600">*</span>
              </label>
              <input
                id="reg-password2"
                name="new-password-confirm"
                type="password"
                autoComplete="new-password"
                value={regPassword2}
                onChange={(e) => setRegPassword2(e.target.value)}
                className={inputClass}
              />
            </div>
            <p className="text-xs leading-relaxed text-zinc-600">
              Аккаунт с паролем хранится на сайте. Вход через Yandex — отдельный способ; можно пользоваться любым.
            </p>
            <div>
              <label htmlFor="reg-phone" className={labelClass}>
                Ваш номер
              </label>
              <input
                id="reg-phone"
                name="tel"
                type="tel"
                autoComplete="tel"
                placeholder="+7 …"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-[11px] text-zinc-500">Для SMS — позже.</p>
            </div>
            <button type="button" disabled className={grayDisabledBtnClass} title="Скоро">
              Отправить код
            </button>
            {regError ? <p className="text-sm text-red-600">{regError}</p> : null}
            <button
              type="button"
              disabled={!canRegister || regPending}
              onClick={() => void handleRegister()}
              className={canRegister && !regPending ? passwordLoginBtnClass : grayDisabledBtnClass}
            >
              {regPending ? "Создание…" : "Создать аккаунт"}
            </button>
            <SignInButton
              callbackUrl={callbackUrl}
              className="w-full rounded-md border border-[#d39b52] bg-gradient-to-r from-[#f4c56f] to-[#d89b4f] py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-sm hover:brightness-105"
              label="Регистрация через Yandex"
            />
            <p className="text-center text-[11px] text-zinc-500">
              Первый вход через Yandex создаёт сессию без пароля на сайте.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AccountAuthForms() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl py-12 text-center text-sm text-zinc-500">Загрузка формы…</div>
      }
    >
      <AccountAuthFormsBody />
    </Suspense>
  );
}

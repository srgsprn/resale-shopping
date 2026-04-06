"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        login: login.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Неверный логин или пароль.");
        setLoading(false);
        return;
      }
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/admin");
      router.refresh();
    } catch {
      setError("Не удалось войти. Попробуйте ещё раз.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-[24px] border border-[#d9d2c8] bg-white p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-zinc-900">Кабинет большого начальства</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="admin-login" className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-zinc-600">
            Логин
          </label>
          <input
            id="admin-login"
            name="login"
            type="text"
            autoComplete="username"
            required
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full rounded-xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-zinc-600">
            Пароль
          </label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-[#d9d2c8] bg-white px-4 py-3 text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
          />
        </div>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border-2 border-[#6b5344] bg-[#e8dcc8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-sm hover:bg-[#dfc9ae] disabled:opacity-50"
        >
          {loading ? "Вход…" : "Войти"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-zinc-500">
        <Link href="/" className="underline-offset-2 hover:text-zinc-800 hover:underline">
          На сайт
        </Link>
      </p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-md p-8 text-center text-sm text-zinc-600">Загрузка…</div>}
    >
      <AdminLoginForm />
    </Suspense>
  );
}

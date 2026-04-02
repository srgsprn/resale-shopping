import Link from "next/link";

import { auth } from "@/auth";

import { AccountAuthForms } from "./account-auth-forms";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await auth();

  if (session?.user) {
    return (
      <section className="mx-auto max-w-lg space-y-4 rounded-[28px] border border-[#d9d2c8] bg-white p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Вы уже авторизованы</h1>
        <p className="text-zinc-600">Перейдите в избранное, чтобы управлять сохраненными лотами.</p>
        <Link
          href="/wishlist"
          className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
        >
          Открыть избранное
        </Link>
      </section>
    );
  }

  return (
    <section className="px-0 py-2 md:py-4">
      <AccountAuthForms />
    </section>
  );
}

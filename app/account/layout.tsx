import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AccountSidebar } from "@/components/account-sidebar";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <div className="pb-10 pt-4 md:pt-6">
      <h1 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">Мой аккаунт</h1>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:items-start">
        <AccountSidebar user={user} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

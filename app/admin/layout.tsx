import Link from "next/link";

import { AdminToolbar } from "@/components/admin-toolbar";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-[70vh] bg-[#f6f3ef]">
      <header className="border-b border-[#d9d2c8] bg-[#f1ece5]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-800">
            <Link href="/admin" className="hover:text-zinc-950">
              Админка
            </Link>
            <Link href="/admin/products" className="text-zinc-600 hover:text-zinc-950">
              Товары
            </Link>
            <Link href="/admin/categories" className="text-zinc-600 hover:text-zinc-950">
              Категории
            </Link>
            <Link href="/admin/orders" className="text-zinc-600 hover:text-zinc-950">
              Заказы
            </Link>
          </nav>
          <AdminToolbar />
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}

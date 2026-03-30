import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Админка</h1>
      <div className="grid gap-3 md:grid-cols-3">
        <Link href="/admin/products" className="rounded-2xl border border-zinc-200 bg-white p-5">Товары</Link>
        <Link href="/admin/categories" className="rounded-2xl border border-zinc-200 bg-white p-5">Категории</Link>
        <Link href="/admin/orders" className="rounded-2xl border border-zinc-200 bg-white p-5">Заказы</Link>
      </div>
    </section>
  );
}

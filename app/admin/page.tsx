export const dynamic = "force-dynamic";

import Link from "next/link";

import { formatMoney } from "@/lib/money";
import { formatPaymentStatusRu } from "@/lib/payment-status";
import { prisma } from "@/lib/prisma";

import { DataTable } from "@/components/admin/data-table";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, pendingOrders, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: "PENDING",
        paymentStatus: "REQUIRES_PAYMENT",
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { customer: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Обзор</h1>
        <p className="mt-1 text-sm text-zinc-600">Статистика и последние заказы</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[#d9d2c8] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Товаров</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">{productCount}</p>
          <Link href="/admin/products" className="mt-3 inline-block text-xs font-medium text-zinc-700 underline-offset-4 hover:underline">
            Открыть каталог →
          </Link>
        </div>
        <div className="rounded-[24px] border border-[#d9d2c8] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Заказов</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">{orderCount}</p>
          <Link href="/admin/orders" className="mt-3 inline-block text-xs font-medium text-zinc-700 underline-offset-4 hover:underline">
            Все заказы →
          </Link>
        </div>
        <div className="rounded-[24px] border border-[#d9d2c8] bg-white p-5 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">Новые (ожидают оплату)</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-amber-900">{pendingOrders}</p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          href="/admin/products/add"
          className="inline-flex items-center justify-center rounded-full border-2 border-[#6b5344] bg-[#e8dcc8] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 shadow-sm hover:bg-[#dfc9ae]"
        >
          Новый товар
        </Link>
        <Link
          href="/admin/orders"
          className="inline-flex items-center justify-center rounded-full border border-[#c4b8a8] bg-white px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 shadow-sm hover:bg-[#faf8f5]"
        >
          Заказы
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">Последние заказы</h2>
        <DataTable>
          <thead>
            <tr className="border-b border-[#ebe6df] text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">Номер</th>
              <th className="px-4 py-3 font-medium">Клиент</th>
              <th className="px-4 py-3 font-medium">Сумма</th>
              <th className="px-4 py-3 font-medium">Оплата</th>
              <th className="px-4 py-3 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-[#f4f1ec] last:border-0">
                <td className="px-4 py-3 font-medium text-zinc-900">{o.orderNumber}</td>
                <td className="px-4 py-3 text-zinc-700">{o.customer.fullName}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-800">{formatMoney(o.totalMinor, o.currency)}</td>
                <td className="px-4 py-3 text-zinc-700">{formatPaymentStatusRu(o.paymentStatus)}</td>
                <td className="px-4 py-3 text-zinc-500">
                  {o.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        {recentOrders.length === 0 ? <p className="text-sm text-zinc-500">Заказов пока нет.</p> : null}
      </section>
    </div>
  );
}

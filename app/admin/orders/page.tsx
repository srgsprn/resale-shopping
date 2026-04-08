export const dynamic = "force-dynamic";

import Link from "next/link";

import { formatMoney } from "@/lib/money";
import { formatPaymentStatusRu } from "@/lib/payment-status";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, items: true },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Заказы</h1>
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="py-2">Номер</th>
              <th>Дата</th>
              <th>Клиент</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-zinc-100">
                <td className="py-2">
                  <Link href={`/admin/orders/${encodeURIComponent(o.orderNumber)}`} className="font-medium text-zinc-900 underline-offset-2 hover:underline">
                    {o.orderNumber}
                  </Link>
                </td>
                <td>{o.createdAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>{o.customer.fullName}</td>
                <td>{formatMoney(o.totalMinor, o.currency)}</td>
                <td>{formatPaymentStatusRu(o.paymentStatus)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";

import { formatMoney } from "@/lib/money";
import { formatPaymentStatusRu } from "@/lib/payment-status";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ orderNumber: string }> };

type SnapshotContact = {
  phone?: string;
  address?: string;
  messengerType?: string;
  messengerHandle?: string;
  telegram?: string;
  max?: string;
};

function readSnapshotContact(snapshot: unknown): SnapshotContact {
  if (!snapshot || typeof snapshot !== "object") return {};
  const s = snapshot as { contact?: SnapshotContact };
  if (!s.contact || typeof s.contact !== "object") return {};
  return s.contact;
}

export default async function AdminOrderPage({ params }: Props) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: true,
    },
  });

  if (!order) notFound();

  const contact = readSnapshotContact(order.orderSnapshot);
  const telegram = order.telegram || contact.telegram || (contact.messengerType === "telegram" ? contact.messengerHandle : undefined);
  const max = contact.max || (contact.messengerType === "max" ? contact.messengerHandle : undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Заказ {order.orderNumber}</h1>
        <Link href="/admin/orders" className="text-sm text-zinc-700 underline-offset-2 hover:underline">
          ← К списку
        </Link>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Данные заказа</h2>
        <div className="mt-3 grid gap-2 text-sm text-zinc-800 md:grid-cols-2">
          <p><span className="text-zinc-500">Дата:</span> {order.createdAt.toLocaleString("ru-RU")}</p>
          <p><span className="text-zinc-500">Оплата:</span> {formatPaymentStatusRu(order.paymentStatus)}</p>
          <p><span className="text-zinc-500">Статус:</span> {order.status}</p>
          <p><span className="text-zinc-500">Сумма:</span> {formatMoney(order.totalMinor, order.currency)}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Контакты клиента</h2>
        <div className="mt-3 grid gap-2 text-sm text-zinc-800 md:grid-cols-2">
          <p><span className="text-zinc-500">Имя:</span> {order.customer.fullName}</p>
          <p><span className="text-zinc-500">Email:</span> {order.customer.email}</p>
          <p><span className="text-zinc-500">Телефон:</span> {contact.phone || order.customer.phone || "—"}</p>
          <p><span className="text-zinc-500">Адрес:</span> {contact.address || "—"}</p>
          <p><span className="text-zinc-500">Telegram:</span> {telegram || "—"}</p>
          <p><span className="text-zinc-500">MAX:</span> {max || "—"}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-700">Товары</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500">
                <th className="py-2">Товар</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Итог</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id} className="border-b border-zinc-100 last:border-0">
                  <td className="py-2">{[i.productBrand, i.productTitle].filter(Boolean).join(" ")}</td>
                  <td>{i.quantity}</td>
                  <td>{formatMoney(i.unitPriceMinor, order.currency)}</td>
                  <td>{formatMoney(i.totalPriceMinor, order.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

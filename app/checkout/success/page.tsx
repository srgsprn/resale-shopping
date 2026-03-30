export const dynamic = "force-dynamic";

import Link from "next/link";

import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;

  const order = params.session_id
    ? await prisma.order.findUnique({
        where: { stripeCheckoutSessionId: params.session_id },
        include: { items: true },
      })
    : null;

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-2xl font-semibold">Заказ оформлен</h1>
      {order ? (
        <>
          <p>Номер заказа: <strong>{order.orderNumber}</strong></p>
          <p>Статус оплаты: <strong>{order.paymentStatus}</strong></p>
          <p>Сумма: <strong>{formatMoney(order.totalMinor, order.currency)}</strong></p>
        </>
      ) : (
        <p>Платеж обрабатывается. Статус появится после подтверждения webhook.</p>
      )}
      <Link href="/catalog" className="inline-block rounded-full bg-zinc-900 px-5 py-2 text-sm text-white">Вернуться в каталог</Link>
    </section>
  );
}

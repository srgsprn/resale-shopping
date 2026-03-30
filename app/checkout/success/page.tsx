export const dynamic = "force-dynamic";

import Link from "next/link";

import { ClearCartOnSuccess } from "@/components/clear-cart-on-success";
import { formatMoney } from "@/lib/money";
import { getOrderByNumber } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

type Props = {
  searchParams: Promise<{ session_id?: string; order?: string; manual?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const params = await searchParams;

  const order =
    params.order != null && params.order !== ""
      ? await getOrderByNumber(params.order)
      : params.session_id
        ? await prisma.order.findUnique({
            where: { stripeCheckoutSessionId: params.session_id },
            include: { items: true },
          })
        : null;

  const shouldClear = Boolean(params.session_id || params.manual === "1");

  return (
    <section className="mx-auto max-w-2xl space-y-4 rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-8">
      <ClearCartOnSuccess shouldClear={shouldClear} />
      <h1 className="text-2xl font-semibold tracking-tight">Заказ оформлен</h1>
      {order ? (
        <>
          <p>
            Номер заказа: <strong>{order.orderNumber}</strong>
          </p>
          <p>
            Статус оплаты: <strong>{order.paymentStatus}</strong>
          </p>
          <p>
            Сумма: <strong>{formatMoney(order.totalMinor, order.currency)}</strong>
          </p>
          {params.manual === "1" ? (
            <p className="text-sm text-zinc-600">
              Онлайн-оплата на сайте пока не подключена — менеджер свяжется с вами по почте или телефону для подтверждения и оплаты.
            </p>
          ) : null}
        </>
      ) : params.session_id ? (
        <p className="text-sm text-zinc-600">
          Платёж принят. Если номер заказа не отобразился сразу, откройте историю почты — данные придут после обработки webhook.
        </p>
      ) : (
        <p className="text-sm text-zinc-600">Спасибо за покупку.</p>
      )}
      <Link
        href="/catalog"
        className="inline-block rounded-full border border-zinc-800 bg-[#b8a99a] px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900"
      >
        Вернуться в каталог
      </Link>
    </section>
  );
}

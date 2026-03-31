import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const internalOrderId = session.metadata?.internalOrderId;

    if (!internalOrderId) {
      console.warn("Stripe webhook: session без internalOrderId (устаревший поток?)", session.id);
      return NextResponse.json({ received: true });
    }

    const before = await prisma.order.findUnique({
      where: { id: internalOrderId },
      include: { items: true, customer: true },
    });

    if (!before) {
      console.warn("Stripe webhook: заказ не найден", internalOrderId);
      return NextResponse.json({ received: true });
    }

    if (before.paymentStatus === "PAID") {
      return NextResponse.json({ received: true });
    }

    await prisma.order.update({
      where: { id: internalOrderId },
      data: {
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
        status: "PAID",
        paymentStatus: "PAID",
        paidAt: new Date(),
        subtotalMinor: session.amount_subtotal ?? before.subtotalMinor,
        totalMinor: session.amount_total ?? before.totalMinor,
        currency: (session.currency || before.currency.toLowerCase()).toUpperCase(),
      },
    });

    const updated = await prisma.order.findUnique({
      where: { id: internalOrderId },
      include: { items: true, customer: true },
    });

    if (updated?.customer.email && !updated.customer.email.endsWith("@example.com")) {
      const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const summary = updated.items.map((i) => `${i.productBrand || ""} ${i.productTitle}`.trim()).join(", ");

      try {
        await sendOrderConfirmationEmail({
          name: updated.customer.fullName,
          email: updated.customer.email,
          orderNumber: updated.orderNumber,
          summary,
          totalMinor: updated.totalMinor,
          orderLink: `${site}/api/orders/${updated.orderNumber}`,
        });
      } catch (err) {
        console.error("Stripe webhook email failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}

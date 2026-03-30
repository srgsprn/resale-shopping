import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { buildOrderNumber } from "@/lib/orders";
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

    const existing = await prisma.order.findUnique({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (!existing) {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
      const productIds = lineItems.data
        .map((item) => item.price?.product)
        .filter(Boolean) as string[];

      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      });

      const customer = await prisma.customer.upsert({
        where: { email: session.customer_details?.email || `unknown-${session.id}@example.com` },
        update: {
          fullName: session.customer_details?.name || "Покупатель",
          phone: session.customer_details?.phone || null,
        },
        create: {
          email: session.customer_details?.email || `unknown-${session.id}@example.com`,
          fullName: session.customer_details?.name || "Покупатель",
          phone: session.customer_details?.phone || null,
        },
      });

      const created = await prisma.order.create({
        data: {
          orderNumber: buildOrderNumber(crypto.randomUUID()),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
          status: "PAID",
          paymentStatus: "PAID",
          customerId: customer.id,
          subtotalMinor: session.amount_subtotal || 0,
          totalMinor: session.amount_total || 0,
          currency: (session.currency || "rub").toUpperCase(),
          paidAt: new Date(),
          orderSnapshot: {
            sessionId: session.id,
            customerEmail: session.customer_details?.email,
          },
          items: {
            create: lineItems.data.map((line) => {
              const product = products.find((p) => p.id === line.price?.product);
              return {
                productId: product?.id || products[0].id,
                quantity: line.quantity || 1,
                unitPriceMinor: line.price?.unit_amount || 0,
                totalPriceMinor: line.amount_total,
                productTitle: product?.name || line.description || "Item",
                productBrand: product?.brand || null,
                productSlug: product?.slug || "unknown",
                productImageUrl: product?.images[0]?.url || null,
              };
            }),
          },
        },
        include: { items: true },
      });

      if (customer.email && !customer.email.endsWith("@example.com")) {
        const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const summary = created.items.map((i) => `${i.productBrand || ""} ${i.productTitle}`.trim()).join(", ");

        await sendOrderConfirmationEmail({
          name: customer.fullName,
          email: customer.email,
          orderNumber: created.orderNumber,
          summary,
          totalMinor: created.totalMinor,
          orderLink: `${site}/api/orders/${created.orderNumber}`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}

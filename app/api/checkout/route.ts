import { NextResponse } from "next/server";
import { z } from "zod";

import { createPendingOrderFromCheckout } from "@/lib/orders";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getStripeOptional } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(3),
      }),
    )
    .min(1),
  customer: z.object({
    email: z.string().email(),
    fullName: z.string().min(2),
    phone: z.string().max(40).optional().nullable(),
    address: z.string().max(500).optional().nullable(),
    messengerType: z.enum(["telegram", "max"]).optional().nullable(),
    messengerHandle: z.string().max(80).optional().nullable(),
    note: z.string().max(2000).optional().nullable(),
  }),
});

function sendOrderEmailInBackground(
  payload: Parameters<typeof sendOrderConfirmationEmail>[0],
  kind?: Parameters<typeof sendOrderConfirmationEmail>[1],
) {
  void sendOrderConfirmationEmail(payload, kind).catch((err) => {
    console.error("Checkout email background send failed:", err);
  });
}

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const requestedProductIds = body.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: requestedProductIds }, status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });
    const productById = new Map(products.map((product) => [product.id, product]));
    const unavailable = body.items.filter((item) => !productById.has(item.productId));
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: "Некоторые товары больше недоступны. Обновите корзину и попробуйте снова.",
        },
        { status: 409 },
      );
    }

    const order = await createPendingOrderFromCheckout(body.items, body.customer);

    const lineItems = body.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new Error("Продукт недоступен для оплаты");
      }
      return {
        quantity: item.quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceMinor,
          product_data: {
            name: `${product.brand} ${product.name}`,
            images: product.images[0]?.url ? [product.images[0].url] : undefined,
            metadata: {
              productId: product.id,
              slug: product.slug,
            },
          },
        },
      };
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const stripe = getStripeOptional();

    if (!stripe) {
      const full = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true, customer: true },
      });
      if (full?.customer.email && !full.customer.email.endsWith("@example.com")) {
        const summary = full.items.map((i) => `${i.productBrand || ""} ${i.productTitle}`.trim()).join(", ");
        sendOrderEmailInBackground({
          name: full.customer.fullName,
          email: full.customer.email,
          orderNumber: full.orderNumber,
          summary,
          totalMinor: full.totalMinor,
          orderLink: `${origin}/checkout/success?order=${encodeURIComponent(full.orderNumber)}`,
        });
      }
      return NextResponse.json({
        url: `${origin}/checkout/success?order=${encodeURIComponent(order.orderNumber)}&manual=1`,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: body.customer.email,
      client_reference_id: order.id,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: {
        internalOrderId: order.id,
        source: "resale-shopping",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeCheckoutSessionId: session.id },
    });

    const fullStripe = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true, customer: true },
    });
    if (fullStripe?.customer.email && !fullStripe.customer.email.endsWith("@example.com")) {
      const summary = fullStripe.items.map((i) => `${i.productBrand || ""} ${i.productTitle}`.trim()).join(", ");
      const payUrl = typeof session.url === "string" && session.url.length > 0 ? session.url : undefined;
      if (!payUrl) {
        console.warn(
          "checkout: у Stripe Session нет session.url — письмо уйдёт без прямой ссылки на оплату, session.id=",
          session.id,
        );
      }
      sendOrderEmailInBackground(
        {
          name: fullStripe.customer.fullName,
          email: fullStripe.customer.email,
          orderNumber: fullStripe.orderNumber,
          summary,
          totalMinor: fullStripe.totalMinor,
          orderLink: `${origin}/checkout/success?order=${encodeURIComponent(fullStripe.orderNumber)}`,
          checkoutUrl: payUrl,
        },
        "pending_stripe",
      );
    }

    const redirectUrl =
      typeof session.url === "string" && session.url.length > 0
        ? session.url
        : `${origin}/checkout/success?session_id=${encodeURIComponent(session.id)}`;
    return NextResponse.json({ url: redirectUrl });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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
    note: z.string().max(2000).optional().nullable(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());

    const order = await createPendingOrderFromCheckout(body.items, body.customer);

    const products = await prisma.product.findMany({
      where: { id: { in: body.items.map((i) => i.productId) }, status: "ACTIVE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    const lineItems = body.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
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
        try {
          await sendOrderConfirmationEmail({
            name: full.customer.fullName,
            email: full.customer.email,
            orderNumber: full.orderNumber,
            summary,
            totalMinor: full.totalMinor,
            orderLink: `${origin}/api/orders/${full.orderNumber}`,
          });
        } catch {
          // письмо не критично
        }
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

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

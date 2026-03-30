import { NextResponse } from "next/server";
import { z } from "zod";

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1).max(3),
    }),
  ).min(1),
});

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = bodySchema.parse(await request.json());
  const ids = body.items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const lineItems = body.items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) {
      throw new Error("Product not available");
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

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_creation: "always",
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    metadata: {
      source: "resale-shopping",
    },
  });

  return NextResponse.json({ url: session.url });
}

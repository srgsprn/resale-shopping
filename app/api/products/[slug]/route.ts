import { NextResponse } from "next/server";

import { decodeHtmlEntities } from "@/lib/html-entities";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const decoded = decodeURIComponent(slug);

  const product = await prisma.product.findFirst({
    where: { slug: decoded, status: "ACTIVE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (!product) {
    return NextResponse.json({ error: "Товар не найден" }, { status: 404 });
  }

  return NextResponse.json({
    id: product.id,
    slug: product.slug,
    brand: decodeHtmlEntities(product.brand),
    name: decodeHtmlEntities(product.name),
    priceMinor: product.priceMinor,
    currency: product.currency,
    imageUrl: product.images[0]?.url ?? "",
  });
}

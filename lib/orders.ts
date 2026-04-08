import { prisma } from "@/lib/prisma";

export function buildOrderNumber(id: string) {
  const short = id.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const suffix = short.length >= 4 ? short : `X${short.padEnd(4, "0")}`;
  return `RS-${new Date().getFullYear()}-${suffix}`;
}

export type CheckoutCartLine = { productId: string; quantity: number };

export type CheckoutCustomer = {
  email: string;
  fullName: string;
  phone?: string | null;
  address?: string | null;
  messengerType?: "telegram" | "max" | null;
  messengerHandle?: string | null;
  note?: string | null;
};

export async function createPendingOrderFromCheckout(items: CheckoutCartLine[], customer: CheckoutCustomer) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: "ACTIVE" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  if (products.length !== ids.length) {
    throw new Error("Некоторые товары недоступны или сняты с продажи");
  }

  const email = customer.email.trim().toLowerCase();
  const cust = await prisma.customer.upsert({
    where: { email },
    update: {
      fullName: customer.fullName.trim(),
      phone: customer.phone?.trim() || null,
    },
    create: {
      email,
      fullName: customer.fullName.trim(),
      phone: customer.phone?.trim() || null,
    },
  });

  let subtotal = 0;
  const currencies = new Set<string>();
  const creates = items.map((item) => {
    const p = products.find((x) => x.id === item.productId)!;
    currencies.add(p.currency);
    const lineTotal = p.priceMinor * item.quantity;
    subtotal += lineTotal;
    return {
      productId: p.id,
      quantity: item.quantity,
      unitPriceMinor: p.priceMinor,
      totalPriceMinor: lineTotal,
      productTitle: p.name,
      productBrand: p.brand,
      productSlug: p.slug,
      productImageUrl: p.images[0]?.url ?? null,
    };
  });

  if (currencies.size > 1) {
    throw new Error("В одном заказе допустима только одна валюта");
  }

  const currency = products[0]?.currency ?? "RUB";
  const orderNumber = buildOrderNumber(crypto.randomUUID());

  const phone = customer.phone?.trim() || null;
  const address = customer.address?.trim() || null;
  const messengerType = customer.messengerType === "max" ? "max" : customer.messengerType === "telegram" ? "telegram" : null;
  const messengerHandle = customer.messengerHandle?.trim() || null;
  const rawNote = customer.note?.trim() || "";
  const contactLines: string[] = [];
  if (address) contactLines.push(`Адрес: ${address}`);
  if (phone) contactLines.push(`Телефон: ${phone}`);
  if (messengerType && messengerHandle) {
    contactLines.push(`${messengerType === "telegram" ? "Telegram" : "MAX"}: ${messengerHandle}`);
  }
  const customerNote = [rawNote, ...contactLines].filter(Boolean).join("\n").trim() || null;

  return prisma.order.create({
    data: {
      orderNumber,
      customerId: cust.id,
      status: "PENDING",
      paymentStatus: "REQUIRES_PAYMENT",
      subtotalMinor: subtotal,
      totalMinor: subtotal,
      currency,
      customerNote,
      telegram: messengerType === "telegram" ? messengerHandle : null,
      source: messengerType,
      orderSnapshot: {
        source: "checkout-form",
        contact: {
          phone,
          address,
          messengerType,
          messengerHandle,
          telegram: messengerType === "telegram" ? messengerHandle : null,
          max: messengerType === "max" ? messengerHandle : null,
        },
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
      items: { create: creates },
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      customer: true,
    },
  });
}

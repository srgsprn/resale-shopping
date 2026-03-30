import { prisma } from "@/lib/prisma";

export function buildOrderNumber(id: string) {
  const short = id.slice(-6).toUpperCase();
  return `RS-${new Date().getFullYear()}-${short}`;
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

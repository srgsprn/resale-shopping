import { NextResponse } from "next/server";

import { getOrderByNumber } from "@/lib/orders";

type Params = {
  params: Promise<{ orderNumber: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { orderNumber } = await params;
  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

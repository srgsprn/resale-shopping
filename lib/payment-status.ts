import type { PaymentStatus } from "@prisma/client";

const LABELS: Record<PaymentStatus, string> = {
  REQUIRES_PAYMENT: "Не оплачен",
  PAID: "Оплачен",
  FAILED: "Ошибка оплаты",
  REFUNDED: "Возврат средств",
};

/** Человекочитаемый статус оплаты для UI (вместо enum из Prisma). */
export function formatPaymentStatusRu(status: PaymentStatus | string): string {
  if (status in LABELS) return LABELS[status as PaymentStatus];
  return typeof status === "string" ? status : String(status);
}

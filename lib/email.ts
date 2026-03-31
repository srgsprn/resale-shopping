import nodemailer from "nodemailer";
import { Resend } from "resend";

import { formatMoney } from "@/lib/money";

export type OrderEmailPayload = {
  name: string;
  email: string;
  orderNumber: string;
  summary: string;
  totalMinor: number;
  orderLink: string;
};

type TemplateKey = "luxury" | "neutral" | "premium-resale";

export const ORDER_EMAIL_TEMPLATES: Record<TemplateKey, { subject: string; body: (p: OrderEmailPayload) => string }> = {
  luxury: {
    subject: "Your order has been placed",
    body: (p) => `Здравствуйте, ${p.name}!\n\nВаш заказ принят и уже передан в работу.\n\nНомер заказа: ${p.orderNumber}\nСостав заказа: ${p.summary}\nСумма: ${formatMoney(p.totalMinor)}\nСсылка на заказ: ${p.orderLink}\n\nВ ближайшее время персональный менеджер свяжется с вами, чтобы деликатно уточнить детали и подтвердить доставку.\n\nБлагодарим за выбор resale-shopping.ru.\nС уважением,\nКоманда resale-shopping.ru`,
  },
  neutral: {
    subject: "Order confirmed",
    body: (p) => `Здравствуйте, ${p.name}!\n\nВаш заказ оформлен и подтвержден.\n\nНомер заказа: ${p.orderNumber}\nСостав заказа: ${p.summary}\nСумма: ${formatMoney(p.totalMinor)}\nСсылка на заказ: ${p.orderLink}\n\nСкоро с вами свяжется менеджер для уточнения деталей и подтверждения доставки.\n\nСпасибо за покупку.\nС уважением,\nresale-shopping.ru`,
  },
  "premium-resale": {
    subject: "Ваш заказ оформлен",
    body: (p) => `Здравствуйте, ${p.name}!\n\nВаш заказ успешно оформлен и принят в обработку.\n\nНомер заказа: ${p.orderNumber}\nСостав заказа: ${p.summary}\nСумма: ${formatMoney(p.totalMinor)}\nСсылка на заказ: ${p.orderLink}\n\nСкоро с вами свяжется менеджер, чтобы уточнить детали и подтвердить удобный формат доставки.\n\nСпасибо, что выбираете осознанный premium resale шопинг с resale-shopping.ru.\nС теплом,\nКоманда resale-shopping.ru`,
  },
};

const DEFAULT_TEMPLATE: TemplateKey = "premium-resale";

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  const from = process.env.ORDER_FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const template = ORDER_EMAIL_TEMPLATES[DEFAULT_TEMPLATE];
  const text = template.body(payload);

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to: payload.email,
      subject: template.subject,
      text,
    });
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from,
      to: payload.email,
      subject: template.subject,
      text,
    });
    return;
  }

  throw new Error("Email provider is not configured");
}

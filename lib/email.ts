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
  /** Ссылка Stripe Checkout — только для письма «ожидается оплата». */
  checkoutUrl?: string;
};

export type OrderEmailKind = "confirmed" | "pending_stripe";

function resolveOrderEmailFrom(): string {
  const raw = process.env.ORDER_FROM_EMAIL?.trim();
  if (raw) {
    if (raw.includes("<") && raw.includes(">")) return raw;
    return `Resale Shopping <${raw}>`;
  }
  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser?.includes("@")) {
    return `Resale Shopping <${smtpUser}>`;
  }
  if (process.env.RESEND_API_KEY) {
    console.warn(
      "[email] ORDER_FROM_EMAIL не задан: для Resend укажите отправителя в формате «Имя <email@проверенный-домен>». Иначе письма могут не доставляться.",
    );
    return "Resale Shopping <onboarding@resend.dev>";
  }
  return "Resale Shopping <orders@resale-shopping.ru>";
}

function buildEmailContent(payload: OrderEmailPayload, kind: OrderEmailKind): { subject: string; text: string } {
  const template = ORDER_EMAIL_TEMPLATES[DEFAULT_TEMPLATE];

  if (kind === "pending_stripe") {
    const url = payload.checkoutUrl;
    if (!url) {
      throw new Error("pending_stripe email requires checkoutUrl");
    }
    return {
      subject: `Заказ ${payload.orderNumber}: ожидается оплата`,
      text: `Здравствуйте, ${payload.name}!

Мы получили ваш заказ № ${payload.orderNumber}.

Состав: ${payload.summary}
Сумма: ${formatMoney(payload.totalMinor)}

Чтобы завершить оформление, перейдите к оплате по ссылке:
${url}

После успешной оплаты вы получите подтверждение на эту почту.

С уважением,
Команда resale-shopping.ru`,
    };
  }

  return {
    subject: template.subject,
    text: template.body(payload),
  };
}

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

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
  kind: OrderEmailKind = "confirmed",
) {
  const from = resolveOrderEmailFrom();
  const { subject, text } = buildEmailContent(payload, kind);

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from,
      to: payload.email,
      subject,
      text,
    });
    if (error) {
      console.error("[email] Resend API error:", error);
      throw new Error(typeof error === "object" && error && "message" in error ? String(error.message) : "Resend send failed");
    }
    if (!data) {
      console.warn("[email] Resend returned no data id");
    }
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
      subject,
      text,
    });
    return;
  }

  throw new Error("Почта не настроена: задайте RESEND_API_KEY или SMTP_HOST / SMTP_USER / SMTP_PASS в .env");
}

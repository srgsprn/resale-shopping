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

/** Оборачивает голый email в «Имя <email>», если нет угловых скобок. */
function formatFromHeader(raw: string): string {
  const s = raw.trim();
  if (s.includes("<") && s.includes(">")) return s;
  if (s.includes("@")) return `Resale Shopping <${s}>`;
  return s;
}

function resolveSmtpFrom(): string {
  const raw = process.env.ORDER_FROM_EMAIL?.trim();
  if (raw) return formatFromHeader(raw);
  const smtpUser = process.env.SMTP_USER?.trim();
  if (smtpUser?.includes("@")) return formatFromHeader(smtpUser);
  return formatFromHeader("orders@resale-shopping.ru");
}

/**
 * Цепочка From для Resend: сначала проверенный домен, затем запасной onboarding@resend.dev
 * (ограничения тарифа Resend — см. панель).
 */
function resendFromCandidates(): string[] {
  const list: string[] = [];
  const push = (v?: string | null) => {
    if (!v?.trim()) return;
    const formatted = formatFromHeader(v.trim());
    if (!list.includes(formatted)) list.push(formatted);
  };
  push(process.env.RESEND_FROM);
  push(process.env.ORDER_FROM_EMAIL);
  push("onboarding@resend.dev");
  return list;
}

function resolveReplyTo(): string | undefined {
  const r = process.env.ORDER_REPLY_TO_EMAIL?.trim();
  if (r) return r;
  return undefined;
}

function plainTextToHtml(text: string): string {
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.55;color:#1a1a1a">${esc.replace(/\n/g, "<br>\n")}</body></html>`;
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

function resendErrorMessage(error: unknown): string {
  if (error == null) return "unknown";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function sendViaResend(payload: OrderEmailPayload, subject: string, text: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY пустой");

  const resend = new Resend(key);
  const html = plainTextToHtml(text);
  const replyTo = resolveReplyTo();
  const candidates = resendFromCandidates();
  let lastError: unknown;

  for (const from of candidates) {
    const { data, error } = await resend.emails.send({
      from,
      to: [payload.email],
      subject,
      text,
      html,
      ...(replyTo ? { replyTo: [replyTo] } : {}),
    });

    if (!error && data?.id) {
      console.info("[email] Resend OK id=%s from=%s to=%s", data.id, from, payload.email);
      return;
    }

    lastError = error;
    console.warn("[email] Resend отказ from=%s to=%s: %s", from, payload.email, resendErrorMessage(error));
  }

  throw new Error(`Resend: не удалось отправить ни с одного адреса отправителя. Последняя ошибка: ${resendErrorMessage(lastError)}`);
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
  kind: OrderEmailKind = "confirmed",
) {
  const { subject, text } = buildEmailContent(payload, kind);
  const replyTo = resolveReplyTo();

  if (process.env.RESEND_API_KEY) {
    await sendViaResend(payload, subject, text);
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const from = resolveSmtpFrom();
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
      html: plainTextToHtml(text),
      ...(replyTo ? { replyTo } : {}),
    });
    console.info("[email] SMTP OK to=%s", payload.email);
    return;
  }

  throw new Error(
    "Почта не настроена: задайте RESEND_API_KEY (рекомендуется) или SMTP_HOST + SMTP_USER + SMTP_PASS в .env на сервере",
  );
}

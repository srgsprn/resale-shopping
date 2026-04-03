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

function siteBaseUrl(): string {
  const u = (process.env.NEXT_PUBLIC_SITE_URL || "https://resale-shopping.ru").replace(/\/$/, "");
  return u;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** HTML-письмо: бутиковая вёрстка, бежево-коричневая гамма как на сайте. */
function buildOrderEmailHtml(payload: OrderEmailPayload, kind: OrderEmailKind): string {
  const base = siteBaseUrl();
  const logoUrl = `${base}/resale-icon.png`;
  const name = escapeHtml(payload.name);
  const orderNo = escapeHtml(payload.orderNumber);
  const items = escapeHtml(payload.summary);
  const total = escapeHtml(formatMoney(payload.totalMinor));
  const orderLink = escapeHtml(payload.orderLink);
  const checkoutUrl = payload.checkoutUrl ? escapeHtml(payload.checkoutUrl) : "";

  const textMuted = "#6b635a";
  const textDark = "#2d2720";
  const border = "#d9d2c8";
  const cream = "#f6f3ef";
  const card = "#faf8f5";
  const accent = "#7c5430";
  const btnBg = "#b8a99a";
  const outer = "#ebe6df";

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:${textMuted};width:140px;vertical-align:top;">${label}</td>
      <td style="padding:6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;color:${textDark};vertical-align:top;">${value}</td>
    </tr>`;

  const linkButton = (href: string, label: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
      <tr>
        <td style="border-radius:999px;background:${btnBg};border:1px solid #8a7a6a;">
          <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${textDark};text-decoration:none;">${label}</a>
        </td>
      </tr>
    </table>`;

  let innerTitle = "Заказ оформлен";
  let intro = "";
  let extraRows = "";
  let ctaBlock = linkButton(orderLink, "Ссылка на заказ");

  if (kind === "pending_stripe") {
    innerTitle = "Ожидается оплата";
    intro = `<p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:${textDark};">Мы получили ваш заказ № <strong style="color:${accent};">${orderNo}</strong>. Чтобы завершить оформление, оплатите заказ по кнопке ниже. После оплаты вы получите подтверждение на эту почту.</p>`;
    extraRows = row("Товары в заказе", items) + row("Сумма", total);
    ctaBlock =
      (checkoutUrl ? linkButton(checkoutUrl, "Перейти к оплате") : "") +
      `<p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${textMuted};">Или откройте ссылку вручную:<br><a href="${checkoutUrl}" style="color:${accent};word-break:break-all;">${checkoutUrl}</a></p>`;
  } else {
    intro = `<p style="margin:0 0 8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:${textDark};">Здравствуйте, ${name}!</p>
    <p style="margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:${textDark};">Ваш заказ успешно оформлен и принят в обработку.</p>`;
    extraRows = row("Номер заказа", `<strong style="color:${accent};letter-spacing:0.02em;">${orderNo}</strong>`) + row("Товары в заказе", items) + row("Сумма", total) + row("Ссылка на заказ", `<a href="${orderLink}" style="color:${accent};text-decoration:underline;">${orderLink}</a>`);
    ctaBlock = linkButton(orderLink, "Открыть заказ");
  }

  const footer = `<p style="margin:28px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.65;color:${textDark};">Скоро с вами свяжется менеджер, чтобы уточнить детали и подтвердить удобный формат доставки.</p>
    <p style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.65;color:${textDark};">Спасибо, что выбираете resale-shopping.ru.</p>
    <p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;line-height:1.6;color:${textMuted};">С уважением,<br>команда resale-shopping.ru</p>`;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>${escapeHtml(innerTitle)}</title>
</head>
<body style="margin:0;padding:0;background:${outer};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${outer};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-collapse:separate;background:${card};border:1px solid ${border};border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(45,39,32,0.06);">
          <tr>
            <td style="padding:24px 32px;text-align:center;background:${cream};border-bottom:1px solid ${border};">
              <img src="${escapeHtml(logoUrl)}" alt="Resale Shopping" width="160" style="display:inline-block;max-width:160px;height:auto;border:0;">
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 8px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;letter-spacing:0.02em;color:${textDark};line-height:1.3;">
              ${escapeHtml(innerTitle)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;">
              ${intro}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${border};border-bottom:1px solid ${border};margin:8px 0 20px;">
                ${extraRows}
              </table>
              ${ctaBlock}
              ${footer}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 24px;background:${cream};border-top:1px solid ${border};text-align:center;">
              <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${textMuted};">Premium resale · resale-shopping.ru</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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

Товары в заказе: ${payload.summary}
Сумма: ${formatMoney(payload.totalMinor)}

Чтобы завершить оформление, перейдите к оплате по ссылке:
${url}

После успешной оплаты вы получите подтверждение на эту почту.

С уважением,
команда resale-shopping.ru`,
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
    body: (p) => `Здравствуйте, ${p.name}!\n\nВаш заказ принят и уже передан в работу.\n\nНомер заказа: ${p.orderNumber}\nТовары в заказе: ${p.summary}\nСумма: ${formatMoney(p.totalMinor)}\nСсылка на заказ: ${p.orderLink}\n\nВ ближайшее время персональный менеджер свяжется с вами, чтобы деликатно уточнить детали и подтвердить доставку.\n\nСпасибо, что выбираете resale-shopping.ru.\n\nС уважением,\nкоманда resale-shopping.ru`,
  },
  neutral: {
    subject: "Order confirmed",
    body: (p) => `Здравствуйте, ${p.name}!\n\nВаш заказ оформлен и подтвержден.\n\nНомер заказа: ${p.orderNumber}\nТовары в заказе: ${p.summary}\nСумма: ${formatMoney(p.totalMinor)}\nСсылка на заказ: ${p.orderLink}\n\nСкоро с вами свяжется менеджер для уточнения деталей и подтверждения доставки.\n\nСпасибо, что выбираете resale-shopping.ru.\n\nС уважением,\nкоманда resale-shopping.ru`,
  },
  "premium-resale": {
    subject: "Ваш заказ оформлен",
    body: (p) => `Здравствуйте, ${p.name}!

Ваш заказ успешно оформлен и принят в обработку.

Номер заказа: ${p.orderNumber}
Товары в заказе: ${p.summary}
Сумма: ${formatMoney(p.totalMinor)}
Ссылка на заказ: ${p.orderLink}

Скоро с вами свяжется менеджер, чтобы уточнить детали и подтвердить удобный формат доставки.

Спасибо, что выбираете resale-shopping.ru.

С уважением,
команда resale-shopping.ru`,
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

function hasResendApiKey(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function hasSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
  );
}

async function sendViaResend(
  payload: OrderEmailPayload,
  subject: string,
  text: string,
  kind: OrderEmailKind,
): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("RESEND_API_KEY пустой");

  const resend = new Resend(key);
  const html = buildOrderEmailHtml(payload, kind);
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

async function sendViaSmtp(
  payload: OrderEmailPayload,
  subject: string,
  text: string,
  kind: OrderEmailKind,
): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    throw new Error("SMTP: не заданы SMTP_HOST, SMTP_USER или SMTP_PASS");
  }

  const from = resolveSmtpFrom();
  const replyTo = resolveReplyTo();
  const transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: payload.email,
    subject,
    text,
    html: buildOrderEmailHtml(payload, kind),
    ...(replyTo ? { replyTo } : {}),
  });
  console.info("[email] SMTP OK to=%s", payload.email);
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
  kind: OrderEmailKind = "confirmed",
) {
  const { subject, text } = buildEmailContent(payload, kind);

  if (hasResendApiKey()) {
    try {
      await sendViaResend(payload, subject, text, kind);
      return;
    } catch (err) {
      console.error("[email] Resend ошибка, заказ всё равно оформлен:", err);
      if (hasSmtpConfig()) {
        console.warn("[email] Отправка через запасной SMTP…");
        await sendViaSmtp(payload, subject, text, kind);
        return;
      }
      throw err;
    }
  }

  if (hasSmtpConfig()) {
    await sendViaSmtp(payload, subject, text, kind);
    return;
  }

  throw new Error(
    "Почта не настроена: задайте RESEND_API_KEY (рекомендуется) или SMTP_HOST + SMTP_USER + SMTP_PASS в .env на сервере",
  );
}

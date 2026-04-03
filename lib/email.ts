import nodemailer from "nodemailer";
import punycode from "node:punycode";
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
    intro = checkoutUrl
      ? `<p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:${textDark};">Мы получили ваш заказ № <strong style="color:${accent};">${orderNo}</strong>. Чтобы завершить оформление, оплатите заказ по кнопке ниже. После оплаты вы получите подтверждение на эту почту.</p>`
      : `<p style="margin:0 0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;line-height:1.65;color:${textDark};">Мы получили ваш заказ № <strong style="color:${accent};">${orderNo}</strong>. Откройте страницу заказа по кнопке ниже — там можно завершить оплату. После оплаты вы получите подтверждение на эту почту.</p>`;
    extraRows = row("Товары в заказе", items) + row("Сумма", total);
    ctaBlock = checkoutUrl
      ? linkButton(checkoutUrl, "Перейти к оплате") +
        `<p style="margin:24px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${textMuted};">Или откройте ссылку вручную:<br><a href="${checkoutUrl}" style="color:${accent};word-break:break-all;">${checkoutUrl}</a></p>`
      : linkButton(orderLink, "Открыть страницу заказа") +
        `<p style="margin:20px 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:13px;color:${textMuted};">Если не удаётся оплатить — напишите на <a href="mailto:help@resale-shopping.ru" style="color:${accent};">help@resale-shopping.ru</a>, укажите номер заказа.</p>`;
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
    const url = payload.checkoutUrl?.trim();
    const baseText = `Здравствуйте, ${payload.name}!

Мы получили ваш заказ № ${payload.orderNumber}.

Товары в заказе: ${payload.summary}
Сумма: ${formatMoney(payload.totalMinor)}
`;
    if (url) {
      return {
        subject: `Заказ ${payload.orderNumber}: ожидается оплата`,
        text: `${baseText}
Чтобы завершить оформление, перейдите к оплате по ссылке:
${url}

После успешной оплаты вы получите подтверждение на эту почту.

С уважением,
команда resale-shopping.ru`,
      };
    }
    return {
      subject: `Заказ ${payload.orderNumber}: ожидается оплата`,
      text: `${baseText}
Страница заказа (оплата): ${payload.orderLink}

Если не получается оплатить — напишите на help@resale-shopping.ru, укажите номер заказа.

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

/**
 * Resend API принимает только ASCII в поле `to` (латиница до @; домен — в punycode).
 * Кириллица вроде «твой@gmail.com» даёт Invalid `to` field.
 */
function normalizeEmailForResend(raw: string): { to: string } | { error: string } {
  const email = raw.trim();
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) {
    return { error: "Некорректный email" };
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!/^[\x00-\x7F]+$/.test(local)) {
    return {
      error:
        "Resend: в адресе до «@» допустима только латиница/цифры (ASCII). Замените email на латинский или используйте SMTP.",
    };
  }
  let asciiDomain: string;
  try {
    asciiDomain = punycode.toASCII(domain);
  } catch {
    return { error: "Некорректный домен в email" };
  }
  return { to: `${local}@${asciiDomain}` };
}

/**
 * Российские почтовики часто режут письма, пришедшие только через HTTP API Resend.
 * Для .ru / .su / .рф сначала пробуем SMTP: свой хостинг (SMTP_*) или relay Resend
 * (smtp.resend.com + пользователь resend + пароль = RESEND_API_KEY — отдельные SMTP_* не нужны).
 */
function recipientPrefersSmtpFirst(raw: string): boolean {
  const email = raw.trim();
  const at = email.lastIndexOf("@");
  if (at <= 0 || at === email.length - 1) return false;
  let domain = email.slice(at + 1).toLowerCase();
  try {
    domain = punycode.toASCII(domain);
  } catch {
    return false;
  }
  return domain.endsWith(".ru") || domain.endsWith(".su") || domain.endsWith(".xn--p1ai");
}

function hasResendApiKey(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function hasExplicitSmtpConfig(): boolean {
  return Boolean(
    process.env.SMTP_HOST?.trim() && process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim(),
  );
}

type SmtpTransportMode = "explicit" | "resend_relay";

/** Конфиг для nodemailer SMTP (тип createTransport — перегрузки, локально задаём форму). */
type SmtpConnectionConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
};

function getSmtpTransportOptions(): { mode: SmtpTransportMode; options: SmtpConnectionConfig } | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (host && user && pass) {
    return {
      mode: "explicit",
      options: {
        host,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user, pass },
      },
    };
  }

  if (process.env.RESEND_SMTP_RELAY_DISABLED === "1") {
    return null;
  }

  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;

  const rHost = process.env.RESEND_SMTP_HOST?.trim() || "smtp.resend.com";
  const rPort = Number(process.env.RESEND_SMTP_PORT || 465);
  return {
    mode: "resend_relay",
    options: {
      host: rHost,
      port: rPort,
      secure: rPort === 465 || process.env.RESEND_SMTP_SECURE === "true",
      auth: { user: "resend", pass: key },
    },
  };
}

/** Отправка через nodemailer: либо SMTP хостинга, либо официальный relay Resend по API-ключу. */
function hasSmtpSendPath(): boolean {
  return getSmtpTransportOptions() !== null;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

  const attempts = Math.max(1, Math.min(5, Number(process.env.RESEND_RETRY_ATTEMPTS || "3")));

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    for (const from of candidates) {
      const trySend = async (withReplyTo: boolean) => {
        return resend.emails.send({
          from,
          to: [payload.email],
          subject,
          text,
          html,
          ...(withReplyTo && replyTo ? { replyTo: [replyTo] } : {}),
        });
      };

      let { data, error } = await trySend(true);
      if (error && replyTo) {
        console.warn("[email] Resend повтор без replyTo (иногда ломает валидацию)");
        ({ data, error } = await trySend(false));
      }

      if (!error && data?.id) {
        console.info("[email] Resend OK id=%s from=%s to=%s attempt=%s", data.id, from, payload.email, attempt);
        return;
      }

      lastError = error;
      console.warn(
        "[email] Resend отказ from=%s to=%s attempt=%s/%s: %s",
        from,
        payload.email,
        attempt,
        attempts,
        resendErrorMessage(error),
      );
    }

    if (attempt < attempts) {
      const delay = 600 * attempt;
      console.warn("[email] Resend пауза %sms перед повтором…", delay);
      await sleep(delay);
    }
  }

  throw new Error(`Resend: не удалось отправить ни с одного адреса отправителя. Последняя ошибка: ${resendErrorMessage(lastError)}`);
}

async function sendViaSmtp(
  payload: OrderEmailPayload,
  subject: string,
  text: string,
  kind: OrderEmailKind,
): Promise<void> {
  const cfg = getSmtpTransportOptions();
  if (!cfg) {
    throw new Error("SMTP: задайте SMTP_HOST+SMTP_USER+SMTP_PASS или RESEND_API_KEY для smtp.resend.com");
  }

  const from = resolveSmtpFrom();
  const replyTo = resolveReplyTo();
  const transporter = nodemailer.createTransport(cfg.options as Parameters<typeof nodemailer.createTransport>[0]);

  console.info(
    "[email] SMTP транспорт: %s",
    cfg.mode === "resend_relay" ? `Resend relay (${cfg.options.host})` : `хостинг (${cfg.options.host})`,
  );

  await transporter.sendMail({
    from,
    to: payload.email,
    subject,
    text,
    html: buildOrderEmailHtml(payload, kind),
    ...(replyTo ? { replyTo } : {}),
  });
  console.info("[email] SMTP OK mode=%s to=%s", cfg.mode, payload.email);
}

export async function sendOrderConfirmationEmail(
  payload: OrderEmailPayload,
  kind: OrderEmailKind = "confirmed",
) {
  const { subject, text } = buildEmailContent(payload, kind);
  const normalized = normalizeEmailForResend(payload.email);

  const smtpFirst = hasSmtpSendPath() && recipientPrefersSmtpFirst(payload.email);

  if (smtpFirst) {
    try {
      console.info("[email] SMTP приоритет (.ru/.su/.рф) to=%s", payload.email);
      await sendViaSmtp(payload, subject, text, kind);
      return;
    } catch (smtpErr) {
      const canTryResend = hasResendApiKey() && !("error" in normalized);
      console.warn(
        `[email] SMTP приоритет не удался${canTryResend ? ", пробую Resend…" : ""}`,
        smtpErr,
      );
      if (!canTryResend) {
        throw smtpErr instanceof Error ? smtpErr : new Error(String(smtpErr));
      }
    }
  }

  if (hasResendApiKey()) {
    if ("error" in normalized) {
      console.warn("[email] %s", normalized.error);
      if (hasSmtpSendPath()) {
        console.warn("[email] Отправка заказа через SMTP (Resend не подходит для этого адреса)…");
        await sendViaSmtp(payload, subject, text, kind);
        return;
      }
      throw new Error(normalized.error);
    }

    const resendPayload: OrderEmailPayload = { ...payload, email: normalized.to };

    try {
      await sendViaResend(resendPayload, subject, text, kind);
      return;
    } catch (err) {
      console.error("[email] Resend ошибка, заказ всё равно оформлен:", err);
      if (hasSmtpSendPath()) {
        console.warn("[email] Отправка через запасной SMTP…");
        await sendViaSmtp(payload, subject, text, kind);
        return;
      }
      throw err;
    }
  }

  if (hasSmtpSendPath()) {
    await sendViaSmtp(payload, subject, text, kind);
    return;
  }

  throw new Error(
    "Почта не настроена: задайте RESEND_API_KEY (и при необходимости SMTP_HOST + SMTP_USER + SMTP_PASS) в .env на сервере",
  );
}

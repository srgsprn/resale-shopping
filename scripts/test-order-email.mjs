#!/usr/bin/env node
/**
 * Дымовой тест почты (Resend → при ошибке SMTP, как в lib/email.ts).
 *
 * Важно: Resend не принимает кириллицу в email (например «твой@gmail.com» с русскими буквами).
 * Указывайте только латиницу: TEST_MAIL_TO=you@gmail.com
 *
 *   set -a && source .env && set +a && TEST_MAIL_TO=you@gmail.com node scripts/test-order-email.mjs
 *
 * Или: TEST_MAIL_TO=you@gmail.com node --env-file=.env scripts/test-order-email.mjs
 */

import nodemailer from "nodemailer";
import punycode from "node:punycode";
import { Resend } from "resend";

const rawTo = process.env.TEST_MAIL_TO?.trim();
if (!rawTo) {
  console.error("Ошибка: задайте TEST_MAIL_TO=you@gmail.com (только латиница в адресе для Resend)");
  process.exit(1);
}

function normalizeForResend(email) {
  const at = email.lastIndexOf("@");
  if (at <= 0) return { error: "Некорректный email" };
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!/^[\x00-\x7F]+$/.test(local)) {
    return {
      error:
        "В адресе до «@» есть не латинские символы. Resend так не принимает. Пример: TEST_MAIL_TO=ivan@gmail.com",
    };
  }
  try {
    return { to: `${local}@${punycode.toASCII(domain)}` };
  } catch {
    return { error: "Некорректный домен" };
  }
}

const resendKey = process.env.RESEND_API_KEY?.trim();
const smtpHost = process.env.SMTP_HOST?.trim();
const smtpUser = process.env.SMTP_USER?.trim();
const smtpPass = process.env.SMTP_PASS?.trim();

const subject = "Resale Shopping — тест почты";
const text = `Если вы видите это письмо, отправка с сервера работает.\nВремя: ${new Date().toISOString()}`;
const html = `<p>${text.replace(/\n/g, "<br/>")}</p>`;

function formatFrom(raw) {
  const s = (raw || "").trim();
  if (!s) return "Resale Shopping <onboarding@resend.dev>";
  if (s.includes("<") && s.includes(">")) return s;
  if (s.includes("@")) return `Resale Shopping <${s}>`;
  return s;
}

async function tryResend() {
  const norm = normalizeForResend(rawTo);
  if (norm.error) {
    console.error("[fail]", norm.error);
    return false;
  }
  const to = norm.to;
  console.log("Проверка почты →", to, rawTo !== to ? `(было: ${rawTo})` : "");

  const resend = new Resend(resendKey);
  const candidates = [];
  const push = (v) => {
    if (!v?.trim()) return;
    const f = formatFrom(v.trim());
    if (!candidates.includes(f)) candidates.push(f);
  };
  push(process.env.RESEND_FROM);
  push(process.env.ORDER_FROM_EMAIL);
  push("onboarding@resend.dev");

  let lastErr;
  for (const from of candidates) {
    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      text,
      html,
    });
    if (!error && data?.id) {
      console.log("[ok] Resend: письмо отправлено, id=", data.id, "from=", from);
      return true;
    }
    lastErr = error;
    console.warn("[warn] Resend from=", from, error?.message || error);
  }
  console.error("[fail] Resend:", lastErr?.message || lastErr);
  return false;
}

async function trySmtp() {
  const to = rawTo;
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: smtpUser, pass: smtpPass },
  });
  const from = formatFrom(process.env.ORDER_FROM_EMAIL || smtpUser);
  await transporter.sendMail({ from, to, subject, text, html });
  console.log("[ok] SMTP: письмо отправлено на", to);
  return true;
}

async function main() {
  if (resendKey) {
    try {
      if (await tryResend()) return;
    } catch (e) {
      console.error("[fail] Resend исключение:", e?.message || e);
    }
    if (smtpHost && smtpUser && smtpPass) {
      console.log("Пробую запасной SMTP…");
      try {
        await trySmtp();
        return;
      } catch (e) {
        console.error("[fail] SMTP:", e?.message || e);
        process.exit(1);
      }
    }
    process.exit(1);
  }

  if (smtpHost && smtpUser && smtpPass) {
    try {
      await trySmtp();
      return;
    } catch (e) {
      console.error("[fail] SMTP:", e?.message || e);
      process.exit(1);
    }
  }

  console.error("Нет RESEND_API_KEY и нет SMTP_HOST/SMTP_USER/SMTP_PASS в окружении.");
  process.exit(1);
}

main();

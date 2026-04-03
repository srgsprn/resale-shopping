#!/usr/bin/env node
/**
 * Дымовой тест почты (Resend → при ошибке SMTP, как в lib/email.ts).
 *
 * На VPS из каталога проекта, с переменными из .env:
 *   set -a && source .env && set +a && TEST_MAIL_TO=ваш@email.ru node scripts/test-order-email.mjs
 *
 * Или с Node 20.6+:
 *   TEST_MAIL_TO=ваш@email.ru node --env-file=.env scripts/test-order-email.mjs
 */

import nodemailer from "nodemailer";
import { Resend } from "resend";

const to = process.env.TEST_MAIL_TO?.trim();
if (!to) {
  console.error("Ошибка: задайте TEST_MAIL_TO=ваш@email.ru");
  process.exit(1);
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
  console.log("Проверка почты →", to);

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

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const bodySchema = z.object({
  productName: z.string().min(1).max(500),
  category: z.string().min(1).max(120),
  brand: z.string().min(1).max(200),
  condition: z.string().min(1).max(120),
  purchasePlace: z.string().max(500).optional(),
  description: z.string().min(1).max(8000),
  price: z.string().max(80).optional(),
  name: z.string().min(1).max(200),
  phone: z.string().min(5).max(40),
  email: z.string().email().max(200),
  contact: z.enum(["whatsapp", "phone", "telegram"]),
});

function formatFromHeader(raw: string): string {
  const s = raw.trim();
  if (s.includes("<") && s.includes(">")) return s;
  if (s.includes("@")) return `Resale Shopping <${s}>`;
  return s;
}

function internalInbox(): string {
  return (
    process.env.SELL_LEAD_TO?.trim() ||
    process.env.ORDER_REPLY_TO_EMAIL?.trim() ||
    "help@resale-shopping.ru"
  );
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Проверьте поля формы" }, { status: 400 });
  }

  const d = parsed.data;
  const contactRu =
    d.contact === "whatsapp" ? "WhatsApp" : d.contact === "telegram" ? "Telegram" : "Телефон";

  const text = [
    "Новая заявка «Продать» с сайта resale-shopping.ru",
    "",
    `Товар: ${d.productName}`,
    `Категория: ${d.category}`,
    `Бренд: ${d.brand}`,
    `Состояние: ${d.condition}`,
    d.purchasePlace ? `Где купили: ${d.purchasePlace}` : null,
    "",
    `Описание:\n${d.description}`,
    "",
    d.price ? `Желаемая цена: ${d.price}` : null,
    "",
    `Имя: ${d.name}`,
    `Телефон: ${d.phone}`,
    `Email: ${d.email}`,
    `Связь: ${contactRu}`,
  ]
    .filter(Boolean)
    .join("\n");

  const to = internalInbox();
  const key = process.env.RESEND_API_KEY?.trim();

  if (key) {
    const resend = new Resend(key);
    const fromRaw =
      process.env.RESEND_FROM?.trim() || process.env.ORDER_FROM_EMAIL?.trim() || "onboarding@resend.dev";
    const from = formatFromHeader(fromRaw);

    const { data, error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: [d.email],
      subject: `Продать: ${d.brand} — ${d.productName.slice(0, 60)}`,
      text,
    });

    if (error || !data?.id) {
      console.warn("[sell-lead] Resend error", error);
      return NextResponse.json({ error: "Не удалось отправить заявку. Напишите на help@resale-shopping.ru" }, { status: 502 });
    }

    console.info("[sell-lead] Resend OK id=%s", data.id);
    return NextResponse.json({ ok: true });
  }

  console.warn("[sell-lead] RESEND_API_KEY не задан. Заявка:\n%s", text);
  return NextResponse.json(
    {
      error:
        "Отправка заявок по почте временно недоступна. Напишите на help@resale-shopping.ru или в WhatsApp.",
    },
    { status: 503 },
  );
}

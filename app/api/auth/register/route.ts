import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль не короче 8 символов"),
  name: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      (first.email?.[0] as string | undefined) ||
      (first.password?.[0] as string | undefined) ||
      "Проверьте поля формы";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = (parsed.data.name ?? "").trim();

  const exists = await prisma.credentialUser.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Этот email уже зарегистрирован" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.credentialUser.create({
    data: {
      email,
      passwordHash,
      name,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

import { requireStaffSession } from "@/lib/admin-auth";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    await requireStaffSession();
  } catch (e) {
    const m = e instanceof Error ? e.message : "";
    if (m === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (m === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Нет файла" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл больше 8 МБ" }, { status: 400 });
  }
  const type = file.type || "";
  if (!ALLOWED.has(type)) {
    return NextResponse.json({ error: "Только JPEG, PNG, WebP, GIF" }, { status: 400 });
  }

  const ext =
    type === "image/png"
      ? "png"
      : type === "image/webp"
        ? "webp"
        : type === "image/gif"
          ? "gif"
          : "jpg";

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "admin");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);

  const url = `/uploads/admin/${name}`;
  return NextResponse.json({ url });
}

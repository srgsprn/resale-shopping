import { NextResponse } from "next/server";

import { requireStaffSession } from "@/lib/admin-auth";
import { listAdminProducts } from "@/lib/admin/products-queries";
import {
  createProductFromFormData,
  deleteProductById,
  updateProductFromFormData,
} from "@/lib/admin/products-mutations";

function staffErrorResponse(e: unknown) {
  const msg = e instanceof Error ? e.message : "";
  if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (msg === "FORBIDDEN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ error: "Server error" }, { status: 500 });
}

/** Список товаров (основной UI — RSC); также для интеграций. */
export async function GET(req: Request) {
  try {
    await requireStaffSession();
  } catch (e) {
    return staffErrorResponse(e);
  }

  const { searchParams } = new URL(req.url);
  const data = await listAdminProducts({
    q: searchParams.get("q") || undefined,
    categoryId: searchParams.get("categoryId") || undefined,
    brandId: searchParams.get("brandId") || undefined,
    brand: searchParams.get("brand") || undefined,
    status: searchParams.get("status") || undefined,
    page: Number.parseInt(searchParams.get("page") || "1", 10) || 1,
  });

  return NextResponse.json(data);
}

function jsonBodyToFormData(body: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(body)) {
    if (val === undefined || val === null) continue;
    if (key === "images" && Array.isArray(val)) {
      fd.set("imagesJson", JSON.stringify(val));
      continue;
    }
    if (typeof val === "boolean") {
      if (val) fd.set(key, "on");
      continue;
    }
    fd.set(key, String(val));
  }
  return fd;
}

/** Создать товар (поля как в форме админки; images — массив { url, alt?, isMain? }). */
export async function POST(req: Request) {
  try {
    await requireStaffSession();
  } catch (e) {
    return staffErrorResponse(e);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fd = jsonBodyToFormData(body);
  const r = await createProductFromFormData(fd);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true, slug: r.slug }, { status: 201 });
}

/** Обновить товар (тело JSON, обязательно id). */
export async function PUT(req: Request) {
  try {
    await requireStaffSession();
  } catch (e) {
    return staffErrorResponse(e);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const fd = jsonBodyToFormData(body);
  const r = await updateProductFromFormData(fd);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true, slug: r.slug });
}

/** Удалить товар: ?id=... */
export async function DELETE(req: Request) {
  try {
    await requireStaffSession();
  } catch (e) {
    return staffErrorResponse(e);
  }

  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const r = await deleteProductById(id);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

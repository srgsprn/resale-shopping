import { NextResponse } from "next/server";

import { requireStaffSession } from "@/lib/admin-auth";

/** Проверка доступа к /api/admin (middleware + явная проверка). */
export async function GET() {
  try {
    await requireStaffSession();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

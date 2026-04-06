import type { Prisma, ProductStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const ADMIN_PAGE_SIZE = 20;

export type AdminProductListParams = {
  q?: string;
  categoryId?: string;
  /** Точное совпадение по brandId */
  brandId?: string;
  /** Подстрока по полю brand (текст) */
  brand?: string;
  status?: string;
  page?: number;
};

export async function countAdminProducts(where: Prisma.ProductWhereInput) {
  return prisma.product.count({ where });
}

export async function listAdminProducts(params: AdminProductListParams) {
  const page = Math.max(1, params.page ?? 1);
  const where: Prisma.ProductWhereInput = {};

  if (params.q?.trim()) {
    const q = params.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }
  if (params.categoryId?.trim()) {
    where.categoryId = params.categoryId.trim();
  }
  if (params.brandId?.trim()) {
    where.brandId = params.brandId.trim();
  }
  if (params.brand?.trim()) {
    where.brand = { contains: params.brand.trim(), mode: "insensitive" };
  }
  if (params.status?.trim()) {
    const s = params.status.trim().toUpperCase();
    if (s === "DRAFT" || s === "ACTIVE" || s === "SOLD_OUT" || s === "ARCHIVED") {
      where.status = s as ProductStatus;
    }
  }

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { category: true, brandRef: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);

  return { total, rows, page, pageSize: ADMIN_PAGE_SIZE };
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { category: true, brandRef: true, images: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function uniqueProductSlug(base: string): Promise<string> {
  const root = base || "item";
  for (let n = 0; n < 500; n++) {
    const slug = n === 0 ? root : `${root}-${n}`;
    const exists = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${root}-${Date.now()}`;
}

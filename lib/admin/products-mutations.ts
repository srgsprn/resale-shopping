import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { isStaffRole } from "@/lib/admin-role";
import { getProductForAdmin, uniqueProductSlug } from "@/lib/admin/products-queries";
import { slugifyLatin } from "@/lib/admin/slug";
import { prisma } from "@/lib/prisma";

import type { ProductStatus } from "@prisma/client";

export type ProductMutationResult = { ok: true; slug?: string } | { error: string };

type ImageInput = { url: string; alt?: string; isMain?: boolean };

function parseImagesJson(raw: string): ImageInput[] {
  try {
    const parsed = JSON.parse(raw || "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: ImageInput[] = [];
    for (const x of parsed) {
      if (typeof x === "object" && x && "url" in x && typeof (x as { url: string }).url === "string") {
        const o = x as { url: string; alt?: string; isMain?: boolean };
        const url = o.url.trim();
        if (url) out.push({ url, alt: o.alt?.trim(), isMain: Boolean(o.isMain) });
      }
    }
    return out;
  } catch {
    return [];
  }
}

function normalizeMain(images: ImageInput[]): ImageInput[] {
  if (images.length === 0) return [];
  const anyMain = images.some((i) => i.isMain);
  if (!anyMain) return images.map((i, idx) => ({ ...i, isMain: idx === 0 }));
  return images;
}

async function assertStaff(): Promise<ProductMutationResult | null> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Требуется вход" };
  if (!isStaffRole(session.user.role)) return { error: "Недостаточно прав" };
  return null;
}

function revalidateCatalog(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath("/");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function createProductFromFormData(formData: FormData): Promise<ProductMutationResult> {
  const deny = await assertStaff();
  if (deny) return deny;

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Укажите название" };

  const categoryId = (formData.get("categoryId") as string)?.trim();
  if (!categoryId) return { error: "Выберите категорию" };

  let brandId = (formData.get("brandId") as string)?.trim() || null;
  let brand = (formData.get("brand") as string)?.trim() || "";
  if (brandId) {
    const b = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    if (b) brand = b.name;
  }
  if (!brand) return { error: "Укажите бренд или выберите из списка" };

  const slugRaw = (formData.get("slug") as string)?.trim();
  const baseSlug = slugRaw || slugifyLatin(`${brand}-${name}`);
  const slug = await uniqueProductSlug(baseSlug);

  const priceRub = Number.parseInt((formData.get("priceRubles") as string) || "", 10);
  if (Number.isNaN(priceRub) || priceRub < 0) return { error: "Некорректная цена" };

  const compareRaw = (formData.get("compareAtRubles") as string)?.trim();
  const compareRub =
    compareRaw === "" || compareRaw === undefined ? null : Number.parseInt(compareRaw, 10);
  if (compareRub !== null && (Number.isNaN(compareRub) || compareRub < 0)) return { error: "Некорректная старая цена" };

  const status = (formData.get("status") as string)?.trim().toUpperCase() as ProductStatus;
  if (!["DRAFT", "ACTIVE", "SOLD_OUT", "ARCHIVED"].includes(status)) return { error: "Некорректный статус" };

  const images = normalizeMain(parseImagesJson(formData.get("imagesJson") as string));

  try {
    await prisma.product.create({
      data: {
        name,
        slug,
        brand,
        brandId,
        categoryId,
        priceMinor: priceRub * 100,
        compareAtMinor: compareRub != null ? compareRub * 100 : null,
        currency: (formData.get("currency") as string)?.trim() || "RUB",
        status,
        isFeatured: formData.get("isFeatured") === "on",
        shortDescription: (formData.get("shortDescription") as string)?.trim() || null,
        description: (formData.get("description") as string)?.trim() || null,
        conditionLabel: (formData.get("conditionLabel") as string)?.trim() || null,
        sku: (formData.get("sku") as string)?.trim() || null,
        seoTitle: (formData.get("seoTitle") as string)?.trim() || null,
        seoDescription: (formData.get("seoDescription") as string)?.trim() || null,
        h1: (formData.get("h1") as string)?.trim() || null,
        canonical: (formData.get("canonical") as string)?.trim() || null,
        ogTitle: (formData.get("ogTitle") as string)?.trim() || null,
        ogDescription: (formData.get("ogDescription") as string)?.trim() || null,
        images:
          images.length > 0
            ? {
                create: images.map((im, i) => ({
                  url: im.url,
                  alt: im.alt || null,
                  sortOrder: i,
                  isMain: Boolean(im.isMain),
                })),
              }
            : undefined,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сохранения";
    return { error: msg };
  }

  revalidateCatalog(slug);
  return { ok: true, slug };
}

export async function updateProductFromFormData(formData: FormData): Promise<ProductMutationResult> {
  const deny = await assertStaff();
  if (deny) return deny;

  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Нет id товара" };

  const existing = await getProductForAdmin(id);
  if (!existing) return { error: "Товар не найден" };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Укажите название" };

  const categoryId = (formData.get("categoryId") as string)?.trim();
  if (!categoryId) return { error: "Выберите категорию" };

  let brandId = (formData.get("brandId") as string)?.trim() || null;
  let brand = (formData.get("brand") as string)?.trim() || "";
  if (brandId) {
    const b = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    if (b) brand = b.name;
  }
  if (!brand) return { error: "Укажите бренд или выберите из списка" };

  let slug = (formData.get("slug") as string)?.trim();
  if (!slug) slug = slugifyLatin(`${brand}-${name}`);
  if (slug !== existing.slug) {
    const taken = await prisma.product.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
    if (taken) slug = await uniqueProductSlug(slug);
  }

  const priceRub = Number.parseInt((formData.get("priceRubles") as string) || "", 10);
  if (Number.isNaN(priceRub) || priceRub < 0) return { error: "Некорректная цена" };

  const compareRaw = (formData.get("compareAtRubles") as string)?.trim();
  const compareRub =
    compareRaw === "" || compareRaw === undefined ? null : Number.parseInt(compareRaw, 10);
  if (compareRub !== null && (Number.isNaN(compareRub) || compareRub < 0)) return { error: "Некорректная старая цена" };

  const status = (formData.get("status") as string)?.trim().toUpperCase() as ProductStatus;
  if (!["DRAFT", "ACTIVE", "SOLD_OUT", "ARCHIVED"].includes(status)) return { error: "Некорректный статус" };

  const images = normalizeMain(parseImagesJson(formData.get("imagesJson") as string));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          brand,
          brandId,
          categoryId,
          priceMinor: priceRub * 100,
          compareAtMinor: compareRub != null ? compareRub * 100 : null,
          currency: (formData.get("currency") as string)?.trim() || "RUB",
          status,
          isFeatured: formData.get("isFeatured") === "on",
          shortDescription: (formData.get("shortDescription") as string)?.trim() || null,
          description: (formData.get("description") as string)?.trim() || null,
          conditionLabel: (formData.get("conditionLabel") as string)?.trim() || null,
          sku: (formData.get("sku") as string)?.trim() || null,
          seoTitle: (formData.get("seoTitle") as string)?.trim() || null,
          seoDescription: (formData.get("seoDescription") as string)?.trim() || null,
          h1: (formData.get("h1") as string)?.trim() || null,
          canonical: (formData.get("canonical") as string)?.trim() || null,
          ogTitle: (formData.get("ogTitle") as string)?.trim() || null,
          ogDescription: (formData.get("ogDescription") as string)?.trim() || null,
        },
      });
      if (images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((im, i) => ({
            productId: id,
            url: im.url,
            alt: im.alt || null,
            sortOrder: i,
            isMain: Boolean(im.isMain),
          })),
        });
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Ошибка сохранения";
    return { error: msg };
  }

  revalidateCatalog(slug);
  return { ok: true, slug };
}

export async function deleteProductById(idRaw: string): Promise<ProductMutationResult> {
  const deny = await assertStaff();
  if (deny) return deny;

  const id = idRaw?.trim();
  if (!id) return { error: "Нет id" };

  const inOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (inOrders > 0) {
    return { error: "Товар есть в заказах — удаление запрещено. Поставьте статус ARCHIVED." };
  }

  const p = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!p) return { error: "Не найден" };

  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Ошибка удаления" };
  }

  revalidateCatalog();
  return { ok: true };
}

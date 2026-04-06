"use server";

import { redirect } from "next/navigation";

import {
  createProductFromFormData,
  deleteProductById,
  updateProductFromFormData,
} from "@/lib/admin/products-mutations";

export type ProductActionState = { ok?: boolean; error?: string };

export async function createProduct(
  _prev: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const r = await createProductFromFormData(formData);
  if ("error" in r) return { error: r.error };
  redirect("/admin/products");
}

export async function updateProduct(
  _prev: ProductActionState | undefined,
  formData: FormData,
): Promise<ProductActionState> {
  const r = await updateProductFromFormData(formData);
  if ("error" in r) return { error: r.error };
  return { ok: true };
}

export async function deleteProduct(formData: FormData): Promise<ProductActionState> {
  const id = (formData.get("id") as string)?.trim();
  if (!id) return { error: "Нет id" };
  const r = await deleteProductById(id);
  if ("error" in r) return { error: r.error };
  redirect("/admin/products");
}

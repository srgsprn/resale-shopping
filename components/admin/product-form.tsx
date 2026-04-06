"use client";

import type { Brand, Category, Product, ProductImage, ProductStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

import { createProduct, updateProduct, type ProductActionState } from "@/app/admin/(panel)/products/actions";
import { slugifyLatin } from "@/lib/admin/slug";

import { ImageUploadZone } from "@/components/admin/image-upload-zone";

type ProductWithImages = Product & { images: ProductImage[] };

type Props = {
  mode: "create" | "edit";
  categories: Pick<Category, "id" | "name">[];
  brands: Pick<Brand, "id" | "name">[];
  product?: ProductWithImages;
};

type Row = { url: string; alt: string; isMain: boolean };

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "DRAFT", label: "Черновик" },
  { value: "ACTIVE", label: "В продаже" },
  { value: "SOLD_OUT", label: "Нет в наличии" },
  { value: "ARCHIVED", label: "Архив" },
];

const CONDITIONS = ["Новое", "Отличное", "Хорошее", "Удовлетворительно", "Vintage"];

export function ProductForm({ mode, categories, brands, product }: Props) {
  const router = useRouter();
  const actionFn = mode === "create" ? createProduct : updateProduct;
  const [state, formAction] = useFormState(actionFn, {} as ProductActionState);

  const [slug, setSlug] = useState(product?.slug ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [name, setName] = useState(product?.name ?? "");
  const [images, setImages] = useState<Row[]>(() =>
    (product?.images?.length
      ? product.images.map((im) => ({ url: im.url, alt: im.alt ?? "", isMain: im.isMain }))
      : []
    ).sort((a, b) => (a.isMain === b.isMain ? 0 : a.isMain ? -1 : 1)),
  );

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state?.error]);

  useEffect(() => {
    if (state?.ok) {
      toast.success("Сохранено");
      router.refresh();
    }
  }, [state?.ok, router]);

  const imagesJson = useMemo(() => JSON.stringify(images), [images]);

  const addUrl = (url: string) => {
    setImages((prev) => [...prev, { url, alt: "", isMain: prev.length === 0 }]);
  };

  const setMain = (idx: number) => {
    setImages((prev) => prev.map((row, i) => ({ ...row, isMain: i === idx })));
  };

  const removeRow = (idx: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (next.length && !next.some((r) => r.isMain)) next[0] = { ...next[0], isMain: true };
      return next;
    });
  };

  const suggestSlug = () => {
    const b = brand.trim() || "brand";
    const n = name.trim() || "item";
    setSlug(slugifyLatin(`${b}-${n}`));
  };

  return (
    <form action={formAction} className="mx-auto max-w-3xl space-y-8">
      {mode === "edit" && product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="imagesJson" value={imagesJson} readOnly />

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">Основное</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-600">Название *</label>
            <input
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Slug *</label>
            <div className="flex gap-2">
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required={mode === "edit"}
                placeholder="Авто при создании, если пусто"
                className="w-full flex-1 rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={suggestSlug}
                className="shrink-0 rounded-xl border border-zinc-300 bg-[#faf8f5] px-3 py-2 text-xs font-medium text-zinc-800"
              >
                Из названия
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">SKU</label>
            <input
              name="sku"
              defaultValue={product?.sku ?? ""}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Категория *</label>
            <select
              name="categoryId"
              required
              defaultValue={product?.categoryId}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Бренд (справочник)</label>
            <select
              name="brandId"
              defaultValue={product?.brandId ?? ""}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
              onChange={(e) => {
                const id = e.target.value;
                const row = brands.find((b) => b.id === id);
                if (row) setBrand(row.name);
              }}
            >
              <option value="">—</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Бренд (текст) *</label>
            <input
              name="brand"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Цена, ₽ *</label>
            <input
              name="priceRubles"
              type="number"
              min={0}
              required
              defaultValue={product ? Math.round(product.priceMinor / 100) : ""}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Старая цена, ₽</label>
            <input
              name="compareAtRubles"
              type="number"
              min={0}
              defaultValue={product?.compareAtMinor != null ? Math.round(product.compareAtMinor / 100) : ""}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Состояние</label>
            <select
              name="conditionLabel"
              defaultValue={product?.conditionLabel ?? ""}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Статус *</label>
            <select
              name="status"
              required
              defaultValue={product?.status ?? "DRAFT"}
              className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              name="isFeatured"
              value="on"
              defaultChecked={product?.isFeatured}
              id="isFeatured"
              className="h-4 w-4 rounded border-zinc-400"
            />
            <label htmlFor="isFeatured" className="text-sm text-zinc-700">
              Избранное на витрине
            </label>
          </div>
          <input type="hidden" name="currency" value={product?.currency ?? "RUB"} />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">Описание</h2>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Краткое описание</label>
          <textarea
            name="shortDescription"
            rows={2}
            defaultValue={product?.shortDescription ?? ""}
            className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Полное описание</label>
          <textarea
            name="description"
            rows={6}
            defaultValue={product?.description ?? ""}
            className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm"
          />
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">SEO</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-600">SEO title</label>
            <input name="seoTitle" defaultValue={product?.seoTitle ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-medium text-zinc-600">SEO description</label>
            <textarea name="seoDescription" rows={2} defaultValue={product?.seoDescription ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">H1</label>
            <input name="h1" defaultValue={product?.h1 ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Canonical</label>
            <input name="canonical" defaultValue={product?.canonical ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">OG title</label>
            <input name="ogTitle" defaultValue={product?.ogTitle ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">OG description</label>
            <input name="ogDescription" defaultValue={product?.ogDescription ?? ""} className="w-full rounded-xl border border-[#d9d2c8] px-3 py-2 text-sm" />
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#d9d2c8] bg-white p-5 md:p-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-800">Фото</h2>
        <ImageUploadZone onUploaded={addUrl} />
        <ul className="space-y-2">
          {images.map((row, idx) => (
            <li key={`${row.url}-${idx}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#ebe6df] bg-[#faf8f5] p-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
              <input
                value={row.alt}
                onChange={(e) =>
                  setImages((prev) => prev.map((r, i) => (i === idx ? { ...r, alt: e.target.value } : r)))
                }
                placeholder="alt"
                className="min-w-[120px] flex-1 rounded-lg border border-zinc-200 px-2 py-1"
              />
              <label className="flex items-center gap-1 text-xs">
                <input type="radio" name="mainImg" checked={row.isMain} onChange={() => setMain(idx)} />
                Главное
              </label>
              <button type="button" onClick={() => removeRow(idx)} className="text-xs text-red-700">
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-full border border-zinc-900 bg-zinc-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white">
          {mode === "create" ? "Создать товар" : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-full border border-zinc-300 bg-white px-6 py-3 text-xs uppercase tracking-[0.12em] text-zinc-800"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}

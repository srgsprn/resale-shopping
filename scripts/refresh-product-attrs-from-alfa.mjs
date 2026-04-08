/**
 * Подтягивает с alfa-resale.ru HTML карточки товара и обновляет в БД поля:
 * size, material, color, gender, completeness, conditionLabel, brand (строка).
 * Артикул (sku) не трогаем.
 *
 * Запуск: node scripts/refresh-product-attrs-from-alfa.mjs
 * ALFA_BATCH_SIZE — параллельных HTTP-запросов за шаг (по умолчанию 8)
 * ALFA_DELAY_MS — пауза между пакетами (по умолчанию 60)
 * REFRESH_LIMIT — ограничить число товаров (тест)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = (process.env.ALFA_BASE_URL || "https://alfa-resale.ru").replace(/\/$/, "");
const BATCH_SIZE = Math.max(1, Math.min(20, Number(process.env.ALFA_BATCH_SIZE || "8")));
const DELAY_MS = Math.max(0, Number(process.env.ALFA_DELAY_MS || "60"));
const LIMIT = process.env.REFRESH_LIMIT ? Math.max(1, Number(process.env.REFRESH_LIMIT)) : null;
const LOG_EVERY = Math.max(1, Number(process.env.REFRESH_LOG_EVERY || "25"));

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractShopAttributes(html) {
  const attrs = {};
  const tableMatch = html.match(
    /<table[^>]*class="[^"]*woocommerce-product-attributes[^"]*shop_attributes[^"]*"[^>]*>[\s\S]*?<\/table>/i,
  );
  if (!tableMatch) return attrs;
  const tableHtml = tableMatch[0];
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let m;
  while ((m = rowRe.exec(tableHtml)) !== null) {
    const row = m[1];
    const th = row.match(/<th[^>]*>([\s\S]*?)<\/th>/i);
    const td = row.match(/<td[^>]*>([\s\S]*?)<\/td>/i);
    if (!th || !td) continue;
    const label = stripHtml(th[1]).trim();
    const value = stripHtml(td[1]).trim();
    if (label && value) attrs[label] = value;
  }
  return attrs;
}

function extractConditionFromStock(html) {
  const boundary = html.indexOf("woocommerce-product-attributes shop_attributes");
  const slice = boundary > 0 ? html.slice(0, boundary) : html;
  const m = slice.match(/class="stock[^"]*step-(\d)/);
  if (!m) return null;
  const map = { 1: "Хорошее", 2: "Отличное", 3: "Новое" };
  return map[m[1]] || null;
}

function mapAlfaAttributes(attrs, brandFallback) {
  const brand = attrs["Бренды"] || brandFallback;
  return {
    brand,
    size: attrs["Размер"] || null,
    material: attrs["Материал"] || null,
    color: attrs["Цвет"] || null,
    gender: attrs["Пол"] || null,
    completeness: attrs["Комплект"] || attrs["Комплектность"] || null,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": "resale-shopping-attrs-refresh/1.1" } });
  if (!res.ok) return "";
  return res.text();
}

async function main() {
  const products = await prisma.product.findMany({
    where: { slug: { not: { startsWith: "gift-card" } } },
    select: { id: true, slug: true, brand: true },
    orderBy: { createdAt: "asc" },
    ...(LIMIT ? { take: LIMIT } : {}),
  });

  console.log(
    `[attrs-refresh] Товаров: ${products.length}, пакеты по ${BATCH_SIZE} запросов, пауза ${DELAY_MS}ms между пакетами (${BASE_URL})`,
  );
  let updated = 0;
  let skipped = 0;
  let done = 0;
  const t0 = Date.now();

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const urls = batch.map((p) => `${BASE_URL}/product/${p.slug}/`);
    let htmls;
    try {
      htmls = await Promise.all(urls.map((url) => fetchHtml(url)));
    } catch {
      for (const p of batch) {
        skipped += 1;
        done += 1;
        logProgress(done, products.length, updated, skipped);
      }
      if (DELAY_MS) await sleep(DELAY_MS);
      continue;
    }

    for (let j = 0; j < batch.length; j += 1) {
      const p = batch[j];
      const html = htmls[j] || "";
      done += 1;

      if (!html || html.length < 500) {
        skipped += 1;
        logProgress(done, products.length, updated, skipped);
        continue;
      }

      const attrs = extractShopAttributes(html);
      const attrFields = mapAlfaAttributes(attrs, p.brand);
      const conditionLabel = extractConditionFromStock(html);

      const data = {};
      if (attrFields.brand && attrFields.brand.trim()) data.brand = attrFields.brand.trim();
      if (attrFields.size) data.size = attrFields.size;
      if (attrFields.material) data.material = attrFields.material;
      if (attrFields.color) data.color = attrFields.color;
      if (attrFields.gender) data.gender = attrFields.gender;
      if (attrFields.completeness) data.completeness = attrFields.completeness;
      if (conditionLabel) data.conditionLabel = conditionLabel;

      if (Object.keys(data).length === 0) {
        skipped += 1;
        logProgress(done, products.length, updated, skipped);
        continue;
      }

      try {
        await prisma.product.update({ where: { id: p.id }, data });
        updated += 1;
      } catch (e) {
        console.warn(`[attrs-refresh] Ошибка update ${p.slug}:`, e?.message || e);
        skipped += 1;
      }
      logProgress(done, products.length, updated, skipped);
    }

    if (DELAY_MS) await sleep(DELAY_MS);
  }

  console.log(`[attrs-refresh] Готово за ${((Date.now() - t0) / 1000).toFixed(1)}s: обновлено ${updated}, пропуск/ошибки ${skipped}`);
}

function logProgress(done, total, updated, skipped) {
  if (done === 1 || done % LOG_EVERY === 0 || done === total) {
    console.log(`[attrs-refresh] ${done}/${total} … обновлено ${updated}, пропуск ${skipped}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

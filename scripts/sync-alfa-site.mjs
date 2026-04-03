import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";

const prisma = new PrismaClient();

const BASE_URL = "https://alfa-resale.ru";

/** Лог каждые N товаров (можно SYNC_LOG_EVERY=1 для каждого). */
const LOG_EVERY = Math.max(1, Number(process.env.SYNC_LOG_EVERY || "5"));

function fmtSec(ms) {
  return `${(ms / 1000).toFixed(1)}s`;
}

const PAGE_SLUGS = [
  "about",
  "prodaja",
  "pokupka",
  "delivery",
  "assurance",
  "brands",
  "koncepcia",
  "rassrochka",
  "oferta",
  "prodat",
];

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "resale-shopping-migrator/1.0" },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${url}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)));
    }
  }

  return null;
}

function classListToArray(classList) {
  if (!classList || typeof classList !== "object") return [];
  return Object.values(classList).map((v) => String(v));
}

function extractPriceMinor(html) {
  const priceBlockMatch = html.match(/<p class="price">([\s\S]*?)<\/p>/i);
  if (!priceBlockMatch) return 0;

  const amountMatches = [...priceBlockMatch[1].matchAll(/woocommerce-Price-amount amount"><bdi>([\d\s]+)&nbsp;/g)];
  if (amountMatches.length === 0) return 0;

  const preferred = amountMatches.length > 1 ? amountMatches[amountMatches.length - 1][1] : amountMatches[0][1];
  const value = Number(String(preferred).replace(/\s+/g, ""));
  if (!Number.isFinite(value)) return 0;
  return value * 100;
}

function extractGalleryImages(html) {
  const matches = [...html.matchAll(/woocommerce-product-gallery__image[^>]*>\s*<a[^>]*href="([^"]+)"/g)];
  const urls = matches.map((m) => m[1]);
  return [...new Set(urls)];
}

function stripHtml(html) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(input) {
  if (!input) return "";
  let s = String(input);
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number.parseInt(n, 10)));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(Number.parseInt(h, 16)));
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'");
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

function extractSku(html) {
  const m = html.match(/Артикул:\s*([A-Z0-9]+)/i);
  return m ? m[1].trim() : null;
}

/** Состояние по классу stock step-N на карточке Alfa (до блока атрибутов). */
function extractConditionFromStock(html) {
  const boundary = html.indexOf("woocommerce-product-attributes shop_attributes");
  const slice = boundary > 0 ? html.slice(0, boundary) : html;
  const m = slice.match(/class="stock[^"]*step-(\d)/);
  if (!m) return null;
  const map = { 1: "Хорошее", 2: "Отличное", 3: "Новое" };
  return map[m[1]] || null;
}

function mapAlfaAttributes(attrs, brandFromWp) {
  const brand = attrs["Бренды"] || brandFromWp;
  return {
    brand,
    size: attrs["Размер"] || null,
    material: attrs["Материал"] || null,
    color: attrs["Цвет"] || null,
    gender: attrs["Пол"] || null,
    completeness: attrs["Комплект"] || null,
  };
}

async function fetchAll(restBase, perPage = 50, label = restBase) {
  const firstUrl = `${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=1`;
  const firstRes = await fetch(firstUrl, { headers: { "User-Agent": "resale-shopping-migrator/1.0" } });
  if (!firstRes.ok) {
    throw new Error(`Failed first page: ${restBase}`);
  }

  const totalPages = Number(firstRes.headers.get("x-wp-totalpages") || "1");
  const totalItems = firstRes.headers.get("x-wp-total");
  console.log(`[sync] ${label}: всего записей ~${totalItems || "?"}, страниц API: ${totalPages}`);

  const firstData = await firstRes.json();
  const data = [...firstData];
  console.log(`[sync] ${label}: страница 1/${totalPages} (уже ${data.length})`);

  for (let page = 2; page <= totalPages; page += 1) {
    const url = `${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=${page}`;
    const part = await fetchJson(url);
    data.push(...part);
    console.log(`[sync] ${label}: страница ${page}/${totalPages} (всего ${data.length})`);
  }

  return data;
}

async function syncPages() {
  for (const slug of PAGE_SLUGS) {
    const pages = await fetchJson(`${BASE_URL}/wp-json/wp/v2/pages?slug=${slug}`);
    if (!Array.isArray(pages) || pages.length === 0) continue;

    const page = pages[0];
    const title = page.title?.rendered || slug;
    const body = stripHtml(page.content?.rendered || "");

    await prisma.landingSection.upsert({
      where: { key: `page-${slug}` },
      update: {
        title,
        body,
        isActive: true,
      },
      create: {
        key: `page-${slug}`,
        title,
        body,
        isActive: true,
      },
    });
  }
}

async function main() {
  const tStart = Date.now();
  console.log("[sync] Старт:", new Date().toISOString());
  console.log("[sync] Идёт загрузка каталога с alfa-resale.ru (долго без вывода = норма для REST)…");

  const [categories, pwbBrands, products] = await Promise.all([
    fetchAll("product_cat", 100, "категории"),
    fetchAll("pwb-brand", 100, "бренды"),
    fetchAll("product", 50, "товары (список)"),
  ]);

  console.log(
    `[sync] Списки готовы за ${fmtSec(Date.now() - tStart)}: категорий ${categories.length}, брендов ${pwbBrands.length}, товаров ${products.length}`,
  );

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const brandMap = new Map(pwbBrands.map((b) => [b.id, b.name]));

  const total = products.length;
  const estSec = total * 1.5;
  console.log(
    `[sync] Дальше: HTML каждого товара (~${total} запросов). Оценка ${Math.ceil(estSec / 60)}–${Math.ceil((estSec * 2) / 60)} мин (зависит от сети). Прогресс каждые ${LOG_EVERY} товаров.`,
  );

  let imported = 0;
  const tProducts = Date.now();

  for (let idx = 0; idx < products.length; idx += 1) {
    const item = products[idx];
    const productUrl = item.link;
    const slug = item.slug;
    const num = idx + 1;
    if (num === 1 || num % LOG_EVERY === 0 || num === total) {
      const elapsed = Date.now() - tProducts;
      const avg = num > 0 ? elapsed / num : 0;
      const eta = avg > 0 ? ((total - num) * avg) / 1000 : 0;
      console.log(
        `[sync] товар ${num}/${total} ${slug} … прошло ${fmtSec(elapsed)}${eta > 5 ? `, ост. ~${Math.ceil(eta / 60)} мин` : ""}`,
      );
    }
    const rawTitle = item.title?.rendered || slug;
    const name = decodeHtmlEntities(stripHtml(rawTitle));

    const classList = classListToArray(item.class_list);
    const stockState = classList.includes("outofstock") ? "SOLD_OUT" : classList.includes("instock") ? "ACTIVE" : "DRAFT";

    const status = item.status === "publish" ? stockState : "DRAFT";

    const categoryId = Array.isArray(item.product_cat) ? item.product_cat[0] : null;
    const cat = categoryMap.get(categoryId) || { name: "Без категории", slug: "uncategorized" };

    const category = await prisma.category.upsert({
      where: { slug: cat.slug || "uncategorized" },
      update: { name: cat.name || "Без категории", isActive: true },
      create: { name: cat.name || "Без категории", slug: cat.slug || "uncategorized", isActive: true },
    });

    const brandId = Array.isArray(item["pwb-brand"]) ? item["pwb-brand"][0] : null;
    const brand = brandMap.get(brandId) || "Unknown";

    let html = "";
    try {
      const res = await fetch(productUrl, { headers: { "User-Agent": "resale-shopping-migrator/1.0" } });
      html = res.ok ? await res.text() : "";
    } catch {
      html = "";
    }

    const priceMinor = extractPriceMinor(html);
    const gallery = extractGalleryImages(html);
    const attrs = extractShopAttributes(html);
    const attrFields = mapAlfaAttributes(attrs, brand);
    const sku = extractSku(html);
    const conditionLabel = extractConditionFromStock(html);

    const common = {
      brand: attrFields.brand,
      name,
      description: stripHtml(item.yoast_head_json?.description || ""),
      status,
      priceMinor: priceMinor || 0,
      categoryId: category.id,
      currency: "RUB",
      ...(sku ? { sku } : {}),
      ...(attrFields.size ? { size: attrFields.size } : {}),
      ...(attrFields.material ? { material: attrFields.material } : {}),
      ...(attrFields.color ? { color: attrFields.color } : {}),
      ...(attrFields.gender ? { gender: attrFields.gender } : {}),
      ...(attrFields.completeness ? { completeness: attrFields.completeness } : {}),
      ...(conditionLabel ? { conditionLabel } : {}),
    };

    const product = await prisma.product.upsert({
      where: { slug },
      update: common,
      create: {
        slug,
        ...common,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    for (const [index, url] of gallery.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: `${attrFields.brand} ${name}`,
          sortOrder: index,
        },
      });
    }

    imported += 1;
  }

  await syncPages();

  const redirects = [
    "/",
    "/catalog",
    "/about",
    "/prodaja",
    "/pokupka",
    "/delivery",
    "/assurance",
    "/brands",
    "/koncepcia",
    "/rassrochka",
    "/oferta",
    "/prodat",
    "/wishlist",
    "/cart",
  ];

  const productSlugs = await prisma.product.findMany({ select: { slug: true } });
  const map = {
    generatedAt: new Date().toISOString(),
    redirects: [
      ...redirects.map((p) => ({ from: `https://alfa-resale.ru${p}`, to: `https://resale-shopping.ru${p}` })),
      ...productSlugs.map((p) => ({
        from: `https://alfa-resale.ru/product/${p.slug}/`,
        to: `https://resale-shopping.ru/product/${p.slug}`,
      })),
    ],
  };

  await writeFile("data/redirect-map.json", JSON.stringify(map, null, 2), "utf8");

  console.log(`[sync] Готово: обработано ${imported} товаров за ${fmtSec(Date.now() - tStart)} всего.`);
  console.log("[sync] Файл редиректов: data/redirect-map.json");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

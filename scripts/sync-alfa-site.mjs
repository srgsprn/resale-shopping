import { PrismaClient } from "@prisma/client";
import { writeFile } from "node:fs/promises";

const prisma = new PrismaClient();

const BASE_URL = "https://alfa-resale.ru";

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

async function fetchAll(restBase, perPage = 50) {
  const firstUrl = `${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=1`;
  const firstRes = await fetch(firstUrl, { headers: { "User-Agent": "resale-shopping-migrator/1.0" } });
  if (!firstRes.ok) {
    throw new Error(`Failed first page: ${restBase}`);
  }

  const totalPages = Number(firstRes.headers.get("x-wp-totalpages") || "1");
  const firstData = await firstRes.json();

  const data = [...firstData];

  for (let page = 2; page <= totalPages; page += 1) {
    const url = `${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=${page}`;
    const part = await fetchJson(url);
    data.push(...part);
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
  const [categories, pwbBrands, products] = await Promise.all([
    fetchAll("product_cat", 100),
    fetchAll("pwb-brand", 100),
    fetchAll("product", 50),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const brandMap = new Map(pwbBrands.map((b) => [b.id, b.name]));

  let imported = 0;

  for (const item of products) {
    const productUrl = item.link;
    const slug = item.slug;
    const name = item.title?.rendered || slug;

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

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        brand,
        name,
        description: stripHtml(item.yoast_head_json?.description || ""),
        status,
        priceMinor: priceMinor || 0,
        categoryId: category.id,
        currency: "RUB",
      },
      create: {
        slug,
        brand,
        name,
        description: stripHtml(item.yoast_head_json?.description || ""),
        status,
        priceMinor: priceMinor || 0,
        categoryId: category.id,
        currency: "RUB",
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    for (const [index, url] of gallery.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: `${brand} ${name}`,
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

  console.log(`Synced ${imported} products.`);
  console.log("Saved redirect map: data/redirect-map.json");
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

import { writeFile } from "node:fs/promises";

const BASE_URL = "https://alfa-resale.ru";

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "resale-shopping-scraper/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 700 * (i + 1)));
    }
  }
}

function classListToArray(classList) {
  if (!classList || typeof classList !== "object") return [];
  return Object.values(classList).map(String);
}

function extractPriceMinor(html) {
  const block = html.match(/<p class="price">([\s\S]*?)<\/p>/i);
  if (!block) return 0;
  const amounts = [...block[1].matchAll(/woocommerce-Price-amount amount"><bdi>([\d\s]+)&nbsp;/g)];
  if (!amounts.length) return 0;
  const val = amounts[amounts.length - 1][1];
  const numeric = Number(String(val).replace(/\s+/g, ""));
  return Number.isFinite(numeric) ? numeric * 100 : 0;
}

function extractGallery(html) {
  const matches = [...html.matchAll(/woocommerce-product-gallery__image[^>]*>\s*<a[^>]*href="([^"]+)"/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

async function fetchAll(restBase, perPage = 50) {
  const firstRes = await fetch(`${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=1`, {
    signal: AbortSignal.timeout(20000),
  });
  if (!firstRes.ok) throw new Error(`Failed endpoint ${restBase}`);
  const totalPages = Number(firstRes.headers.get("x-wp-totalpages") || "1");
  const first = await firstRes.json();
  const all = [...first];
  for (let page = 2; page <= totalPages; page += 1) {
    const part = await fetchJson(`${BASE_URL}/wp-json/wp/v2/${restBase}?per_page=${perPage}&page=${page}`);
    all.push(...part);
  }
  return all;
}

async function main() {
  const [categories, brands, products] = await Promise.all([
    fetchAll("product_cat", 100),
    fetchAll("pwb-brand", 100),
    fetchAll("product", 50),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, { id: c.id, name: c.name, slug: c.slug }]));
  const brandMap = new Map(brands.map((b) => [b.id, b.name]));

  const exported = [];

  const limitRaw = process.env.ALFA_SCRAPE_LIMIT;
  let selected = products;
  if (limitRaw !== undefined && limitRaw !== "" && limitRaw !== "0") {
    const n = Number(limitRaw);
    if (Number.isFinite(n) && n > 0) {
      selected = products.slice(0, n);
    }
  }

  for (const [idx, p] of selected.entries()) {
    let html = "";
    try {
      const res = await fetch(p.link, {
        headers: { "User-Agent": "resale-shopping-scraper/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      html = res.ok ? await res.text() : "";
    } catch {
      html = "";
    }

    const classList = classListToArray(p.class_list);
    const stock = classList.includes("outofstock") ? "SOLD_OUT" : classList.includes("instock") ? "ACTIVE" : "DRAFT";

    const brandId = Array.isArray(p["pwb-brand"]) ? p["pwb-brand"][0] : null;
    const categoryId = Array.isArray(p.product_cat) ? p.product_cat[0] : null;

    exported.push({
      sourceId: p.id,
      slug: p.slug,
      name: p.title?.rendered || p.slug,
      brand: brandMap.get(brandId) || "Unknown",
      category: categoryMap.get(categoryId) || { name: "Без категории", slug: "uncategorized" },
      status: p.status === "publish" ? stock : "DRAFT",
      priceMinor: extractPriceMinor(html),
      currency: "RUB",
      link: p.link,
      seoTitle: p.yoast_head_json?.title || null,
      seoDescription: p.yoast_head_json?.description || null,
      images: extractGallery(html),
      updatedAt: p.modified_gmt,
    });

    if ((idx + 1) % 20 === 0) {
      console.log(`Processed ${idx + 1}/${selected.length}`);
    }
  }

  const pages = ["about", "prodaja", "pokupka", "delivery", "assurance", "brands", "koncepcia", "rassrochka", "oferta", "prodat"];
  const pagesOut = [];

  for (const slug of pages) {
    try {
      const payload = await fetchJson(`${BASE_URL}/wp-json/wp/v2/pages?slug=${slug}`);
      const page = Array.isArray(payload) ? payload[0] : null;
      if (!page) continue;
      pagesOut.push({
        slug,
        title: page.title?.rendered || slug,
        contentHtml: page.content?.rendered || "",
      });
    } catch {
      // ignore per-page errors
    }
  }

  await writeFile("data/alfa-products.json", JSON.stringify(exported, null, 2), "utf8");
  await writeFile("data/alfa-pages.json", JSON.stringify(pagesOut, null, 2), "utf8");

  const redirects = {
    generatedAt: new Date().toISOString(),
    redirects: [
      ...["", "/catalog", "/about", "/prodaja", "/pokupka", "/delivery", "/assurance", "/brands", "/koncepcia", "/rassrochka", "/oferta", "/prodat", "/wishlist", "/cart"].map((path) => ({
        from: `https://alfa-resale.ru${path}`,
        to: `https://resale-shopping.ru${path}`,
      })),
      ...exported.map((p) => ({
        from: `https://alfa-resale.ru/product/${p.slug}/`,
        to: `https://resale-shopping.ru/product/${p.slug}`,
      })),
    ],
  };

  await writeFile("data/redirect-map.json", JSON.stringify(redirects, null, 2), "utf8");
  console.log(`Saved ${exported.length} products to data/alfa-products.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

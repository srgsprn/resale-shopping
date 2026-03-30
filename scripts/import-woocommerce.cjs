/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node scripts/import-woocommerce.js data/woocommerce-products.csv");
  process.exit(1);
}

function normalizeSlug(input, fallback) {
  const val = String(input || fallback || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return val || `product-${Date.now()}`;
}

function parsePrice(raw) {
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[^0-9.,]/g, "").replace(",", ".");
  const numeric = Number(cleaned);
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 100);
}

function splitImages(imageField) {
  if (!imageField) return [];
  return String(imageField)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractCategory(raw) {
  if (!raw) return { name: "Без категории", slug: "uncategorized" };
  const first = String(raw).split(",")[0].trim();
  return {
    name: first || "Без категории",
    slug: normalizeSlug(first, "uncategorized"),
  };
}

function mapStatus(status, stockStatus) {
  const s = String(status || "").toLowerCase();
  const stock = String(stockStatus || "").toLowerCase();
  if (s === "publish" && stock === "instock") return "ACTIVE";
  if (s === "publish" && stock === "outofstock") return "SOLD_OUT";
  if (s === "draft") return "DRAFT";
  return "ARCHIVED";
}

async function main() {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const content = fs.readFileSync(absolutePath, "utf8");

  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    bom: true,
  });

  let imported = 0;

  for (const row of rows) {
    const name = row.Name || row.name || row.Title || row.title;
    if (!name) continue;

    const slug = normalizeSlug(row.Slug || row.slug, name);
    const categoryRaw = row.Categories || row.categories;
    const categoryData = extractCategory(categoryRaw);

    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: { name: categoryData.name, isActive: true },
      create: { name: categoryData.name, slug: categoryData.slug, isActive: true },
    });

    const regularPrice = parsePrice(row["Regular price"] || row.regular_price || row.Price || row.price);
    const salePrice = parsePrice(row["Sale price"] || row.sale_price);
    const priceMinor = salePrice > 0 ? salePrice : regularPrice;

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        brand: row.Brands || row.brand || row.Brand || "Unknown",
        name,
        shortName: row["Short description"] || row.short_description || null,
        description: row.Description || row.description || null,
        sku: row.SKU || row.sku || null,
        priceMinor,
        compareAtMinor: salePrice > 0 ? regularPrice : null,
        status: mapStatus(row.Status || row.status, row["Stock status"] || row.stock_status),
        categoryId: category.id,
      },
      create: {
        slug,
        brand: row.Brands || row.brand || row.Brand || "Unknown",
        name,
        shortName: row["Short description"] || row.short_description || null,
        description: row.Description || row.description || null,
        sku: row.SKU || row.sku || null,
        priceMinor,
        compareAtMinor: salePrice > 0 ? regularPrice : null,
        status: mapStatus(row.Status || row.status, row["Stock status"] || row.stock_status),
        categoryId: category.id,
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    const images = splitImages(row.Images || row.images);
    for (const [index, url] of images.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: `${product.brand} ${product.name}`,
          sortOrder: index,
        },
      });
    }

    imported += 1;
  }

  console.log(`Imported ${imported} products from ${filePath}`);
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

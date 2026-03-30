import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const statusMap = {
  ACTIVE: "ACTIVE",
  SOLD_OUT: "SOLD_OUT",
  DRAFT: "DRAFT",
  ARCHIVED: "ARCHIVED",
};

function mapStatus(s) {
  return statusMap[s] || "DRAFT";
}

async function main() {
  const productsRaw = await readFile("data/alfa-products.json", "utf8");
  const pagesRaw = await readFile("data/alfa-pages.json", "utf8").catch(() => "[]");

  const products = JSON.parse(productsRaw);
  const pages = JSON.parse(pagesRaw);

  let count = 0;

  for (const row of products) {
    const slug = row.slug;
    const name = row.name || slug;
    const brand = row.brand || "Unknown";
    const cat = row.category || { name: "Без категории", slug: "uncategorized" };
    const catSlug = cat.slug || "uncategorized";

    const category = await prisma.category.upsert({
      where: { slug: catSlug },
      update: { name: cat.name || catSlug, isActive: true },
      create: { name: cat.name || catSlug, slug: catSlug, isActive: true },
    });

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        brand,
        name,
        description: row.seoDescription || null,
        priceMinor: row.priceMinor || 0,
        status: mapStatus(row.status),
        categoryId: category.id,
        currency: row.currency || "RUB",
      },
      create: {
        slug,
        brand,
        name,
        description: row.seoDescription || null,
        priceMinor: row.priceMinor || 0,
        status: mapStatus(row.status),
        categoryId: category.id,
        currency: row.currency || "RUB",
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: product.id } });

    const images = Array.isArray(row.images) ? row.images : [];
    for (const [index, url] of images.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          alt: `${brand} ${name}`,
          sortOrder: index,
        },
      });
    }

    count += 1;
  }

  for (const page of pages) {
    const key = `page-${page.slug}`;
    const title = page.title || page.slug;
    const body = (page.contentHtml || "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    await prisma.landingSection.upsert({
      where: { key },
      update: { title, body, isActive: true },
      create: { key, title, body, isActive: true },
    });
  }

  console.log(`Imported ${count} products, ${pages.length} page snapshots.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

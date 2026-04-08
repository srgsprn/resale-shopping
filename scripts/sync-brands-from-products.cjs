/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

async function uniqueSlug(base) {
  const root = base || "brand";
  for (let n = 0; n < 500; n++) {
    const slug = n === 0 ? root : `${root}-${n}`;
    const exists = await prisma.brand.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
  }
  return `${root}-${Date.now()}`;
}

async function main() {
  const rows = await prisma.product.findMany({
    where: { brand: { not: "" } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  let created = 0;
  for (const r of rows) {
    const name = r.brand.trim();
    if (!name) continue;
    const existing = await prisma.brand.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    if (existing) continue;

    const slug = await uniqueSlug(slugify(name));
    await prisma.brand.create({
      data: { name, slug, isVisible: true },
    });
    created++;
  }

  console.log(`Brands synced from products: created ${created}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

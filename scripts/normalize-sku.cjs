/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function isValidRsSku(sku) {
  return typeof sku === "string" && /^RS[0-9A-Z-]+$/.test(sku.toUpperCase());
}

async function main() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, sku: true },
  });

  const used = new Set();
  for (const p of products) {
    const sku = (p.sku || "").trim().toUpperCase();
    if (isValidRsSku(sku)) used.add(sku);
  }

  let cursor = 1;
  function nextSku() {
    while (used.has(`RS${String(cursor).padStart(5, "0")}`)) cursor++;
    const sku = `RS${String(cursor).padStart(5, "0")}`;
    used.add(sku);
    cursor++;
    return sku;
  }

  let updated = 0;
  for (const p of products) {
    const sku = (p.sku || "").trim().toUpperCase();
    if (isValidRsSku(sku)) continue;
    const newSku = nextSku();
    await prisma.product.update({
      where: { id: p.id },
      data: { sku: newSku },
    });
    updated++;
  }

  console.log(`SKU normalized: updated ${updated} products`);
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

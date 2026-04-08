/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function normalizeName(name) {
  return String(name || "")
    .replace(/\s*[-–—]?\s*resale\s*shopping\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });

  let updated = 0;
  for (const p of products) {
    const next = normalizeName(p.name);
    if (next && next !== p.name) {
      await prisma.product.update({
        where: { id: p.id },
        data: { name: next },
      });
      updated++;
    }
  }
  console.log(`Product names normalized: ${updated}`);
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

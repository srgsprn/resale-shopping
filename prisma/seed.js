/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Сумки", slug: "bags", sortOrder: 1 },
    { name: "Обувь", slug: "shoes", sortOrder: 2 },
    { name: "Ювелирные украшения", slug: "jewelry", sortOrder: 3 },
    { name: "Аксессуары", slug: "accessories", sortOrder: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const bagCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "bags" } });

  const products = [
    {
      slug: "chanel-classic-flap-black",
      brand: "Chanel",
      name: "Classic Flap",
      sku: "A2024001",
      conditionLabel: "Отличное",
      priceMinor: 56000000,
      status: "ACTIVE",
      categoryId: bagCategory.id,
      currency: "RUB",
      isFeatured: false,
      images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200"],
    },
    {
      slug: "louis-vuitton-capucines",
      brand: "Louis Vuitton",
      name: "Capucines",
      sku: "A2024002",
      conditionLabel: "Новое",
      priceMinor: 69000000,
      status: "ACTIVE",
      categoryId: bagCategory.id,
      currency: "RUB",
      isFeatured: false,
      images: ["https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=1200"],
    },
    {
      slug: "ysl-loulou-bag",
      brand: "Saint Laurent",
      name: "Loulou",
      sku: "A2024003",
      conditionLabel: "Отличное",
      priceMinor: 16900000,
      status: "ACTIVE",
      categoryId: bagCategory.id,
      currency: "RUB",
      isFeatured: true,
      images: ["https://alfa-resale.ru/wp-content/uploads/2026/03/YSL-Loulou-1.jpg"],
    },
  ];

  for (const product of products) {
    const { images, ...data } = product;

    const created = await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    await prisma.productImage.deleteMany({ where: { productId: created.id } });

    for (const [index, url] of images.entries()) {
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url,
          alt: `${created.brand} ${created.name}`,
          sortOrder: index,
        },
      });
    }
  }

  const accCategory = await prisma.category.findUnique({ where: { slug: "accessories" } });
  if (accCategory) {
    const giftImage =
      "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80";
    const giftCards = [
      { slug: "gift-card-50000", name: "Подарочная карта 50 000 ₽", priceMinor: 50_000 * 100 },
      { slug: "gift-card-100000", name: "Подарочная карта 100 000 ₽", priceMinor: 100_000 * 100 },
      { slug: "gift-card-500000", name: "Подарочная карта 500 000 ₽", priceMinor: 500_000 * 100 },
    ];

    for (const gc of giftCards) {
      const created = await prisma.product.upsert({
        where: { slug: gc.slug },
        update: {
          brand: "Resale Shopping",
          name: gc.name,
          priceMinor: gc.priceMinor,
          status: "ACTIVE",
          categoryId: accCategory.id,
          currency: "RUB",
        },
        create: {
          slug: gc.slug,
          brand: "Resale Shopping",
          name: gc.name,
          priceMinor: gc.priceMinor,
          status: "ACTIVE",
          categoryId: accCategory.id,
          currency: "RUB",
        },
      });

      await prisma.productImage.deleteMany({ where: { productId: created.id } });
      await prisma.productImage.create({
        data: {
          productId: created.id,
          url: giftImage,
          alt: gc.name,
          sortOrder: 0,
        },
      });
    }
  }

  const templates = [
    {
      key: "luxury",
      subject: "Your order has been placed",
      body: "Luxury template",
      isDefault: false,
    },
    {
      key: "neutral",
      subject: "Order confirmed",
      body: "Neutral template",
      isDefault: false,
    },
    {
      key: "premium-resale",
      subject: "Ваш заказ оформлен",
      body: "Premium-resale template",
      isDefault: true,
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: template,
      create: template,
    });
  }
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

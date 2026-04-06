/**
 * Однократно или после смены пароля: создаёт/обновляет учётку админа по логину.
 * Переменные окружения (или значения по умолчанию):
 *   ADMIN_LOGIN (default admin)
 *   ADMIN_PASSWORD (default ilovepringles) — смените в production
 *   ADMIN_EMAIL (default <login>@resale-shopping.local)
 *
 * Запуск из корня репо:
 *   npm run admin:ensure
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath) && !process.env.DATABASE_URL) {
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const prisma = new PrismaClient();

async function main() {
  const login = (process.env.ADMIN_LOGIN || "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ilovepringles";
  const email = (process.env.ADMIN_EMAIL || `${login}@resale-shopping.local`).trim().toLowerCase();

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.credentialUser.upsert({
    where: { email },
    update: {
      login,
      passwordHash,
      role: "ADMIN",
      name: "Администратор",
    },
    create: {
      email,
      login,
      passwordHash,
      role: "ADMIN",
      name: "Администратор",
    },
  });

  console.log(`OK: login="${login}", email=${email} (роль ADMIN)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

-- Восстановление после сбоя Prisma P3009 на миграции 20260407120000_admin_schema_brand_seo_roles.
-- Идемпотентно: можно выполнять несколько раз.
--
-- На VPS (из корня репо, с подставленным DATABASE_URL):
--   npx prisma migrate resolve --rolled-back "20260407120000_admin_schema_brand_seo_roles"
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/repair-failed-migration-20260407120000.sql
--   npx prisma migrate resolve --applied "20260407120000_admin_schema_brand_seo_roles"
--   npx prisma migrate deploy
--
-- Если psql нет: npx prisma db execute --file scripts/repair-failed-migration-20260407120000.sql

-- Enums
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'MANAGER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SeoPageType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'STATIC', 'BLOG', 'PROMOTION', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CredentialUser
DO $$ BEGIN
  ALTER TABLE "CredentialUser" ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER'::"UserRole";
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CredentialUser" ADD COLUMN "image" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CredentialUser" ADD COLUMN "phone" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CredentialUser" ADD COLUMN "telegram" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "CredentialUser_role_idx" ON "CredentialUser"("role");

-- Brand
CREATE TABLE IF NOT EXISTS "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "h1" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Brand_slug_key" ON "Brand"("slug");
CREATE INDEX IF NOT EXISTS "Brand_isVisible_idx" ON "Brand"("isVisible");
CREATE INDEX IF NOT EXISTS "Brand_sortOrder_idx" ON "Brand"("sortOrder");

-- Category
DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "parentId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "seoTitle" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "seoDescription" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Category" ADD COLUMN "h1" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX IF NOT EXISTS "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX IF NOT EXISTS "Category_sortOrder_idx" ON "Category"("sortOrder");

-- Product
DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "brandId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "shortDescription" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "seoTitle" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "seoDescription" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "h1" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "canonical" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "ogTitle" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD COLUMN "ogDescription" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX IF NOT EXISTS "Product_createdAt_idx" ON "Product"("createdAt");

-- ProductImage
DO $$ BEGIN
  ALTER TABLE "ProductImage" ADD COLUMN "isMain" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ProductImage" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Order
DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "adminComment" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "telegram" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "city" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "country" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "source" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD COLUMN "credentialUserId" TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_credentialUserId_fkey" FOREIGN KEY ("credentialUserId") REFERENCES "CredentialUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "Order_credentialUserId_idx" ON "Order"("credentialUserId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt");

-- OrderItem
DO $$ BEGIN
  ALTER TABLE "OrderItem" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- SitePageSEO
CREATE TABLE IF NOT EXISTS "SitePageSEO" (
    "id" TEXT NOT NULL,
    "pageType" "SeoPageType" NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "h1" TEXT,
    "canonical" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "robotsIndex" BOOLEAN NOT NULL DEFAULT true,
    "robotsFollow" BOOLEAN NOT NULL DEFAULT true,
    "textBlock" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SitePageSEO_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SitePageSEO_pageType_slug_key" ON "SitePageSEO"("pageType", "slug");
CREATE INDEX IF NOT EXISTS "SitePageSEO_pageType_idx" ON "SitePageSEO"("pageType");
CREATE INDEX IF NOT EXISTS "SitePageSEO_slug_idx" ON "SitePageSEO"("slug");

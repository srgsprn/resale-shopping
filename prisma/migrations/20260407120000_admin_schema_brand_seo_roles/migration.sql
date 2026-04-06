-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SeoPageType" AS ENUM ('PRODUCT', 'CATEGORY', 'BRAND', 'COLLECTION', 'STATIC', 'BLOG', 'PROMOTION', 'CUSTOM');

-- AlterTable CredentialUser
ALTER TABLE "CredentialUser" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN     "image" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "telegram" TEXT;

-- CreateIndex
CREATE INDEX "CredentialUser_role_idx" ON "CredentialUser"("role");

-- CreateTable Brand
CREATE TABLE "Brand" (
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

CREATE UNIQUE INDEX "Brand_slug_key" ON "Brand"("slug");
CREATE INDEX "Brand_isVisible_idx" ON "Brand"("isVisible");
CREATE INDEX "Brand_sortOrder_idx" ON "Brand"("sortOrder");

-- AlterTable Category
ALTER TABLE "Category" ADD COLUMN     "parentId" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "h1" TEXT;

ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET ON UPDATE CASCADE;

CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- AlterTable Product
ALTER TABLE "Product" ADD COLUMN     "brandId" TEXT,
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "h1" TEXT,
ADD COLUMN     "canonical" TEXT,
ADD COLUMN     "ogTitle" TEXT,
ADD COLUMN     "ogDescription" TEXT;

ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Product_brandId_idx" ON "Product"("brandId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- AlterTable ProductImage
ALTER TABLE "ProductImage" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable Order
ALTER TABLE "Order" ADD COLUMN     "adminComment" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "credentialUserId" TEXT;

ALTER TABLE "Order" ADD CONSTRAINT "Order_credentialUserId_fkey" FOREIGN KEY ("credentialUserId") REFERENCES "CredentialUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Order_credentialUserId_idx" ON "Order"("credentialUserId");
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- AlterTable OrderItem
ALTER TABLE "OrderItem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable SitePageSEO
CREATE TABLE "SitePageSEO" (
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

CREATE UNIQUE INDEX "SitePageSEO_pageType_slug_key" ON "SitePageSEO"("pageType", "slug");
CREATE INDEX "SitePageSEO_pageType_idx" ON "SitePageSEO"("pageType");
CREATE INDEX "SitePageSEO_slug_idx" ON "SitePageSEO"("slug");

-- Catalog filters and sort: status + price, status + createdAt, category + status
CREATE INDEX IF NOT EXISTS "Product_priceMinor_idx" ON "Product"("priceMinor");
CREATE INDEX IF NOT EXISTS "Product_status_priceMinor_idx" ON "Product"("status", "priceMinor");
CREATE INDEX IF NOT EXISTS "Product_status_createdAt_idx" ON "Product"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_categoryId_status_idx" ON "Product"("categoryId", "status");

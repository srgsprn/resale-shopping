-- Снижаем цены всех товаров на 19 000 ₽ (1 900 000 в minor).
-- Защита от ухода в отрицательные значения.
UPDATE "Product"
SET
  "priceMinor" = GREATEST("priceMinor" - 1900000, 0),
  "compareAtMinor" = CASE
    WHEN "compareAtMinor" IS NULL THEN NULL
    ELSE GREATEST("compareAtMinor" - 1900000, 0)
  END;

-- Бренд и подписи к фото: убираем «& Arpels» и сущность &amp; для лота Vintage Alhambra
UPDATE "Product"
SET brand = 'Van Cleef', "updatedAt" = NOW()
WHERE slug = 'van-cleef-arpels-vintage-alhambra-2';

UPDATE "ProductImage" AS pi
SET alt = TRIM(
    REPLACE(
      REPLACE(pi.alt, 'Van Cleef &amp; Arpels', 'Van Cleef'),
      'Van Cleef & Arpels',
      'Van Cleef'
    )
  )
WHERE pi."productId" IN (
  SELECT id FROM "Product" WHERE slug = 'van-cleef-arpels-vintage-alhambra-2'
);

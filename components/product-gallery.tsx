"use client";

import { useState } from "react";

import { ProductImage, ProductImageFixed, PRODUCT_IMAGE_PLACEHOLDER } from "@/components/product-image";

type ProductGalleryImage = {
  url: string;
  alt: string | null;
};

export function ProductGallery({ images, productName }: { images: ProductGalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const safeImages =
    images.length > 0 ? images : [{ url: PRODUCT_IMAGE_PLACEHOLDER, alt: productName }];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#d9d2c8] bg-white">
        <ProductImage
          src={safeImages[active]?.url || safeImages[0].url}
          alt={safeImages[active]?.alt || productName}
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
        />
      </div>
      {safeImages.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {safeImages.map((image, idx) => (
            <button
              key={`${image.url}-${idx}`}
              type="button"
              onClick={() => setActive(idx)}
              className={`overflow-hidden rounded-xl border ${
                idx === active ? "border-zinc-900" : "border-[#d9d2c8]"
              }`}
              aria-label={`Фото ${idx + 1}`}
            >
              <ProductImageFixed
                src={image.url}
                alt={image.alt || productName}
                width={120}
                height={120}
                className="aspect-square w-full object-cover"
                sizes="10vw"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";

type ProductGalleryImage = {
  url: string;
  alt: string | null;
};

export function ProductGallery({ images, productName }: { images: ProductGalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const safeImages =
    images.length > 0 ? images : [{ url: "https://placehold.co/1000x1200/f4f4f5/18181b?text=Resale", alt: productName }];

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeImages[active]?.url || safeImages[0].url}
        alt={safeImages[active]?.alt || productName}
        className="mx-auto w-full max-h-[min(72vh,640px)] rounded-2xl border border-[#d9d2c8] bg-white object-cover lg:max-h-none"
      />
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.alt || productName} className="aspect-square w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

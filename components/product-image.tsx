import Image from "next/image";

export const PRODUCT_IMAGE_PLACEHOLDER = "https://placehold.co/800x800/f4f4f5/18181b?text=Resale";

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
};

/** Оптимизированное фото товара (WebP/resize через next/image). */
export function ProductImage({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 320px",
  loading,
}: ProductImageProps) {
  return (
    <Image
      src={src || PRODUCT_IMAGE_PLACEHOLDER}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      loading={loading}
    />
  );
}

type ProductImageFixedProps = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Для галереи с фиксированными превью. */
export function ProductImageFixed({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = "20vw",
}: ProductImageFixedProps) {
  return (
    <Image
      src={src || PRODUCT_IMAGE_PLACEHOLDER}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}

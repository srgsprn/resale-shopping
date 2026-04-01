export type WishlistItem = {
  id: string;
  slug: string;
  brand: string;
  name: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
  status: string;
};

function key(userKey: string) {
  return `wishlist:${userKey}`;
}

export function readWishlist(userKey: string): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(userKey)) || "[]";
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeWishlist(userKey: string, items: WishlistItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(userKey), JSON.stringify(items));
  window.dispatchEvent(new Event("resale-wishlist-updated"));
}

export function toggleWishlistItem(userKey: string, item: WishlistItem) {
  const current = readWishlist(userKey);
  const exists = current.some((entry) => entry.id === item.id);
  if (exists) {
    writeWishlist(
      userKey,
      current.filter((entry) => entry.id !== item.id),
    );
    return false;
  }
  writeWishlist(userKey, [item, ...current]);
  return true;
}

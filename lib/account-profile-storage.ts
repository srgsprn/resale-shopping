/** Профиль в localStorage (без отдельного бэкенда). */

const avatarKey = (email: string) => `resale-avatar:${email.toLowerCase()}`;

export type StoredAvatar = { type: "preset"; id: string } | { type: "upload"; dataUrl: string };

export function getStoredAvatar(email: string): StoredAvatar | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(avatarKey(email));
    if (!raw) return null;
    const j = JSON.parse(raw) as StoredAvatar;
    if (j?.type === "preset" && typeof j.id === "string") return j;
    if (j?.type === "upload" && typeof j.dataUrl === "string" && j.dataUrl.startsWith("data:image/")) return j;
  } catch {
    /* ignore */
  }
  return null;
}

export function setStoredAvatar(email: string, value: StoredAvatar) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(avatarKey(email), JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function clearStoredAvatar(email: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(avatarKey(email));
  } catch {
    /* ignore */
  }
}

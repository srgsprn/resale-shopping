/**
 * Убирает из названия фрагменты в скобках, если внутри есть латиница
 * (часто дубли slug / англ. подписи в импортах).
 */
export function stripLatinParentheticals(name: string): string {
  let t = name;
  let prev = "";
  while (t !== prev) {
    prev = t;
    t = t.replace(/\s*\([^)]*[A-Za-z][^)]*\)/g, "");
  }
  return t.replace(/\s{2,}/g, " ").trim() || name.trim();
}

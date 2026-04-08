export function stripResaleShoppingSuffix(input: string): string {
  const value = (input || "").trim();
  if (!value) return value;
  return value
    .replace(/\s*[-–—]?\s*resale\s*shopping\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

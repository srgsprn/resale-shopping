/** Декодирует типичные HTML-сущности (в т.ч. &#8217; из WordPress) для корректного title в UI. */
export function decodeHtmlEntities(input: string): string {
  if (!input) return "";
  let s = input;
  s = s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number.parseInt(n, 10)));
  s = s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(Number.parseInt(h, 16)));
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\u201c")
    .replace(/&#8221;/g, "\u201d");
}

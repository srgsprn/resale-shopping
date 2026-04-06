import { decodeHtmlEntities } from "@/lib/html-entities";
import { formatMoney } from "@/lib/money";

export type ProductSeoInput = {
  name: string;
  shortName?: string | null;
  brand: string;
  categoryName: string;
  categorySlug: string;
  conditionLabel?: string | null;
  color?: string | null;
  material?: string | null;
  gender?: string | null;
  priceMinor: number;
  currency: string;
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function collapseSpaces(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

/** Убираем повтор бренда в начале названия для короткой SEO-модели. */
function remainderAfterLeadingBrand(text: string, brand: string): string {
  const t = text.trim();
  const b = brand.trim();
  if (!b) return t;
  const re = new RegExp(`^${escapeRegExp(b)}\\s*[-–—:.]?\\s*`, "i");
  const rest = t.replace(re, "").trim();
  return rest.length >= 2 ? rest : t;
}

function primaryModelLine(name: string, shortName: string | null | undefined, brand: string): string {
  const raw = collapseSpaces(decodeHtmlEntities(shortName?.trim() || name.trim()));
  return collapseSpaces(remainderAfterLeadingBrand(raw, decodeHtmlEntities(brand)));
}

/**
 * Слово категории в роде «сумка», «ремень» — для низкочастотных запросов.
 * Сначала словарь по slug (как в импортах), затем эвристики по названию.
 */
export function seoProductTypeWord(categoryName: string, categorySlug: string): string {
  const slug = categorySlug.toLowerCase();

  const bySlug: Record<string, string> = {
    sumki: "сумка",
    bags: "сумка",
    "sumki-zhenskie": "сумка",
    remni: "ремень",
    belts: "ремень",
    pojasa: "ремень",
    chasy: "часы",
    watches: "часы",
    ukrasheniya: "украшение",
    jewel: "украшение",
    jewelry: "украшение",
    sergi: "серьги",
    kolca: "кольцо",
    koltso: "кольцо",
    braslety: "браслет",
    odezhda: "одежда",
    obuv: "обувь",
    aksessuary: "аксессуар",
    koshelki: "кошелёк",
    koshelchiki: "кошелёк",
    wallets: "кошелёк",
    ochki: "очки",
    perchatki: "перчатки",
    sharfy: "шарф",
    palantiny: "палантин",
    remeshki: "ремешок",
  };

  if (bySlug[slug]) return bySlug[slug];
  for (const [key, word] of Object.entries(bySlug)) {
    if (slug.includes(key)) return word;
  }

  const n = categoryName.trim().toLowerCase();
  if (!n) return "лот";

  if (/ремн|пояс|belt/i.test(categoryName)) return "ремень";
  if (/час|watch/i.test(categoryName)) return "часы";
  if (/сумк|bag/i.test(categoryName)) return "сумка";
  if (/украш|jewel/i.test(categoryName)) return "украшение";
  if (/кошел|wallet/i.test(categoryName)) return "кошелёк";
  if (/обув|shoe/i.test(categoryName)) return "обувь";

  if (n.endsWith("ки")) return `${n.slice(0, -2)}ка`;
  if (n.endsWith("ы")) return `${n.slice(0, -1)}а`;

  return n;
}

function truncateUtf16(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max - 1).trimEnd();
  return `${slice}…`;
}

export type ProductSeoBundle = {
  /** Сегмент для `metadata.title` (к layout добавляется ` | resale-shopping.ru`). */
  metaTitle: string;
  metaDescription: string;
  /** Для `metadata.keywords` */
  keywords: string[];
  /** Видимый H1 */
  h1: string;
  /** Развёрнутый абзац внизу карточки */
  footerParagraph: string;
};

const TITLE_MAX_BEFORE_TEMPLATE = 52;

export function buildProductSeo(input: ProductSeoInput): ProductSeoBundle {
  const brand = collapseSpaces(decodeHtmlEntities(input.brand));
  const name = collapseSpaces(decodeHtmlEntities(input.name));
  const model = primaryModelLine(name, input.shortName, brand);
  const type = seoProductTypeWord(input.categoryName, input.categorySlug);
  const condition = (input.conditionLabel && input.conditionLabel.trim()) || "отличное";
  const color =
    input.color && input.color.trim() && !/^уточня/i.test(input.color.trim())
      ? input.color.trim()
      : "";
  const material =
    input.material && input.material.trim() && !/^уточня/i.test(input.material.trim())
      ? input.material.trim()
      : "";

  const titleSuffix = "отличного качества на ресейл";
  let metaTitle = collapseSpaces(`${type} ${model} ${brand} ${titleSuffix}`);

  const overhead = `${type} ${brand} ${titleSuffix}`.length + 2;
  if (metaTitle.length > TITLE_MAX_BEFORE_TEMPLATE) {
    const budget = Math.max(6, TITLE_MAX_BEFORE_TEMPLATE - overhead);
    const shortened = truncateUtf16(model, budget);
    metaTitle = collapseSpaces(`${type} ${shortened} ${brand} ${titleSuffix}`);
  }

  const priceStr = formatMoney(input.priceMinor, input.currency);

  const metaDescription = truncateUtf16(
    collapseSpaces(
      `${capitalizeRu(type)} ${brand} ${model} — оригинал, состояние «${condition}». Люкс-ресейл Resale Shopping: цена ${priceStr}, доставка по России, подлинность.`,
    ),
    158,
  );

  const genderRaw = input.gender?.trim() ?? "";
  const genderKw =
    genderRaw && !/^уточня/i.test(genderRaw) ? `${genderRaw.toLowerCase()} ${brand}` : null;

  const keywords = uniqueKeywords(
    [
      `${brand} ${model}`,
      `${brand} купить`,
      `${type} ${brand}`,
      `${brand} б у`,
      `${brand} ресейл`,
      model.length > 1 && model !== brand ? model : null,
      "люкс ресейл",
      "оригинал б у",
      input.categoryName.trim().toLowerCase(),
      color ? `${brand} ${color.toLowerCase()}` : null,
      genderKw,
    ].filter((x): x is string => Boolean(x && x.trim())),
  );

  const h1 = collapseSpaces(`${capitalizeRu(type)} ${model} ${brand} — купить на ресейл`);

  const detailBits: string[] = [];
  if (color) detailBits.push(`оттенок: ${color}`);
  if (material) detailBits.push(`материал: ${material}`);
  const detail = detailBits.length ? ` ${detailBits.join(", ")}.` : "";

  const footerParagraph = collapseSpaces(
    `В каталоге Resale Shopping — ${type} ${brand} ${model} (${condition}).${detail} Это подлинная вещь премиум-сегмента на ${priceStr}; подходит для запросов вроде «${brand} купить бу» или «${brand} ${model}» в сегменте ресейла. Оригинал, бережная проверка, доставка по России — удобный способ купить бренд б/у без витринной наценки.`,
  );

  return {
    metaTitle,
    metaDescription,
    keywords,
    h1,
    footerParagraph,
  };
}

function capitalizeRu(s: string) {
  if (!s) return s;
  return s.charAt(0).toLocaleUpperCase("ru-RU") + s.slice(1);
}

function uniqueKeywords(parts: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(p.trim());
  }
  return out.slice(0, 18);
}

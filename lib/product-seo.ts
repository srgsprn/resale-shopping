import { decodeHtmlEntities } from "@/lib/html-entities";
import { formatMoney } from "@/lib/money";

export type ProductSeoInput = {
  slug: string;
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

type NounGender = "f" | "m" | "n" | "pl";

function typeGender(type: string): NounGender {
  const map: Record<string, NounGender> = {
    сумка: "f",
    одежда: "f",
    обувь: "f",
    ремень: "m",
    аксессуар: "m",
    браслет: "m",
    шарф: "m",
    палантин: "m",
    ремешок: "m",
    кошелёк: "m",
    лот: "m",
    украшение: "n",
    кольцо: "n",
    часы: "pl",
    серьги: "pl",
    очки: "pl",
    перчатки: "pl",
  };
  return map[type] ?? "m";
}

function demonstrative(type: string): string {
  switch (typeGender(type)) {
    case "f":
      return "Эта";
    case "m":
      return "Этот";
    case "n":
      return "Это";
    default:
      return "Эти";
  }
}

/** Прилагательное в начале title с согласованием по роду типа товара. */
function conditionLeadAdjective(conditionRaw: string, type: string): string {
  const c = conditionRaw.toLowerCase();
  const g = typeGender(type);

  if (/нов|new/i.test(c)) {
    if (g === "f") return "новая";
    if (g === "m") return "новый";
    if (g === "n") return "новое";
    return "новые";
  }
  if (/отлич|идеал|превосход/i.test(c)) {
    if (g === "f") return "безупречная";
    if (g === "m") return "безупречный";
    if (g === "n") return "безупречное";
    return "безупречные";
  }
  if (/хорош|состоян/i.test(c)) {
    if (g === "f") return "актуальная";
    if (g === "m") return "актуальный";
    if (g === "n") return "актуальное";
    return "актуальные";
  }

  if (g === "f") return "брендовая";
  if (g === "m") return "брендовый";
  if (g === "n") return "брендовое";
  return "брендовые";
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

function fnv1a32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDistinctIndices(seed: number, len: number, count: number): number[] {
  if (len <= 0) return [];
  const out: number[] = [];
  let salt = 0;
  while (out.length < Math.min(count, len)) {
    const idx = (seed + salt * 2654435761) % len;
    salt++;
    if (!out.includes(idx)) out.push(idx);
    if (salt > len * 4) break;
  }
  return out;
}

function truncateUtf16(s: string, max: number): string {
  if (s.length <= max) return s;
  const slice = s.slice(0, max - 1).trimEnd();
  return `${slice}…`;
}

export type ProductSeoBundle = {
  /** Полный смысловой title без суффикса домена (для `title.absolute` или шаблона). */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  h1: string;
  /** 2–3 коротких «человеческих» предложения под контекст лота. */
  microcopyParagraphs: string[];
  /** Фактологичный абзац внизу карточки. */
  footerParagraph: string;
  /** Рекомендованный SEO URL (как подсказка для контента). */
  suggestedUrl: string;
};

const META_TITLE_MAX_CORE = 60;

function transliterateToSlug(input: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };

  const lower = input.toLowerCase();
  let out = "";
  for (const ch of lower) {
    out += map[ch] ?? ch;
  }
  return out
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildMarketingParagraphs(ctx: {
  slug: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  categoryName: string;
  condition: string;
}): string[] {
  const dem = demonstrative(ctx.type);
  const seed = fnv1a32(`${ctx.slug}|${ctx.brand}|${ctx.model}`);

  const pool: string[] = [
    `${dem} ${ctx.type} ${ctx.brand} — находка для тех, кто любит люкс без витринной наценки и ценит оригинальную фурнитуру.`,
    `Модель ${ctx.model} от ${ctx.brand} давно стала узнаваемым знаком статуса — спокойная роскошь без лишнего шума.`,
    `${ctx.brand} ${ctx.model}: вещь, за которой в премиальном сегменте присматривают внимательно; на ресейле она выглядит особенно логично по цене.`,
    `Если вы давно смотрели в сторону ${ctx.brand}, эта позиция — повод оформить заказ и получить проверенную подлинность с доставкой.`,
    `Такие позиции разбирают быстро: узнаваемый силуэт и брендовая детализация редко остаются в каталоге надолго.`,
    `${dem} ${ctx.type} легко впишется и в деловой капсулу, и в вечерний образ — универсальный «якорь» гардероба.`,
    `Для ценителей качества: ощутимая текстура, аккуратные швы и фурнитура, на которую вы смотрите в первую очередь.`,
    `Культовая линейка: её узнают с первого взгляда — а мы помогаем купить ближе к разумной цене, чем в рознице.`,
  ];

  if (/сумк/i.test(ctx.type) || /сумк/i.test(ctx.categoryName)) {
    pool.push(
      `Сумки ${ctx.brand} с таким настроением редко появляются на ресейле — модель ${ctx.model} давно в топе у тех, кто следит за трендами.`,
      `Если коротко: это та самая «статусная» сумка, которую хотят носить и днём, и вечером — без компромиссов по узнаваемости.`,
      `Справедливо сказать: ${ctx.model} от ${ctx.brand} — из тех моделей, за которыми охотятся в премиальном ресейле — заметный акцент в образе без лишней демонстрации.`,
    );
  }
  if (/рем|пояс|ремень/i.test(ctx.type) || /рем/i.test(ctx.categoryName)) {
    pool.push(
      `Ремень ${ctx.brand} с такой пряжкой — маленькая деталь, которая сильно портит или красит весь образ.`,
    );
  }
  if (/час/i.test(ctx.type) || /час/i.test(ctx.categoryName)) {
    pool.push(
      `Часы ${ctx.brand} — про точность образа: дисциплина линий и брендовый код, который заметен на расстоянии вытянутой руки.`,
    );
  }
  if (/украш|серьг|кольц|браслет/i.test(ctx.type) || /украш/i.test(ctx.categoryName)) {
    pool.push(
      `Свет и фактура металла здесь работают мягко — украшение ${ctx.brand} добавляет «дорогого» блика без кричащего эффекта.`,
    );
  }

  if (ctx.color) {
    pool.push(
      `Оттенок ${ctx.color.toLowerCase()} выглядит благородно на живых фото — отличный выбор, если хотите модель «не как у всех».`,
    );
  }

  const idx = pickDistinctIndices(seed, pool.length, 3);
  return idx.map((i) => pool[i]).filter(Boolean);
}

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

  const adj = conditionLeadAdjective(condition, type);
  const fallbackModel = model || name || input.slug;
  const titleCore = collapseSpaces(`${adj} ${type} ${brand} ${fallbackModel} — resale shopping`);

  const fixed = collapseSpaces(`${adj} ${type} ${brand} — resale shopping`).length + 1;
  let metaTitle = titleCore;
  if (metaTitle.length > META_TITLE_MAX_CORE) {
    const budget = Math.max(4, META_TITLE_MAX_CORE - fixed);
    const shortened = truncateUtf16(fallbackModel, budget);
    metaTitle = collapseSpaces(`${adj} ${type} ${brand} ${shortened} — resale shopping`);
  }

  const priceStr = formatMoney(input.priceMinor, input.currency);

  const microcopyParagraphs = buildMarketingParagraphs({
    slug: input.slug,
    type,
    brand,
    model,
    color,
    categoryName: input.categoryName,
    condition,
  });

  const leadMicro = microcopyParagraphs[0] ?? "";
  const metaDescription = truncateUtf16(
    collapseSpaces(
      `${metaTitle} на resale-shopping.ru. ${leadMicro} Состояние «${condition}», цена ${priceStr}. Оригинал и доставка по России.`,
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
      "resale shopping",
      model.length > 1 && model !== brand ? model : null,
      "люкс ресейл",
      "оригинал б у",
      input.categoryName.trim().toLowerCase(),
      color ? `${brand} ${color.toLowerCase()}` : null,
      genderKw,
    ].filter((x): x is string => Boolean(x && x.trim())),
  );

  const h1 = capitalizeFirstRu(metaTitle);

  const detailBits: string[] = [];
  if (color) detailBits.push(`оттенок: ${color}`);
  if (material) detailBits.push(`материал: ${material}`);
  const detail = detailBits.length ? ` ${detailBits.join(", ")}.` : "";

  const footerParagraph = collapseSpaces(
    `В каталоге Resale Shopping — ${type} ${brand} ${model}: категория «${input.categoryName}», состояние «${condition}».${detail} Актуальная цена ${priceStr}. Оригинал премиум-сегмента, проверка подлинности и доставка по России — разумный способ купить люкс на ресейле без витринной наценки.`,
  );

  const suggestedUrl = `/${transliterateToSlug(input.categoryName || type)}/${transliterateToSlug(
    `${brand} ${fallbackModel}`,
  )}`;

  return {
    metaTitle,
    metaDescription,
    keywords,
    h1,
    microcopyParagraphs,
    footerParagraph,
    suggestedUrl,
  };
}

function capitalizeFirstRu(s: string) {
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

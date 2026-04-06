type SeoPageType =
  | "product"
  | "category"
  | "brand"
  | "collection"
  | "article"
  | "blog"
  | "promotion"
  | "static"
  | "system";

export type PageSeoInput = {
  pageType: SeoPageType;
  topic: string;
  titleName: string;
  details?: {
    category?: string;
    brand?: string;
    name?: string;
    condition?: string;
    season?: string;
    discount?: string;
    collection?: string;
  };
  keywords?: string[];
};

export type PageSeoOutput = {
  title: string;
  description: string;
  url: string;
  textDescription: [string, string, string];
};

function clean(s?: string) {
  return (s || "").trim();
}

function limit(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function slugify(input: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y",
    к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
    х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  const lower = input.toLowerCase();
  let out = "";
  for (const ch of lower) out += map[ch] ?? ch;
  return out
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function buildPageSeo(input: PageSeoInput): PageSeoOutput {
  const topic = clean(input.topic);
  const titleName = clean(input.titleName);
  const details = input.details || {};
  const category = clean(details.category);
  const brand = clean(details.brand);
  const name = clean(details.name) || titleName;
  const condition = clean(details.condition);
  const season = clean(details.season);
  const collection = clean(details.collection);
  const discount = clean(details.discount);

  if (input.pageType === "system") {
    const fallbackTitle = titleName || "Системная страница";
    return {
      title: limit(`${fallbackTitle} — resale-shopping.ru`, 60),
      description: "Страница не найдена — проверьте адрес или вернитесь на главную resale-shopping.ru.",
      url: `/${slugify(topic || "system") || "system"}`,
      textDescription: [
        "Проверьте правильность адреса страницы и обновите запрос.",
        "Вернитесь в каталог или на главную, чтобы продолжить поиск.",
        "Если ошибка повторяется, воспользуйтесь навигацией сайта resale-shopping.ru.",
      ],
    };
  }

  let title = `${titleName} — resale-shopping.ru`;
  let description = `${titleName} — страница сайта resale-shopping.ru, посвящённая ${topic || "моде и люкс-ресейлу"}.`;
  let url = `/${slugify(topic || titleName || "page")}`;
  let textDescription: [string, string, string] = [
    `${titleName} раскрывает тему ${topic || "fashion e-commerce"} в удобном и понятном формате.`,
    "Мы сохраняем акцент на подлинности, качестве и актуальных поступлениях.",
    "Изучайте страницу и подбирайте вещи, которые подходят вашему стилю.",
  ];

  if (input.pageType === "product") {
    title = `${condition || "Стильная"} ${category || "вещь"} ${brand} ${name} — resale shopping`;
    description = `Откройте оригинальные ${category || "вещи"} ${brand} ${name} — стиль, качество и проверка подлинности на resale-shopping.ru.`;
    url = `/${slugify(category || "product")}/${slugify(`${brand} ${name}`)}`;
    textDescription = [
      `${category || "Вещь"} ${brand} ${name} — акцентная модель для тех, кто ценит характерный дизайн и премиальные материалы.`,
      "Сбалансированный силуэт, фирменные детали и подлинность делают покупку уверенной и практичной.",
      `Оформляйте заказ на resale-shopping.ru и добавляйте в гардероб люкс с живым характером.`,
    ];
  } else if (input.pageType === "category") {
    title = `${category || titleName} — купить онлайн на resale-shopping.ru`;
    description = `Выберите ${category || titleName} в resale-shopping.ru: оригинальные вещи, актуальные модели и проверка подлинности перед покупкой.`;
    url = `/${slugify(category || titleName)}`;
    textDescription = [
      `${category || titleName} в каталоге resale-shopping.ru собраны в одном разделе для быстрого и удобного выбора.`,
      "Мы регулярно обновляем ассортимент, чтобы вы находили актуальные модели без лишнего поиска.",
      "Каждая позиция проходит проверку, а покупка остаётся понятной и прозрачной.",
    ];
  } else if (input.pageType === "brand") {
    title = `${brand || titleName} — оригинальные вещи на resale-shopping.ru`;
    description = `${brand || titleName}: одежда и аксессуары с проверкой подлинности, актуальные модели и уверенная покупка на resale-shopping.ru.`;
    url = `/${slugify(brand || titleName)}`;
    textDescription = [
      `Бренд ${brand || titleName} — узнаваемый стиль и сильный модный характер в одном разделе.`,
      "Здесь собраны вещи, которые легко вписать в современный гардероб и носить с удовольствием каждый день.",
      "Проверка подлинности и аккуратная селекция помогают выбирать без лишних сомнений.",
    ];
  } else if (input.pageType === "collection") {
    title = `Коллекция ${brand || ""} ${season || collection || titleName} — свежие поступления resale-shopping.ru`;
    description = `Коллекция ${brand || titleName}: новые поступления, узнаваемый стиль и проверка подлинности на resale-shopping.ru.`;
    url = `/${slugify(brand || "collection")}/${slugify(collection || season || titleName)}`;
    textDescription = [
      `Коллекция ${brand || titleName} сочетает узнаваемые коды бренда и актуальное настроение сезона.`,
      "Мы собрали позиции, которые работают как в капсуле на каждый день, так и в акцентных образах.",
      "Смотрите свежие поступления и выбирайте вещи, которые сохраняют ценность дольше одного сезона.",
    ];
  } else if (input.pageType === "article" || input.pageType === "blog") {
    title = `${titleName} — советы и новости fashion индустрии`;
    description = `${titleName}: полезные советы, тренды и новости из мира люксовой моды на resale-shopping.ru.`;
    url = `/blog/${slugify(titleName || topic || "article")}`;
    textDescription = [
      "Материал помогает быстро разобраться в теме и применить идеи на практике.",
      "Мы пишем живо и по делу: без перегруза, но с акцентом на реальные тренды и выбор вещей.",
      "Читайте блог resale-shopping.ru, чтобы держать стиль и покупки под контролем.",
    ];
  } else if (input.pageType === "promotion") {
    title = `Скидки до ${discount || "40"}% на ${category || titleName} — resale-shopping.ru`;
    description = `Акция на ${category || titleName}: выгодные цены, оригинальные вещи и быстрая доставка по России на resale-shopping.ru.`;
    url = `/sale/${slugify(category || titleName || "promotion")}`;
    textDescription = [
      `Скидки на ${category || titleName} помогают обновить гардероб с заметной выгодой и без компромиссов по качеству.`,
      "В подборке участвуют только проверенные позиции с понятной историей и состоянием.",
      "Выбирайте свои модели сейчас — лучшие предложения обычно забирают первыми.",
    ];
  }

  if (input.keywords?.length) {
    const key = input.keywords.filter(Boolean).slice(0, 2).join(", ");
    description = limit(`${description} Ключевые темы: ${key}.`, 160);
  }

  return {
    title: limit(title, 60),
    description: limit(description, 160),
    url,
    textDescription,
  };
}


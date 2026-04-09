"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-md border border-[#d9d2c8] bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none ring-zinc-400 focus:border-[#a16f39] focus:ring-1";

const labelClass = "block text-sm font-medium text-zinc-800";

type Props = {
  /** После успешной отправки (закрыть модалку и т.п.) */
  onSent?: () => void;
  /** Убрать внешнюю «карточку» (для модалки, где рамка снаружи) */
  bare?: boolean;
};

export function SellFormFields({ onSent, bare }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [purchasePlace, setPurchasePlace] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState<"max" | "phone" | "telegram">("phone");
  const [agree, setAgree] = useState(false);

  const contactLabel = contact === "telegram" ? "Никнейм" : "Телефон";
  const contactPlaceholder = contact === "telegram" ? "@username" : "+7";

  const onContactValueChange = (raw: string) => {
    if (contact === "telegram") {
      const cleaned = raw.replace(/\s+/g, "").replace(/^@+/, "");
      setPhone(`@${cleaned}`);
      return;
    }
    const digits = raw.replace(/\D+/g, "");
    if (!digits) {
      setPhone("+7");
      return;
    }
    if (digits.startsWith("7")) {
      setPhone(`+${digits}`);
      return;
    }
    setPhone(`+7${digits}`);
  };

  const onContactTypeChange = (next: "max" | "phone" | "telegram") => {
    setContact(next);
    setPhone((prev) => {
      const trimmed = prev.trim();
      if (next === "telegram") {
        if (!trimmed || trimmed === "+7") return "@";
        if (trimmed.startsWith("@")) return trimmed;
        const fromPhone = trimmed.replace(/\D+/g, "");
        return fromPhone ? `@${fromPhone}` : "@";
      }
      const digits = trimmed.replace(/\D+/g, "");
      if (!digits) return "+7";
      if (digits.startsWith("7")) return `+${digits}`;
      return `+7${digits}`;
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!agree) {
      setError("Нужно согласие на обработку персональных данных.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/sell-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName.trim(),
          category,
          brand: brand.trim(),
          condition,
          purchasePlace: purchasePlace.trim(),
          description: description.trim(),
          price: price.trim(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          contact,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Не удалось отправить. Попробуйте позже или напишите на help@resale-shopping.ru");
        return;
      }
      setDone(true);
      onSent?.();
    } catch {
      setError("Сеть недоступна. Напишите на help@resale-shopping.ru");
    } finally {
      setPending(false);
    }
  }

  const inner = (
    <>
      <div className="mb-6 border-b border-[#ebe6df] pb-4">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Оставьте свои данные</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Мы свяжемся с вами в ближайшее время и расскажем все условия приёма и продажи вашей вещи.
        </p>
      </div>

      {done ? (
        <p className="rounded-lg border border-[#d9d2c8] bg-[#f0ebe3] px-4 py-3 text-sm text-zinc-800">
          Заявка отправлена. Спасибо! Менеджер свяжется с вами по указанным контактам.
        </p>
      ) : (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div>
            <label htmlFor="sell-product" className={labelClass}>
              Наименование товара <span className="text-red-600">*</span>
            </label>
            <input
              id="sell-product"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={inputClass}
              placeholder="Например: сумка Louis Vuitton Alma"
            />
          </div>
          <div>
            <label htmlFor="sell-cat" className={labelClass}>
              Категория <span className="text-red-600">*</span>
            </label>
            <select
              id="sell-cat"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите</option>
              <option value="Сумки и аксессуары">Сумки и аксессуары</option>
              <option value="Одежда">Одежда</option>
              <option value="Обувь">Обувь</option>
              <option value="Часы">Часы</option>
              <option value="Украшения">Украшения</option>
              <option value="Другое">Другое</option>
            </select>
          </div>
          <div>
            <label htmlFor="sell-brand" className={labelClass}>
              Бренд <span className="text-red-600">*</span>
            </label>
            <input
              id="sell-brand"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="sell-cond" className={labelClass}>
              Состояние <span className="text-red-600">*</span>
            </label>
            <select
              id="sell-cond"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className={inputClass}
            >
              <option value="">Выберите</option>
              <option value="Новое с бирками">Новое с бирками</option>
              <option value="Отличное">Отличное</option>
              <option value="Хорошее">Хорошее</option>
              <option value="Удовлетворительное">Удовлетворительное</option>
            </select>
          </div>
          <div>
            <label htmlFor="sell-where" className={labelClass}>
              Где приобретали
            </label>
            <input
              id="sell-where"
              value={purchasePlace}
              onChange={(e) => setPurchasePlace(e.target.value)}
              className={inputClass}
              placeholder="Бутик, онлайн, подарок…"
            />
          </div>
          <div>
            <label htmlFor="sell-desc" className={labelClass}>
              Описание и комплектация <span className="text-red-600">*</span>
            </label>
            <textarea
              id="sell-desc"
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Размер, цвет, комплектность, дефекты…"
            />
          </div>
          <div>
            <label htmlFor="sell-price" className={labelClass}>
              Желаемая цена, ₽
            </label>
            <input
              id="sell-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
              placeholder="Например: 120 000"
            />
          </div>

          <div className="border-t border-[#ebe6df] pt-4">
            <p className="text-sm font-medium text-zinc-800">Контактные данные</p>
          </div>
          <div>
            <label htmlFor="sell-name" className={labelClass}>
              Ваше имя <span className="text-red-600">*</span>
            </label>
            <input
              id="sell-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="sell-phone" className={labelClass}>
              {contactLabel} <span className="text-red-600">*</span>
            </label>
            <input
              id="sell-phone"
              type={contact === "telegram" ? "text" : "tel"}
              required
              autoComplete={contact === "telegram" ? "off" : "tel"}
              value={phone}
              onChange={(e) => onContactValueChange(e.target.value)}
              className={inputClass}
              placeholder={contactPlaceholder}
            />
          </div>
          <div>
            <label htmlFor="sell-email" className={labelClass}>
              Email <span className="text-red-600">*</span>
            </label>
            <input
              id="sell-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <fieldset>
            <legend className={labelClass}>Как с вами связаться?</legend>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-800">
              {(
                [
                  ["max", "MAX"],
                  ["phone", "Телефон"],
                  ["telegram", "Telegram"],
                ] as const
              ).map(([v, lab]) => (
                <label key={v} className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="sell-contact"
                    checked={contact === v}
                    onChange={() => onContactTypeChange(v)}
                    className="h-4 w-4 border-[#d9d2c8] text-[#a16f39]"
                  />
                  {lab}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#d9d2c8] text-[#a16f39]"
            />
            <span>
              Нажимая на кнопку «Отправить», вы соглашаетесь на обработку персональных данных в соответствии с политикой
              конфиденциальности.
            </span>
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full border border-[#8a7a6a] bg-gradient-to-r from-[#d9c4a8] to-[#c4ae95] py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-900 shadow-sm transition hover:brightness-105 disabled:opacity-50"
          >
            {pending ? "Отправка…" : "Отправить"}
          </button>
        </form>
      )}
    </>
  );

  if (bare) {
    return <div className="text-left">{inner}</div>;
  }

  return (
    <div className="rounded-[24px] border border-[#d9d2c8] bg-[#faf8f5] p-6 shadow-sm md:p-8">{inner}</div>
  );
}

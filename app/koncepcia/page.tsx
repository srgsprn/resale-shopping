const conceptCards = [
  {
    title: "Как продавать",
    text: "Вы создаете заявку, добавляете честное описание и фото. Менеджер забирает лот, организует проверку и выводит товар на витрину.",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Как покупать",
    text: "Покупатель видит детальные фото и характеристики, выбирает удобный способ оплаты и получает прозрачные статусы заказа.",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Аутентификация",
    text: "Используем многоуровневую проверку: анализ изображений, сверка параметров, экспертная оценка материалов и фурнитуры.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ConceptPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-9">
        <h1 className="text-3xl font-semibold tracking-tight">Наша Концепция</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 md:text-base">
          Мы строим премиальную resale-платформу, где продавать и покупать брендовые вещи удобно, прозрачно и безопасно.
          Основой концепции остается подлинность, понятный клиентский путь и сервис сопровождения на каждом этапе.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {conceptCards.map((card) => (
          <article key={card.title} className="overflow-hidden rounded-2xl border border-[#d9d2c8] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.image} alt={card.title} className="h-44 w-full object-cover" />
            <div className="space-y-2 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">{card.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-700">{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

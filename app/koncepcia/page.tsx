const conceptCards = [
  {
    title: "Как продавать",
    text: "Вы создаете заявку, добавляете честное описание и фото. Менеджер забирает лот, организует проверку и выводит товар на витрину.",
    image: "https://alfa-resale.ru/wp-content/uploads/2026/01/IMG_3731-2048x1143.jpeg",
  },
  {
    title: "Как покупать",
    text: "Покупатель видит детальные фото и характеристики, выбирает удобный способ оплаты и получает прозрачные статусы заказа.",
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Аутентификация",
    text: "Используем многоуровневую проверку: анализ изображений, сверка параметров, экспертная оценка материалов и фурнитуры.",
    image:
      "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site914994/4fb0d04c-815c-4c61-858e-c86daf4e2931/4fb0d04c-815c-4c61-858e-c86daf4e2931-11806704.jpeg",
  },
];

export default function ConceptPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Концепция</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-800 md:text-sm">
            Три опорных направления сервиса: продажа, покупка и строгая аутентификация каждого лота.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {conceptCards.map((card) => (
          <article key={card.title} className="overflow-hidden rounded-2xl border border-[#d9d2c8] bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.image} alt={card.title} className="h-52 w-full object-cover md:h-60" />
            <div className="space-y-2 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-900">{card.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-700">{card.text}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

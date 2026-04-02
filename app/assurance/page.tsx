export default function AssurancePage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-6 md:p-9">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Гарантия подлинности</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-800 md:text-base">
              Мы глубоко уважаем ваше доверие и придаем огромное значение обеспечению подлинности всех товаров на нашей
              платформе. В работе используются современные методики аутентификации, включая сервисы, признанные во всем
              мире.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://alfa-resale.ru/wp-content/uploads/2026/01/IMG_3730-1024x572.jpeg"
            alt="Гарантия подлинности"
            className="h-full min-h-[240px] w-full object-cover"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-[#d9d2c8] bg-white p-6">
        <h2 className="text-lg font-semibold">Процесс аутентификации</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>В первую очередь анализируем фото товара и сверяем с базами на предмет несоответствий.</li>
          <li>
            После поступления товара в офис он передается в отдел аутентификации, где эксперты оценивают каждую единицу.
          </li>
          <li>В промежуточных этапах могут использоваться дополнительные сервисы проверки.</li>
          <li>При выявлении неоригинальной продукции товар не поступает в продажу.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[#d9d2c8] bg-white p-6">
        <h2 className="text-lg font-semibold">Ваша защита</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
          <li>Товар поставляется с сертификатом и фирменной биркой, подтверждающей оригинальность.</li>
          <li>
            Если товар не соответствует характеристикам на платформе, покупатель может вернуть его в установленный срок
            при сохранности бирки и пломбы.
          </li>
          <li>Профессиональная служба поддержки помогает при спорных ситуациях и вопросах по проверке.</li>
        </ul>
      </section>

    </div>
  );
}

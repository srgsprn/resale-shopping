export default function AccountOrdersPage() {
  return (
    <section className="rounded-xl border border-[#d9d2c8] bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900">Мои заказы</h2>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        История заказов и статусы доставки можно уточнить у персонального менеджера:{" "}
        <a href="mailto:help@resale-shopping.ru" className="text-[#7c5430] underline-offset-2 hover:underline">
          help@resale-shopping.ru
        </a>{" "}
        или по телефону на сайте. Скоро здесь появится полноценный список заказов.
      </p>
    </section>
  );
}

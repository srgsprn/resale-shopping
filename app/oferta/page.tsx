const documents = [
  {
    title: "Агентский договор",
    href: "/oferta-docs/agentskiy-dogovor.pdf",
  },
  {
    title: "Договор купли-продажи",
    href: "/oferta-docs/dogovor-kupli-prodazhi.pdf",
  },
  {
    title: "Пользовательское соглашение",
    href: "/oferta-docs/polzovatelskoe-soglashenie.pdf",
  },
  {
    title: "Оферта Яндекс Сплит",
    href: "/oferta-docs/oferta-yandex-split.pdf",
  },
  {
    title: "Лицензии",
    href: "/oferta-docs/licenzii.pdf",
  },
];

export default function OfertaPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-[#d9d2c8] bg-white p-6 md:p-9">
        <h1 className="text-3xl font-semibold tracking-tight">Оферта</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-700 md:text-base">
          Нажмите на нужный документ, чтобы открыть его в новой вкладке и скачать в PDF.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {documents.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-[#d9d2c8] bg-[#f8f6f2] p-5 transition hover:border-[#c6b9aa] hover:bg-white"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-800">{doc.title}</p>
            <p className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-700">Открыть и скачать PDF</p>
          </a>
        ))}
      </div>
    </section>
  );
}

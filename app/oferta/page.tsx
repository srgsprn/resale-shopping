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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[24px] border border-[#d9d2c8] bg-gradient-to-r from-[#eee4d8] via-[#e8d9c6] to-[#decbb5]">
        <div className="p-5 md:p-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Оферта</h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-800 md:text-sm">
            Нажмите на нужный документ, чтобы открыть его в новой вкладке и скачать в PDF.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {documents.map((doc) => (
          <a
            key={doc.href}
            href={doc.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl border border-[#d9d2c8] bg-white p-5 transition hover:border-[#c6b9aa]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-zinc-800">{doc.title}</p>
            <p className="mt-2 text-xs text-zinc-500 group-hover:text-zinc-700">Открыть и скачать PDF</p>
          </a>
        ))}
      </div>
    </div>
  );
}

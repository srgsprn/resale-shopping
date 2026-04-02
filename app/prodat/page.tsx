import { SellFormFields } from "@/components/sell-form-fields";

export default function ProdatPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6 pb-8">
      <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">Продать</h1>
      <p className="text-center text-sm text-zinc-600">
        Заполните форму — менеджер свяжется с вами и подскажет следующие шаги.
      </p>
      <SellFormFields />
    </div>
  );
}

"use client";

import { useSellForm } from "@/components/sell-form-context";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

/** Кнопка «Продать» на странице «Как продать» — открывает ту же форму, что и в шапке. */
export function OpenSellFormButton({ className, children = "Продать" }: Props) {
  const { openSellForm } = useSellForm();

  return (
    <button type="button" onClick={openSellForm} className={className}>
      {children}
    </button>
  );
}

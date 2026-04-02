"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { SellFormModal } from "@/components/sell-form-modal";

type Ctx = {
  openSellForm: () => void;
  closeSellForm: () => void;
};

const SellFormContext = createContext<Ctx | null>(null);

export function SellFormProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSellForm = useCallback(() => setOpen(true), []);
  const closeSellForm = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ openSellForm, closeSellForm }), [openSellForm, closeSellForm]);

  return (
    <SellFormContext.Provider value={value}>
      {children}
      <SellFormModal open={open} onClose={closeSellForm} />
    </SellFormContext.Provider>
  );
}

export function useSellForm() {
  const ctx = useContext(SellFormContext);
  if (!ctx) {
    throw new Error("useSellForm must be used within SellFormProvider");
  }
  return ctx;
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ConfirmDeleteModal } from "@/components/admin/confirm-delete-modal";

type Props = {
  id: string;
  label: string;
};

export function ProductDeleteButton({ id, label }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const onConfirm = () => {
    start(async () => {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const j = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        toast.error(j.error || "Не удалось удалить");
        return;
      }
      toast.success("Товар удалён");
      setOpen(false);
      router.refresh();
      router.push("/admin/products");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-red-700 underline-offset-2 hover:underline"
      >
        Удалить
      </button>
      <ConfirmDeleteModal
        open={open}
        title="Удалить товар?"
        description={<span>«{label}» — необратимо, если товар не фигурирует в заказах.</span>}
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={onConfirm}
      />
    </>
  );
}

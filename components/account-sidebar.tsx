"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { clearStoredAvatar, getStoredAvatar, setStoredAvatar, type StoredAvatar } from "@/lib/account-profile-storage";

const PRESETS = [
  { id: "sand", className: "bg-[#d9a35b] text-white" },
  { id: "coffee", className: "bg-[#7c5430] text-white" },
  { id: "clay", className: "bg-[#b8a99a] text-white" },
  { id: "dust", className: "bg-[#9c8b7a] text-white" },
  { id: "moss", className: "bg-[#5c5348] text-white" },
  { id: "cream", className: "bg-[#e8dccf] text-zinc-800" },
] as const;

type User = {
  name?: string | null;
  email: string;
  image?: string | null;
};

function IconDashboard({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 5h7v7H4V5Zm9 0h7v4h-7V5ZM4 14h7v5H4v-5Zm9 3h7v2h-7v-2Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function IconBag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8Zm2 0V6a4 4 0 0 1 8 0v2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12h18M12 3a16 16 0 0 1 0 18M12 3a16 16 0 0 0 0 18" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconHeart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.65-7 10-7 10Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4 14.3 9l5.2.8-3.8 3.7.9 5.2L12 16.9 6.4 18.7l.9-5.2L3.5 9.8 8.7 9 12 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconExit({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 7H6v10h4M14 12H4M11 9l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const NAV: { href: string; label: string; icon: typeof IconDashboard }[] = [
  { href: "/account", label: "Панель управления", icon: IconDashboard },
  { href: "/account/orders", label: "Мои заказы", icon: IconBag },
  { href: "/account/address", label: "Мой адрес", icon: IconGlobe },
  { href: "/account/profile", label: "Анкета", icon: IconUser },
  { href: "/wishlist", label: "Избранное", icon: IconHeart },
  { href: "/prodaja", label: "Продать", icon: IconStar },
];

function initialLetter(name: string | null | undefined, email: string) {
  const c = (name?.trim()?.[0] || email?.[0] || "?").toUpperCase();
  return /[A-ZА-ЯЁ0-9]/i.test(c) ? c.toUpperCase() : "?";
}

export function AccountSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stored, setStored] = useState<StoredAvatar | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    setStored(getStoredAvatar(user.email));
  }, [user.email, bump]);

  const refresh = useCallback(() => setBump((x) => x + 1), []);

  const applyPreset = (id: string) => {
    setStoredAvatar(user.email, { type: "preset", id });
    refresh();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    if (f.size > 450_000) {
      window.alert("Файл слишком большой. Выберите изображение до ~400 КБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
        setStoredAvatar(user.email, { type: "upload", dataUrl });
        refresh();
      }
    };
    reader.readAsDataURL(f);
  };

  const letter = initialLetter(user.name, user.email);
  const displayName = user.name?.trim() || user.email.split("@")[0] || "Профиль";

  const renderAvatar = () => {
    if (stored?.type === "upload") {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={stored.dataUrl} alt="" className="h-24 w-24 rounded-full object-cover ring-2 ring-[#d9d2c8]" />
      );
    }
    if (stored?.type === "preset") {
      const p = PRESETS.find((x) => x.id === stored.id);
      return (
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold ring-2 ring-[#d9d2c8] ${p?.className ?? "bg-zinc-400 text-white"}`}
        >
          {letter}
        </div>
      );
    }
    if (user.image) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt="" className="h-24 w-24 rounded-full object-cover ring-2 ring-[#d9d2c8]" />
      );
    }
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-200 ring-2 ring-[#d9d2c8]">
        <IconUser className="h-12 w-12 text-zinc-500" />
      </div>
    );
  };

  return (
    <aside className="rounded-xl border-2 border-[#c9a86c] bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {renderAvatar()}
        <p className="mt-4 text-base font-semibold text-zinc-900">{displayName}</p>
        <p className="mt-1 break-all text-xs text-zinc-500">{user.email}</p>
        <button
          type="button"
          onClick={() => setPickerOpen((o) => !o)}
          className="mt-3 text-xs font-medium uppercase tracking-[0.1em] text-[#7c5430] underline-offset-4 hover:underline"
        >
          {pickerOpen ? "Свернуть" : "Аватар"}
        </button>
      </div>

      {pickerOpen ? (
        <div className="mt-4 border-t border-[#ebe6df] pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Выберите цвет</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold ring-1 ring-[#d9d2c8] transition hover:ring-2 hover:ring-[#a16f39] ${p.className}`}
                aria-label={`Пресет ${p.id}`}
              >
                {letter}
              </button>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-3 w-full rounded-md border border-[#d9d2c8] bg-[#faf8f5] py-2 text-xs font-medium text-zinc-800 transition hover:bg-[#f0ebe3]"
          >
            Загрузить фото
          </button>
          <button
            type="button"
            onClick={() => {
              clearStoredAvatar(user.email);
              refresh();
            }}
            className="mt-2 w-full text-xs text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
          >
            Сбросить свой аватар
          </button>
        </div>
      ) : null}

      <nav className="mt-6 space-y-0.5 border-t border-[#ebe6df] pt-5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active ? "bg-[#faf8f5] font-medium text-zinc-900" : "text-zinc-600 hover:bg-[#f6f3ef] hover:text-zinc-900"
              }`}
            >
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? "text-[#7c5430]" : "text-zinc-400"}`} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-[#fef2f2] hover:text-red-800"
        >
          <IconExit className="h-[18px] w-[18px] shrink-0 text-zinc-400" />
          Выход
        </button>
      </nav>
    </aside>
  );
}

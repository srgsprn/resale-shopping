import Link from "next/link";

const telegramIcon = (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
    <path
      d="M9.16 19.1 10.4 13.7 16.2 9.2c.35-.25.75-.2.58.35l-2.15 6.4c-.08.25-.32.45-.58.45L11 14.5l-1.96 1.6Z"
      fill="currentColor"
      opacity="0.95"
    />
    <path
      d="M19.6 4.8 4.9 10.7c-1.1.44-1.08 1.08-.2 1.34l3.95 1.23 7.88-6.07c.43-.31.82-.15.5.2l-6.1 7.25-.22 3.15c.42.16.72.1.98-.1l2.01-1.5 3.25 2.4c.6.33 1.1.16 1.26-.6L21 5.9c.23-1.03-.42-1.55-1.4-1.1Z"
      fill="currentColor"
    />
  </svg>
);

export function HeaderTelegramSubscribeButton() {
  return (
    <Link
      href="https://t.me/alfa_resale"
      target="_blank"
      rel="noreferrer"
      className="hidden items-center gap-2 rounded-full bg-[#dfd4c5] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6a2a24] transition hover:bg-white/70 md:inline-flex"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#229ED9] text-white">
        {telegramIcon}
      </span>
      Подписаться
    </Link>
  );
}


/**
 * Фирменный знак Яндекса: буква «Я» в красном круге (обновлённая айдентика, см. обзор на
 * https://www.sostav.ru/publication/yandeks-novyj-logotip-47931.html ).
 * Используется на кнопке входа через Яндекс ID.
 */
export function YandexMarkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="24" cy="24" r="24" fill="#FC3F1D" />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        style={{
          fontSize: "27px",
          fontWeight: 800,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          letterSpacing: "-0.02em",
        }}
      >
        Я
      </text>
    </svg>
  );
}

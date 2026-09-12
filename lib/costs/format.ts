import type { Locale } from "@/lib/i18n/config";

export function formatMoney(
  amount: number,
  currency: string,
  locale: Locale,
): string {
  const language = locale === "bn" ? "bn-BD" : "en-US";
  const whole = currency === "KRW" || currency === "BDT" || currency === "JPY";

  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    maximumFractionDigits: whole ? 0 : 2,
    minimumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

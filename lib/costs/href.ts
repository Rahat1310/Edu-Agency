import type { ProgramCountry, ProgramLevel } from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";

export function costCalculatorHref(
  locale: Locale,
  input: {
    destination?: ProgramCountry | "";
    level?: ProgramLevel | "";
    programId?: string;
  } = {},
): string {
  const params = new URLSearchParams();

  if (input.destination) {
    params.set("destination", input.destination);
  }
  if (input.level) {
    params.set("level", input.level);
  }
  if (input.programId) {
    params.set("program", input.programId);
  }

  const query = params.toString();
  const path = localizedHref("/cost-calculator", locale);
  return query ? `${path}?${query}` : path;
}

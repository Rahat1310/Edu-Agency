import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import { serializeCompareIds } from "@/lib/programs-compare";
import type { PublicProgramFilters } from "@/lib/programs-public";

export function publicProgramsHref(
  locale: Locale,
  filters: Partial<PublicProgramFilters> & { ids?: readonly string[] } = {},
): string {
  const params = new URLSearchParams();

  if (filters.country) {
    params.set("country", filters.country);
  }

  if (filters.level) {
    params.set("level", filters.level);
  }

  if (filters.field) {
    params.set("field", filters.field);
  }

  if (filters.page && filters.page > 1) {
    params.set("page", String(filters.page));
  }

  const ids = serializeCompareIds(filters.ids ?? []);
  if (ids) {
    params.set("ids", ids);
  }

  const query = params.toString();
  const path = localizedHref("/programs", locale);
  return query ? `${path}?${query}` : path;
}

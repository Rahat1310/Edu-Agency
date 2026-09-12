import { z } from "zod";

import { performanceRangeValues } from "@/lib/performance/stats";

export const performanceQuerySchema = z.object({
  range: z.enum(performanceRangeValues).catch("this_month"),
  counselor: z.string().trim().catch("all"),
});

export type PerformanceQuery = z.infer<typeof performanceQuerySchema>;

function first(
  raw: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = raw[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parsePerformanceQuery(
  raw: Record<string, string | string[] | undefined>,
): PerformanceQuery {
  return performanceQuerySchema.parse({
    range: first(raw, "range") ?? "this_month",
    counselor: first(raw, "counselor") ?? "all",
  });
}

export function performanceHref(
  query: PerformanceQuery,
  overrides: Partial<PerformanceQuery> = {},
): string {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.range !== "this_month") {
    params.set("range", next.range);
  }

  if (next.counselor && next.counselor !== "all") {
    params.set("counselor", next.counselor);
  }

  const qs = params.toString();
  return qs ? `/admin/performance?${qs}` : "/admin/performance";
}

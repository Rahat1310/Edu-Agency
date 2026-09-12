import {
  leadListQuerySchema,
  type LeadListQuery,
} from "@/lib/schemas/lead";

export type { LeadListQuery };

function first(
  raw: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = raw[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseLeadListQuery(
  raw: Record<string, string | string[] | undefined>,
): LeadListQuery {
  return leadListQuerySchema.parse({
    q: first(raw, "q") ?? "",
    destinationInterest: first(raw, "destinationInterest") ?? "",
    status: first(raw, "status") ?? "",
    sort: first(raw, "sort") ?? "created",
    page: first(raw, "page") ?? "1",
    lead: first(raw, "lead") ?? "",
  });
}

export function leadsListHref(
  query: LeadListQuery,
  overrides: Partial<LeadListQuery> = {},
): string {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();

  if (next.q) {
    params.set("q", next.q);
  }

  if (next.destinationInterest) {
    params.set("destinationInterest", next.destinationInterest);
  }

  if (next.status) {
    params.set("status", next.status);
  }

  if (next.sort !== "created") {
    params.set("sort", next.sort);
  }

  if (next.page > 1) {
    params.set("page", String(next.page));
  }

  if (next.lead) {
    params.set("lead", next.lead);
  }

  const qs = params.toString();
  return qs ? `/admin/leads?${qs}` : "/admin/leads";
}

export function leadListHasActiveFilters(query: LeadListQuery): boolean {
  return Boolean(
    query.q ||
      query.destinationInterest ||
      query.status ||
      query.sort !== "created",
  );
}

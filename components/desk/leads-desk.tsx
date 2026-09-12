"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { DeskDataTable } from "@/components/desk/data-table";
import { DeskEmptyState } from "@/components/desk/empty-state";
import {
  DeskPreviewBar,
  DeskPreviewError,
  useDeskPreview,
} from "@/components/desk/preview";
import { DeskTableSkeleton } from "@/components/desk/skeleton";
import {
  formatLeadDate,
  leadDestinationLabels,
  leadDestinationOptions,
  leadStatusLabels,
  leadStatusOptions,
} from "@/lib/leads/labels";
import type {
  LeadListResult,
  LeadListRow,
} from "@/lib/leads/list-types";
import {
  leadListHasActiveFilters,
  leadsListHref,
  type LeadListQuery,
} from "@/lib/leads/list-query";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 300;

type LeadsDeskProps = {
  query: LeadListQuery;
  list: LeadListResult;
  selectedKey?: string;
};

export function LeadsDesk({
  query,
  list,
  selectedKey,
}: LeadsDeskProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.q);
  const { preview, setPreview } = useDeskPreview();

  useEffect(() => {
    setSearch(query.q);
  }, [query.q]);

  useEffect(() => {
    if (search === query.q) {
      return;
    }

    const handle = window.setTimeout(() => {
      startTransition(() => {
        router.replace(leadsListHref(query, { q: search, page: 1 }), {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [query, router, search]);

  function replaceQuery(overrides: Partial<LeadListQuery>) {
    startTransition(() => {
      router.replace(leadsListHref(query, overrides), { scroll: false });
    });
  }

  const hasFilters = leadListHasActiveFilters(query);
  const showLoading = pending || preview === "loading";
  const showEmpty = preview === "empty" || (list.total === 0 && !hasFilters);

  if (preview === "error") {
    return (
      <div className="space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <DeskPreviewError onRetry={() => setPreview("off")} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <form
        className="grid gap-2 rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] p-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          replaceQuery({ q: search, page: 1 });
        }}
      >
        <label className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Search
          <input
            type="search"
            name="q"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, phone, or email"
            className="desk-focus mt-1 h-8 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 text-sm font-normal text-[var(--desk-ink)] normal-case"
          />
        </label>
        <label className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Destination
          <select
            name="destinationInterest"
            value={query.destinationInterest}
            onChange={(event) =>
              replaceQuery({
                destinationInterest: event.target
                  .value as LeadListQuery["destinationInterest"],
                page: 1,
              })
            }
            className="desk-focus mt-1 h-8 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 text-sm font-normal text-[var(--desk-ink)] normal-case"
          >
            <option value="">All destinations</option>
            {leadDestinationOptions.map((destination) => (
              <option key={destination} value={destination}>
                {leadDestinationLabels[destination]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          Status
          <select
            name="status"
            value={query.status}
            onChange={(event) =>
              replaceQuery({
                status: event.target.value as LeadListQuery["status"],
                page: 1,
              })
            }
            className="desk-focus mt-1 h-8 w-full rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-bg)] px-2 text-sm font-normal text-[var(--desk-ink)] normal-case"
          >
            <option value="">All statuses</option>
            {leadStatusOptions.map((status) => (
              <option key={status} value={status}>
                {leadStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold"
          >
            Apply
          </button>
          {hasFilters ? (
            <Link
              href={leadsListHref(query, {
                q: "",
                destinationInterest: "",
                status: "",
                sort: "created",
                page: 1,
              })}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] px-2.5 text-xs font-semibold text-[var(--desk-ink-muted)]"
            >
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      {showLoading ? (
        <DeskTableSkeleton columns={5} rows={8} />
      ) : showEmpty ? (
        <DeskEmptyState
          title="No leads yet"
          body="Once your marketing site starts capturing them, they'll show up here. The contact form, eligibility quiz, and WhatsApp enquiries all land in this queue."
        />
      ) : (
        <>
          <p className="text-[0.75rem] text-[var(--desk-ink-muted)]">
            {list.total} lead{list.total === 1 ? "" : "s"}
            {list.pageCount > 1
              ? ` · page ${list.page} of ${list.pageCount}`
              : null}
          </p>

          <DeskDataTable
            caption="Leads"
            columns={[
              { id: "name", header: "Name", cell: (row) => row.name },
              {
                id: "phone",
                header: "Phone / WhatsApp",
                cell: (row) => <PhoneCell row={row} />,
              },
              {
                id: "destination",
                header: "Destination",
                cell: (row) => leadDestinationLabels[row.destinationInterest],
              },
              {
                id: "status",
                header: (
                  <SortHeader
                    href={leadsListHref(query, { sort: "status", page: 1 })}
                    active={query.sort === "status"}
                    label="Status"
                  />
                ),
                cell: (row) => leadStatusLabels[row.status],
              },
              {
                id: "created",
                header: (
                  <SortHeader
                    href={leadsListHref(query, { sort: "created", page: 1 })}
                    active={query.sort === "created"}
                    label="Created"
                  />
                ),
                className: "tabular-nums",
                cell: (row) => formatLeadDate(row.createdAt),
              },
            ]}
            rows={list.rows}
            rowKey={(row) => row.id}
            selectedKey={selectedKey}
            empty="Nothing matches these filters. Clear them to see the full queue."
            onRowSelect={(row) => replaceQuery({ lead: row.id })}
            getRowLabel={(row) => `Open ${row.name}`}
          />
        </>
      )}

      {list.pageCount > 1 && !showEmpty && !showLoading ? (
        <nav
          className="flex items-center justify-between gap-3"
          aria-label="Pagination"
        >
          {list.page > 1 ? (
            <Link
              href={leadsListHref(query, { page: list.page - 1 })}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold"
            >
              Previous
            </Link>
          ) : (
            <span />
          )}
          <p className="text-[0.75rem] text-[var(--desk-ink-muted)]">
            Page {list.page} of {list.pageCount}
          </p>
          {list.page < list.pageCount ? (
            <Link
              href={leadsListHref(query, { page: list.page + 1 })}
              className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)] px-2.5 text-xs font-semibold"
            >
              Next
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}

function PhoneCell({ row }: { row: LeadListRow }) {
  if (!row.whatsapp || row.whatsapp === row.phone) {
    return row.phone;
  }

  return (
    <span>
      {row.phone}
      <span className="mt-0.5 block text-[0.7rem] text-[var(--desk-ink-muted)]">
        WA {row.whatsapp}
      </span>
    </span>
  );
}

function SortHeader({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "desk-focus rounded-[var(--desk-radius)]",
        active ? "text-[var(--desk-accent)]" : "text-[var(--desk-ink-muted)]",
      )}
      aria-current={active ? "true" : undefined}
    >
      {label}
      {active ? <span className="sr-only">, sorted</span> : null}
    </Link>
  );
}

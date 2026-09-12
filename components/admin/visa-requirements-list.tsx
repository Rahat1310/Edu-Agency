"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { VisaRequirementRowActions } from "@/components/admin/visa-requirement-row-actions";
import { DeskEmptyState } from "@/components/desk/empty-state";
import { DeskErrorState } from "@/components/desk/error-state";
import { DeskPreviewBar, useDeskPreview } from "@/components/desk/preview";
import { DeskTableSkeleton } from "@/components/desk/skeleton";
import type { ProgramCountry } from "@/db/schema";
import { programCountryLabels } from "@/lib/programs-labels";

export type VisaRequirementListRow = {
  id: string;
  destination: ProgramCountry;
  documentName: string;
  documentTypeKey: string;
  sortOrder: number;
  isPublished: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
};

export function VisaRequirementsList({
  rows,
  loadError = false,
}: {
  rows: VisaRequirementListRow[];
  loadError?: boolean;
}) {
  const router = useRouter();
  const { preview, setPreview } = useDeskPreview();
  const showLoading = preview === "loading";
  const showError = preview === "error" || (preview === "off" && loadError);
  const visibleRows = preview === "empty" ? [] : rows;

  function onRetry() {
    if (preview === "error") {
      setPreview("off");
      return;
    }

    router.refresh();
  }

  if (showLoading) {
    return (
      <div className="mt-4 space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <DeskTableSkeleton columns={6} rows={8} />
      </div>
    );
  }

  if (showError) {
    return (
      <div className="mt-4 space-y-3">
        <DeskPreviewBar preview={preview} onChange={setPreview} />
        <DeskErrorState
          title="Visa requirements could not load"
          body="Drafts and published rows are still in the database. Try again."
          onRetry={onRetry}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <DeskPreviewBar preview={preview} onChange={setPreview} />
      <p className="text-sm text-[var(--muted-foreground)]">
        {visibleRows.length} requirement{visibleRows.length === 1 ? "" : "s"}
      </p>
      {visibleRows.length === 0 ? (
        <DeskEmptyState
          title="No visa requirements yet"
          body="Add the first document for this route, or clear the filters. Unpublished rows never appear on the student checklist."
          action={
            <Link
              href="/admin/visa-requirements/new"
              className="focus-ring inline-flex min-h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-bold text-[var(--brand-navy)]"
            >
              New requirement
            </Link>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-[var(--border)] bg-[var(--brand-sky)] text-xs tracking-[0.06em] text-[var(--muted-foreground)] uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Destination</th>
                <th className="px-4 py-3 font-semibold">Document</th>
                <th className="px-4 py-3 font-semibold">Type key</th>
                <th className="px-4 py-3 font-semibold">Order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    {programCountryLabels[row.destination]}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[var(--brand-navy)]">
                    <Link
                      href={`/admin/visa-requirements/${row.id}/edit`}
                      className="focus-ring rounded-md hover:text-[var(--brand-blue)]"
                    >
                      {row.documentName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {row.documentTypeKey}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row.sortOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        row.isPublished
                          ? "rounded-full bg-[var(--brand-green)]/12 px-2.5 py-1 text-xs font-bold text-[var(--brand-green)]"
                          : "rounded-full bg-[var(--brand-amber)]/16 px-2.5 py-1 text-xs font-bold text-[var(--brand-navy)]"
                      }
                    >
                      {row.isPublished ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <VisaRequirementRowActions
                      id={row.id}
                      documentName={row.documentName}
                      isPublished={row.isPublished}
                      canMoveUp={row.canMoveUp}
                      canMoveDown={row.canMoveDown}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

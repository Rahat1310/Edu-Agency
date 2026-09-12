"use client";

import type { ReactNode } from "react";

import { DeskTableSkeleton } from "@/components/desk/skeleton";
import { cn } from "@/lib/utils";

export type DeskTableColumn<T> = {
  id: string;
  header: ReactNode;
  className?: string;
  cell: (row: T) => ReactNode;
};

type DeskDataTableProps<T> = {
  columns: DeskTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption?: string;
  empty: ReactNode;
  loading?: boolean;
  onRowSelect?: (row: T) => void;
  selectedKey?: string;
  getRowLabel?: (row: T) => string;
};

export function DeskDataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  empty,
  loading = false,
  onRowSelect,
  selectedKey,
  getRowLabel,
}: DeskDataTableProps<T>) {
  if (loading) {
    return <DeskTableSkeleton columns={columns.length} />;
  }

  return (
    <div className="overflow-x-auto rounded-[var(--desk-radius)] border border-[var(--desk-line)] bg-[var(--desk-surface)]">
      <table className="w-full min-w-[40rem] border-collapse text-left text-[0.8125rem]">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="bg-[var(--desk-surface-muted)] text-[0.68rem] font-semibold tracking-[0.06em] text-[var(--desk-ink-muted)] uppercase">
          <tr>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                className={cn("px-3 py-2 font-semibold", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-[var(--desk-ink-muted)]"
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const key = rowKey(row);
              const selected = selectedKey === key;
              const interactive = Boolean(onRowSelect);

              return (
                <tr
                  key={key}
                  className={cn(
                    "border-t border-[var(--desk-line)]",
                    interactive &&
                      "desk-press desk-focus cursor-pointer",
                    selected && "bg-[var(--desk-surface-muted)]",
                  )}
                  tabIndex={interactive ? 0 : undefined}
                  aria-selected={interactive ? selected : undefined}
                  aria-label={
                    interactive && getRowLabel
                      ? getRowLabel(row)
                      : undefined
                  }
                  onClick={interactive ? () => onRowSelect?.(row) : undefined}
                  onKeyDown={
                    interactive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowSelect?.(row);
                          }
                        }
                      : undefined
                  }
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-3 py-2 align-middle", column.className)}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

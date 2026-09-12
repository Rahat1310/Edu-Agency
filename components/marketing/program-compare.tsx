"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { publicProgramsHref } from "@/lib/programs-href";
import {
  COMPARE_PROGRAM_LIMIT,
  compareProgramsHref,
  toggleCompareId,
} from "@/lib/programs-compare";
import type { PublicProgramFilters } from "@/lib/programs-public";
import { cn } from "@/lib/utils";

export type ProgramCompareCopy = Dictionary["programs"]["compare"];

type CompareContextValue = {
  ids: string[];
  blocked: boolean;
  toggle: (id: string) => void;
  copy: ProgramCompareCopy;
};

const CompareContext = createContext<CompareContextValue | null>(null);

type ProgramCompareProviderProps = {
  locale: Locale;
  filters: PublicProgramFilters;
  initialIds: string[];
  copy: ProgramCompareCopy;
  children: ReactNode;
};

export function ProgramCompareProvider({
  locale,
  filters,
  initialIds,
  copy,
  children,
}: ProgramCompareProviderProps) {
  const router = useRouter();
  const [ids, setIds] = useState(initialIds);
  const [blocked, setBlocked] = useState(false);
  const initialKey = initialIds.join(",");

  useEffect(() => {
    setIds(initialIds);
  }, [initialKey, initialIds]);

  const replaceSelection = useCallback(
    (nextIds: string[]) => {
      router.replace(publicProgramsHref(locale, { ...filters, ids: nextIds }), {
        scroll: false,
      });
    },
    [filters, locale, router],
  );

  const toggle = useCallback(
    (id: string) => {
      const result = toggleCompareId(ids, id);
      if (result.blocked) {
        setBlocked(true);
        return;
      }
      setBlocked(false);
      setIds(result.ids);
      replaceSelection(result.ids);
    },
    [ids, replaceSelection],
  );

  const value = useMemo(
    () => ({ ids, blocked, toggle, copy }),
    [ids, blocked, toggle, copy],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function ProgramCompareCheckbox({
  programId,
  programName,
}: {
  programId: string;
  programName: string;
}) {
  const compare = useContext(CompareContext);
  const inputId = useId();

  if (!compare) {
    return null;
  }

  const checked = compare.ids.includes(programId);
  const atCap = compare.ids.length >= COMPARE_PROGRAM_LIMIT && !checked;

  return (
    <label
      htmlFor={inputId}
      className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-[var(--brand-navy)]"
    >
      <input
        id={inputId}
        type="checkbox"
        className="focus-ring size-4 rounded border-[var(--input)]"
        checked={checked}
        aria-label={`${compare.copy.checkbox}: ${programName}`}
        aria-describedby={compare.blocked ? "program-compare-cap" : undefined}
        onChange={() => compare.toggle(programId)}
      />
      <span
        className={cn(atCap && !checked && "text-[var(--muted-foreground)]")}
      >
        {compare.copy.checkbox}
      </span>
    </label>
  );
}

export function ProgramCompareIdsField() {
  const compare = useContext(CompareContext);
  if (!compare || compare.ids.length === 0) {
    return null;
  }

  return <input type="hidden" name="ids" value={compare.ids.join(",")} />;
}

export function ProgramCompareBar({ locale }: { locale: Locale }) {
  const compare = useContext(CompareContext);

  if (!compare || compare.ids.length === 0) {
    return null;
  }

  const count = compare.ids.length;
  const href = compareProgramsHref(locale, compare.ids);
  const selectedLabel = compare.copy.selected
    .replace("{n}", String(count))
    .replace("{max}", String(COMPARE_PROGRAM_LIMIT));

  return (
    <div className="sticky bottom-4 z-30 mt-10 mr-16">
      <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 shadow-[0_16px_40px_rgb(18_53_91_/_0.14)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-[var(--brand-navy)]">
            {compare.copy.barLabel}
            <span className="mt-0.5 block font-normal text-[var(--muted-foreground)]">
              {selectedLabel}
            </span>
          </p>
          <Link
            href={href}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-navy)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-blue)]"
          >
            {compare.copy.open}
          </Link>
        </div>
        {compare.blocked ? (
          <p
            id="program-compare-cap"
            role="alert"
            className="mt-3 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/8 px-3 py-2 text-sm text-[var(--destructive)]"
          >
            {compare.copy.cap}
          </p>
        ) : null}
      </div>
    </div>
  );
}

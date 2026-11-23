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
import styles from "./programs-directory.module.css";

export type ProgramCompareCopy = Dictionary["programs"]["compare"];

type CompareContextValue = {
  ids: string[];
  blocked: boolean;
  toggle: (id: string) => void;
  clear: () => void;
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

  const clear = useCallback(() => {
    setBlocked(false);
    setIds([]);
    replaceSelection([]);
  }, [replaceSelection]);

  const value = useMemo(
    () => ({ ids, blocked, toggle, clear, copy }),
    [ids, blocked, toggle, clear, copy],
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
    <label htmlFor={inputId} className={styles.compareCheckbox}>
      <input
        id={inputId}
        type="checkbox"
        className="focus-ring"
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
    <div className={styles.compareBar}>
      <div className={styles.compareBarRow}>
        <p aria-live="polite">
          {selectedLabel}
          <span>
            {count < 2
              ? locale === "bn"
                ? "তুলনা করতে আরেকটি বেছে নিন।"
                : "Pick one more to compare."
              : locale === "bn"
                ? "পাশাপাশি দেখে সিদ্ধান্ত নিন।"
                : "Check your choices side by side."}
          </span>
        </p>
        <div className={styles.compareActions}>
          <button type="button" onClick={compare.clear}>
            {locale === "bn" ? "পছন্দ সরান" : "Clear selection"}
          </button>
          {count >= 2 ? (
            <Link href={href}>
              {locale === "bn" ? "কোর্স তুলনা করুন" : "Compare courses"}
            </Link>
          ) : (
            <button type="button" disabled>
              {locale === "bn" ? "কোর্স তুলনা করুন" : "Compare courses"}
            </button>
          )}
        </div>
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
  );
}

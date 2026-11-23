"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";
import { malaysiaCopy } from "@/lib/malaysia/copy";
import {
  compareProgramsHref,
  parseCompareIds,
  toggleCompareId,
} from "@/lib/programs-compare";

function MalaysiaCompareControl({
  id,
  locale,
}: {
  id: string;
  locale: Locale;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const copy = malaysiaCopy(locale);
  const [blocked, setBlocked] = useState(false);
  const ids = parseCompareIds(search.get("ids") ?? "");
  const key = ids.join(",");
  useEffect(() => {
    setBlocked(false);
  }, [key]);
  return (
    <div className="mt-4 text-sm">
      <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg focus-within:ring-2">
        <input
          type="checkbox"
          checked={ids.includes(id)}
          className="size-5 accent-orange-600"
          onChange={() => {
            const result = toggleCompareId(ids, id);
            if (result.blocked) {
              setBlocked(true);
              return;
            }
            const params = new URLSearchParams(search.toString());
            if (result.ids.length) params.set("ids", result.ids.join(","));
            else params.delete("ids");
            router.replace(`${pathname}?${params}`, { scroll: false });
          }}
        />
        {copy.compare}
      </label>
      {blocked && <p role="status">{copy.compareLimit}</p>}
      {ids.length > 0 && (
        <Link
          className="focus-ring inline-flex min-h-11 items-center font-bold text-orange-700 underline"
          href={compareProgramsHref(locale, ids)}
        >
          {copy.compareNow} ({ids.length}/3)
        </Link>
      )}
    </div>
  );
}

export function MalaysiaCompare(props: { id: string; locale: Locale }) {
  return (
    <Suspense fallback={null}>
      <MalaysiaCompareControl {...props} />
    </Suspense>
  );
}

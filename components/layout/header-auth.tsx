"use client";

import { Show, UserButton, useUser } from "@clerk/nextjs";
import { LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function HeaderAuth({
  mobile = false,
  signInLabel,
}: {
  mobile?: boolean;
  signInLabel: string;
}) {
  const { user } = useUser();
  const userId = user?.id;
  const [adminUserId, setAdminUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const controller = new AbortController();

    async function loadAccess(accountId: string) {
      try {
        const response = await fetch("/api/account/access", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const access = await response.json();
        if (!controller.signal.aborted) {
          setAdminUserId(access.canAccessAdminPanel === true ? accountId : null);
        }
      } catch {
        // Keep the student link if the access check is unavailable.
      }
    }

    void loadAccess(userId);
    return () => controller.abort();
  }, [userId]);

  const canAccessAdminPanel = Boolean(userId && adminUserId === userId);
  const accountHref = canAccessAdminPanel ? "/admin" : "/portal/application";
  const accountLabel = canAccessAdminPanel ? "Admin panel" : "Student portal";

  if (mobile) {
    return (
      <div className="w-full">
        <Show when="signed-out">
          <Link
            href="/portal/application"
            className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-stone-100 hover:text-orange-600"
          >
            <User className="size-4 text-slate-500" />
            <span>{signInLabel}</span>
          </Link>
        </Show>
        <Show when="signed-in">
          <div className="flex min-h-11 items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4">
            <Link
              href={accountHref}
              className="focus-ring inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-700"
            >
              {canAccessAdminPanel && (
                <LayoutDashboard className="size-4" aria-hidden="true" />
              )}
              {accountLabel}
            </Link>
            <UserButton />
          </div>
        </Show>
      </div>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Link
          href="/portal/application"
          className="focus-ring group hidden min-h-9 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600 hover:shadow-xs sm:inline-flex"
        >
          <User className="size-3.5 text-slate-500 transition-colors group-hover:text-orange-600" />
          <span>{signInLabel}</span>
        </Link>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center pl-1">
          <Link
            href={accountHref}
            className={`focus-ring mr-3 min-h-9 items-center gap-1.5 rounded-full text-xs font-semibold text-slate-700 ${canAccessAdminPanel ? "inline-flex" : "hidden sm:inline-flex"}`}
          >
            {canAccessAdminPanel && (
              <LayoutDashboard className="size-4" aria-hidden="true" />
            )}
            <span
              className={
                canAccessAdminPanel ? "sr-only sm:not-sr-only" : undefined
              }
            >
              {accountLabel}
            </span>
          </Link>
          <UserButton />
        </div>
      </Show>
    </>
  );
}

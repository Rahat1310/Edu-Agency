"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";
import Link from "next/link";

export function HeaderAuth({
  mobile = false,
  signInLabel,
}: {
  mobile?: boolean;
  signInLabel: string;
}) {
  if (mobile) {
    return (
      <div className="w-full">
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-stone-100 hover:text-orange-600"
          >
            <User className="size-4 text-slate-500" />
            <span>{signInLabel}</span>
          </Link>
        </Show>
        <Show when="signed-in">
          <div className="flex min-h-11 items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4">
            <span className="text-sm font-semibold text-slate-700">Account</span>
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
          href="/sign-in"
          className="focus-ring group hidden min-h-9 items-center gap-1.5 rounded-full border border-stone-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600 hover:shadow-xs sm:inline-flex"
        >
          <User className="size-3.5 text-slate-500 transition-colors group-hover:text-orange-600" />
          <span>{signInLabel}</span>
        </Link>
      </Show>
      <Show when="signed-in">
        <div className="flex items-center pl-1">
          <UserButton />
        </div>
      </Show>
    </>
  );
}

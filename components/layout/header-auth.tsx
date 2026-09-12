"use client";

import { Show, UserButton } from "@clerk/nextjs";
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
      <>
        <Show when="signed-out">
          <Link
            href="/sign-in"
            className="focus-ring flex min-h-12 items-center rounded-xl px-4 font-semibold text-[var(--brand-blue)] hover:bg-[var(--brand-sky)]"
          >
            {signInLabel}
          </Link>
        </Show>
        <Show when="signed-in">
          <div className="flex min-h-12 items-center px-4">
            <UserButton />
          </div>
        </Show>
      </>
    );
  }

  return (
    <>
      <Show when="signed-out">
        <Link
          href="/sign-in"
          className="focus-ring hidden min-h-11 items-center rounded-full px-3 text-sm font-bold text-[var(--brand-navy)] hover:text-[var(--brand-blue)] sm:inline-flex"
        >
          {signInLabel}
        </Link>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}

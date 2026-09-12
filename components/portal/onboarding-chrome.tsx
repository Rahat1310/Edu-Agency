"use client";

import { SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function OnboardingChrome({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#portal-onboarding-main"
        className="desk-focus sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--desk-surface)] focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to the form
      </a>
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--desk-line)] bg-[var(--desk-surface)] px-4">
        <Link
          href="/"
          className="desk-focus group flex items-center rounded-[var(--desk-radius)]"
          aria-label="Study Abroad Consultancy"
        >
          <Image
            src="/logo.png"
            alt="Study Abroad Consultancy"
            width={100}
            height={65}
            className="h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-105"
          />
        </Link>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="desk-focus desk-press inline-flex h-9 items-center rounded-full border border-[var(--desk-line)] px-3 text-sm font-semibold text-[var(--desk-ink)]"
          >
            Sign out
          </button>
        </SignOutButton>
      </header>
      <main
        id="portal-onboarding-main"
        tabIndex={-1}
        className="flex-1 px-5 py-10"
      >
        {children}
      </main>
    </div>
  );
}

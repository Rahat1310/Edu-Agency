"use client";

import { SignOutButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, FileText, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { PortalPageFrame } from "@/components/portal/portal-page-frame";
import { fadeOverlay, useDeskMotion } from "@/lib/desk/motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portal/matches", label: "Matches", icon: Compass },
  { href: "/portal/documents", label: "Documents", icon: FileText },
] as const;

type PortalShellProps = {
  studentName: string;
  children: ReactNode;
};

export function PortalShell({ studentName, children }: PortalShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLElement>(null);
  const closedByNavigate = useRef(false);
  const { reduce, panel, overlay, micro } = useDeskMotion();

  useEffect(() => {
    if (!navOpen) {
      return;
    }

    const menuButton = menuButtonRef.current;
    const root = navPanelRef.current;
    const focusable = root
      ? root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
      : [];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false);
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (!closedByNavigate.current) {
        menuButton?.focus();
      }
      closedByNavigate.current = false;
    };
  }, [navOpen]);

  return (
    <div className="flex min-h-svh">
      <a
        href="#portal-main"
        className="desk-focus sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--desk-surface)] focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to your file
      </a>

      <aside
        className="hidden w-[var(--desk-sidebar)] shrink-0 flex-col border-r border-[var(--desk-line)] bg-[var(--desk-surface)] lg:flex"
        aria-label="Your file"
      >
        <div className="flex h-14 items-center border-b border-[var(--desk-line)] px-4">
          <PortalBrand />
        </div>
        <PortalNav pathname={pathname} tapTransition={micro} reduce={reduce} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--desk-line)] bg-[var(--desk-surface)] px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              ref={menuButtonRef}
              type="button"
              className="desk-focus desk-press inline-flex size-9 items-center justify-center rounded-[var(--desk-radius)] lg:hidden"
              aria-expanded={navOpen}
              aria-controls="portal-mobile-nav"
              onClick={() => setNavOpen(true)}
            >
              <Menu className="size-4" aria-hidden="true" />
              <span className="sr-only">Open menu</span>
            </button>
            <p className="truncate text-sm text-[var(--desk-ink-muted)]">
              Your file
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <p className="min-w-0 truncate text-right text-sm font-semibold text-[var(--desk-ink)]">
              {studentName}
            </p>
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className="desk-focus desk-press inline-flex h-9 items-center rounded-full border border-[var(--desk-line)] px-3 text-sm font-semibold text-[var(--desk-ink)]"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </header>

        <main
          id="portal-main"
          tabIndex={-1}
          className="min-h-0 flex-1 px-4 py-6 sm:px-6 lg:px-8"
        >
          <PortalPageFrame>{children}</PortalPageFrame>
        </main>
      </div>

      <AnimatePresence>
        {navOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-[rgb(18_53_91_/_0.28)]"
              {...fadeOverlay(reduce)}
              transition={overlay}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              id="portal-mobile-nav"
              ref={navPanelRef}
              className="absolute inset-y-0 left-0 flex w-[min(var(--desk-sidebar),calc(100vw-3rem))] flex-col bg-[var(--desk-surface)] shadow-lg"
              initial={reduce ? { x: 0 } : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { x: 0 } : { x: "-100%" }}
              transition={panel}
            >
              <div className="flex h-14 items-center justify-between border-b border-[var(--desk-line)] px-4">
                <PortalBrand />
                <button
                  type="button"
                  className="desk-focus desk-press inline-flex size-9 items-center justify-center rounded-[var(--desk-radius)]"
                  onClick={() => setNavOpen(false)}
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Close menu</span>
                </button>
              </div>
              <PortalNav
                pathname={pathname}
                onNavigate={() => {
                  closedByNavigate.current = true;
                  setNavOpen(false);
                }}
                tapTransition={micro}
                reduce={reduce}
              />
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function PortalBrand() {
  return (
    <Link
      href="/portal"
      className="desk-focus font-display rounded-[var(--desk-radius)] text-base font-bold tracking-[-0.03em] text-[var(--desk-accent)]"
    >
      Study Abroad Consultancy
    </Link>
  );
}

function isCurrent(pathname: string, href: string) {
  if (href === "/portal") {
    return pathname === "/portal";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function PortalNav({
  pathname,
  onNavigate,
  tapTransition,
  reduce,
}: {
  pathname: string;
  onNavigate?: () => void;
  tapTransition?: ReturnType<typeof useDeskMotion>["micro"];
  reduce?: boolean;
}) {
  return (
    <nav className="flex flex-1 flex-col p-3" aria-label="Your file">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const current = isCurrent(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <motion.div
                whileTap={reduce ? undefined : { scale: 0.99 }}
                transition={tapTransition}
              >
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  onClick={onNavigate}
                  className={cn(
                    "desk-focus desk-press flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-semibold",
                    current
                      ? "bg-[var(--desk-surface-muted)] text-[var(--desk-accent)]"
                      : "text-[var(--desk-ink)]",
                  )}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </motion.div>
            </li>
          );
        })}
      </ul>
      <p className="mt-auto px-3 pt-6 pb-2">
        <Link
          href="/"
          className="desk-focus text-sm font-medium text-[var(--desk-ink-muted)]"
        >
          Back to the website
        </Link>
      </p>
    </nav>
  );
}

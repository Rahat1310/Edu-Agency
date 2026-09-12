"use client";

import { SignOutButton } from "@clerk/nextjs";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarClock,
  ClipboardList,
  Inbox,
  Kanban,
  Link2Off,
  Menu,
  Quote,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { DeskToastProvider } from "@/components/desk/toast";
import { fadeOverlay, useDeskMotion } from "@/lib/desk/motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/pipeline", label: "Pipeline Board", icon: Kanban },
  { href: "/admin/performance", label: "Performance", icon: BarChart3 },
  { href: "/admin/unlinked", label: "Unlinked accounts", icon: Link2Off },
  {
    href: "/admin/unmatched-messages",
    label: "Unmatched messages",
    icon: Inbox,
  },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  {
    href: "/admin/intake-deadlines",
    label: "Intake deadlines",
    icon: CalendarClock,
  },
  { href: "/admin/success-stories", label: "Success stories", icon: Quote },
  {
    href: "/admin/visa-requirements",
    label: "Visa requirements",
    icon: ClipboardList,
  },
  { href: "/admin/ai-usage", label: "AI usage", icon: Activity },
] as const;

type DeskShellProps = {
  counselorName: string;
  role: string;
  children: ReactNode;
};

export function DeskShell({ counselorName, role, children }: DeskShellProps) {
  return (
    <MotionConfig reducedMotion="user">
      <DeskToastProvider>
        <DeskChrome counselorName={counselorName} role={role}>
          {children}
        </DeskChrome>
      </DeskToastProvider>
    </MotionConfig>
  );
}

function DeskChrome({ counselorName, role, children }: DeskShellProps) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const { reduce, panel, overlay, micro } = useDeskMotion();

  useEffect(() => {
    if (!navOpen) {
      return;
    }

    const root = document.getElementById("desk-mobile-nav");
    const first = root?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    first?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setNavOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);

  return (
    <div className="flex min-h-svh">
      <a
        href="#desk-main"
        className="desk-focus sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[var(--desk-surface)] focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to desk content
      </a>

      <aside
        className="hidden w-[var(--desk-sidebar)] shrink-0 flex-col border-r border-[var(--desk-line)] bg-[var(--desk-surface)] lg:flex"
        aria-label="Desk"
      >
        <div className="flex h-12 items-center border-b border-[var(--desk-line)] px-3">
          <DeskBrand />
        </div>
        <DeskNav pathname={pathname} tapTransition={micro} reduce={reduce} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--desk-line)] bg-[var(--desk-surface)] px-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="desk-focus desk-press inline-flex size-8 items-center justify-center rounded-[var(--desk-radius)] lg:hidden"
              aria-expanded={navOpen}
              aria-controls="desk-mobile-nav"
              onClick={() => setNavOpen(true)}
            >
              <Menu className="size-4" aria-hidden="true" />
              <span className="sr-only">Open navigation</span>
            </button>
            <p className="truncate text-[0.68rem] font-semibold tracking-[0.08em] text-[var(--desk-ink-muted)] uppercase">
              Desk
            </p>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <p className="min-w-0 truncate text-right">
              <span className="block truncate text-sm font-semibold text-[var(--desk-ink)]">
                {counselorName}
              </span>
              <span className="block text-[0.68rem] text-[var(--desk-ink-muted)] capitalize">
                {role}
              </span>
            </p>
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className="desk-focus desk-press inline-flex h-8 items-center rounded-[var(--desk-radius)] border border-[var(--desk-line)] px-2.5 text-xs font-semibold text-[var(--desk-ink)]"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </header>

        <main id="desk-main" tabIndex={-1} className="min-h-0 flex-1 p-4">
          {children}
        </main>
      </div>

      <AnimatePresence>
        {navOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-[rgb(26_31_38_/_0.32)]"
              {...fadeOverlay(reduce)}
              transition={overlay}
              onClick={() => setNavOpen(false)}
            />
            <motion.aside
              id="desk-mobile-nav"
              className="absolute inset-y-0 left-0 flex w-[min(var(--desk-sidebar),calc(100vw-3rem))] flex-col bg-[var(--desk-surface)] shadow-lg"
              initial={reduce ? { x: 0 } : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduce ? { x: 0 } : { x: "-100%" }}
              transition={panel}
            >
              <div className="flex h-12 items-center justify-between border-b border-[var(--desk-line)] px-3">
                <DeskBrand />
                <button
                  type="button"
                  className="desk-focus desk-press inline-flex size-8 items-center justify-center rounded-[var(--desk-radius)]"
                  onClick={() => setNavOpen(false)}
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Close navigation</span>
                </button>
              </div>
              <DeskNav
                pathname={pathname}
                onNavigate={() => setNavOpen(false)}
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

function DeskBrand() {
  return (
    <Link
      href="/admin/leads"
      className="desk-focus group flex items-center rounded-[var(--desk-radius)]"
      aria-label="Study Abroad Consultancy"
    >
      <Image
        src="/logo.png"
        alt="Study Abroad Consultancy"
        width={90}
        height={58}
        className="h-7 w-auto object-contain transition-transform duration-150 group-hover:scale-105"
      />
    </Link>
  );
}

function DeskNav({
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
    <nav className="p-2" aria-label="Desk sections">
      <ul className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const current =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
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
                    "desk-focus desk-press flex min-h-9 items-center gap-2 rounded-[var(--desk-radius)] px-2.5 text-sm font-medium",
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
    </nav>
  );
}

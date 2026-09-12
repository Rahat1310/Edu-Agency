import { ArrowUpRight, MessageCircle } from "lucide-react";
import Link from "next/link";

import { JourneyLine } from "@/components/layout/journey-line";
import { PageShell } from "@/components/layout/page-shell";
import { DESTINATION_SLUGS } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "Messenger", href: "https://www.messenger.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);

  return (
    <footer
      lang={locale}
      className="mt-auto border-t border-white/10 bg-gradient-to-b from-[#0B1E36] via-[#071324] to-[#040B15] text-white"
    >
      <div className="border-b border-white/10 bg-white/5 text-white/90 backdrop-blur-md">
        <PageShell className="py-4">
          <JourneyLine ariaLabel={dict.chrome.journeyAria} />
        </PageShell>
      </div>

      <PageShell className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr] lg:gap-16 lg:py-16">
        <div>
          <p className="font-display text-2xl font-bold tracking-[-0.035em] text-white">
            {dict.chrome.footerTagline}
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/75">
            {dict.chrome.footerBlurb}
          </p>
          <address className="mt-6 not-italic">
            <p className="font-utility text-[0.68rem] tracking-[0.12em] text-white/60 uppercase">
              {dict.chrome.footerContact}
            </p>
            <p className="mt-2 text-sm text-white/90">
              {dict.chrome.footerCity}
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-sunset focus-ring mt-4 inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {dict.chrome.footerWhatsapp}
              <span className="sr-only">{dict.chrome.footerNewTab}</span>
            </a>
          </address>
        </div>

        <div>
          <h2 className="font-utility text-[0.68rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
            {dict.chrome.footerDestinations}
          </h2>
          <ul className="mt-4 space-y-1.5">
            {DESTINATION_SLUGS.map((slug) => (
              <li key={slug}>
                <Link
                  href={localizedHref(`/destinations/${slug}`, locale)}
                  className="focus-ring-dark inline-flex min-h-9 items-center rounded-lg px-2 py-1 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-orange-300"
                >
                  {dict.chrome.destinationLinks[slug]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-utility text-[0.68rem] font-semibold tracking-[0.12em] text-white/60 uppercase">
            {dict.chrome.footerConnect}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {socialLinks.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring-dark inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition-all hover:border-orange-300/40 hover:bg-white/10 hover:text-white"
                >
                  {social.label}
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                  <span className="sr-only">{dict.chrome.footerNewTab}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col space-y-2 border-t border-white/10 pt-4">
            <Link
              href={localizedHref("/cost-calculator", locale)}
              className="focus-ring-dark inline-flex min-h-8 items-center text-xs text-white/70 transition-colors hover:text-orange-300"
            >
              → {dict.chrome.nav.costs}
            </Link>
            <Link
              href={localizedHref("/success-stories", locale)}
              className="focus-ring-dark inline-flex min-h-8 items-center text-xs text-white/70 transition-colors hover:text-orange-300"
            >
              → {dict.chrome.nav.stories}
            </Link>
            <Link
              href={localizedHref("/eligibility-quiz", locale)}
              className="focus-ring-dark inline-flex min-h-8 items-center text-xs text-white/70 transition-colors hover:text-orange-300"
            >
              → {dict.chrome.nav.eligibility}
            </Link>
            <Link
              href={localizedHref("/privacy", locale)}
              className="focus-ring-dark inline-flex min-h-8 items-center text-xs text-white/60 transition-colors hover:text-orange-300"
            >
              → {dict.chrome.footerPrivacy}
            </Link>
          </div>
        </div>
      </PageShell>

      <div className="border-t border-white/10">
        <PageShell className="flex flex-col gap-2 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {dict.meta.siteName}. All rights
            reserved.
          </p>
          <p>{dict.chrome.footerCredit}</p>
        </PageShell>
      </div>
    </footer>
  );
}

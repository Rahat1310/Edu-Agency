import {
  ArrowUpRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { DESTINATION_SLUGS } from "@/lib/destinations";
import type { Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/paths";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/" },
  { label: "Messenger", href: "https://www.messenger.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
] as const;

const OFFICE_MAP_LINK = "https://maps.app.goo.gl/f98QPnkAhscY3WAYA";
const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1825.0443431297122!2d90.4170797!3d23.8333266!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7d85b1a7b8f%3A0xa72feed2f4a5362a!2sStudy%20Abroad%20Consultancy!5e0!3m2!1sen!2sbd!4v1726388000000!5m2!1sen!2sbd";

export function SiteFooter({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);
  const isBn = locale === "bn";

  return (
    <footer
      lang={locale}
      className="mt-auto border-t border-slate-800 bg-[#08111D] text-slate-300"
    >
      <PageShell className="py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Mission Column (3.5 cols) */}
          <div className="lg:col-span-3">
            <Link
              href={localizedHref("/", locale)}
              className="group inline-flex items-center rounded-xl bg-white px-3.5 py-2 shadow-xs transition-opacity hover:opacity-95"
              aria-label={dict.chrome.brandAria}
            >
              <Image
                src="/logo.png"
                alt="Study Abroad Consultancy"
                width={130}
                height={80}
                className="h-9 sm:h-10 w-auto object-contain"
                priority
              />
            </Link>

            <h3 className="font-display mt-5 text-lg font-bold tracking-tight text-white sm:text-xl">
              {dict.chrome.footerTagline}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {dict.chrome.footerBlurb}
            </p>

            <div className="mt-6">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
              >
                <MessageCircle className="size-3.5" aria-hidden="true" />
                <span>{dict.chrome.footerWhatsapp}</span>
                <ArrowUpRight className="size-3 opacity-60" aria-hidden="true" />
                <span className="sr-only">{dict.chrome.footerNewTab}</span>
              </a>
            </div>
          </div>

          {/* Destinations Column (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-utility text-xs font-semibold tracking-wider text-slate-200 uppercase">
              {dict.chrome.footerDestinations}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {DESTINATION_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    href={localizedHref(`/destinations/${slug}`, locale)}
                    className="text-slate-400 transition-colors hover:text-white"
                  >
                    {dict.chrome.destinationLinks[slug]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Tools Column (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-utility text-xs font-semibold tracking-wider text-slate-200 uppercase">
              {isBn ? "প্রয়োজনীয় লিংক" : "Resources"}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href={localizedHref("/programs", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.nav.programs}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/cost-calculator", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.nav.costs}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/eligibility-quiz", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.nav.eligibility}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/success-stories", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.nav.stories}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/about", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.nav.about}
                </Link>
              </li>
              <li>
                <Link
                  href={localizedHref("/privacy", locale)}
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  {dict.chrome.footerPrivacy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Cool Embedded Map Column (5 cols) */}
          <div className="lg:col-span-5">
            <h4 className="font-utility text-xs font-semibold tracking-wider text-slate-200 uppercase">
              {dict.chrome.footerContact}
            </h4>

            {/* Contact Details Grid */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-orange-400"
                  aria-hidden="true"
                />
                <div className="text-slate-300">
                  <p className="font-medium text-white">
                    {dict.chrome.footerAddressLine1}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {dict.chrome.footerAddressLine2}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2.5">
                <Phone
                  className="mt-0.5 size-4 shrink-0 text-orange-400"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-xs text-slate-400">
                    {dict.chrome.footerPhoneLabel}
                  </p>
                  <a
                    href={`tel:${dict.chrome.footerPhoneValue.replace(/\s+/g, "")}`}
                    className="font-medium text-white transition-colors hover:text-orange-400"
                  >
                    {dict.chrome.footerPhoneValue}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <Mail
                  className="mt-0.5 size-4 shrink-0 text-orange-400"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    {dict.chrome.footerEmailLabel}
                  </p>
                  <a
                    href={`mailto:${dict.chrome.footerEmailValue}`}
                    className="block truncate font-medium text-white transition-colors hover:text-orange-400"
                    title={dict.chrome.footerEmailValue}
                  >
                    {dict.chrome.footerEmailValue}
                  </a>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-2.5">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-orange-400"
                  aria-hidden="true"
                />
                <div className="text-xs text-slate-400">
                  <p>{dict.chrome.footerHoursValue}</p>
                </div>
              </div>
            </div>

            {/* 🗺️ Embedded Google Map Card */}
            <div className="group relative mt-5 overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-xl transition-all duration-300 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10">
              <div className="relative h-48 w-full overflow-hidden sm:h-52">
                <iframe
                  src={GOOGLE_MAPS_EMBED_URL}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Study Abroad Consultancy Office Location Map"
                  className="h-full w-full opacity-90 transition-opacity duration-300 hover:opacity-100"
                />
              </div>

              {/* Floating Bottom Bar with Live Beacon & Direct Map Link */}
              <div className="flex items-center justify-between gap-3 border-t border-slate-800 bg-[#060D17]/95 px-3.5 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      Study Abroad Consultancy
                    </p>
                    <p className="truncate text-[0.68rem] text-slate-400">
                      Nikunja 2, Khilkhet, Dhaka
                    </p>
                  </div>
                </div>

                <a
                  href={OFFICE_MAP_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-[0.72rem] font-semibold text-orange-400 transition-all duration-200 hover:bg-orange-500 hover:text-white"
                >
                  <span>{isBn ? "ম্যাপে দেখুন" : "Open in Maps"}</span>
                  <ExternalLink className="size-2.5" aria-hidden="true" />
                  <span className="sr-only">{dict.chrome.footerNewTab}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="mt-12 border-t border-slate-800/80 pt-6 sm:mt-16 sm:flex sm:items-center sm:justify-between sm:pt-8">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {dict.meta.siteName}. {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>

          <div className="mt-4 flex items-center gap-6 sm:mt-0">
            <ul className="flex items-center gap-4 text-xs text-slate-400">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {social.label}
                    <span className="sr-only">{dict.chrome.footerNewTab}</span>
                  </a>
                </li>
              ))}
            </ul>

            <span className="hidden text-xs text-slate-600 sm:inline">|</span>

            <p className="hidden text-xs text-slate-500 sm:inline">
              {dict.chrome.footerCredit}
            </p>
          </div>
        </div>
      </PageShell>
    </footer>
  );
}

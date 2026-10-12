import {
  ArrowDown,
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { LeadForm } from "@/components/lead-form";
import { PageShell } from "@/components/layout/page-shell";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { DEFAULT_AGENCY_WHATSAPP, getWhatsAppHref } from "@/lib/whatsapp";

type ContactPageProps = {
  dict: Dictionary;
  locale: Locale;
};

export function ContactPage({ dict, locale }: ContactPageProps) {
  const isBn = locale === "bn";
  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("House 16, Road 14, Nikunja 2, Khilkhet, Dhaka, Bangladesh")}`;
  const linkClass =
    "focus-ring inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-[var(--brand-blue)]";

  return (
    <>
      <section className="border-b border-stone-200/80 bg-[#fafafa] py-12 sm:py-16 lg:py-20">
        <PageShell>
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end lg:gap-16">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-blue)] uppercase">
                {dict.contact.eyebrow}
              </p>
              <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.12] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                {isBn ? "বিদেশে পড়াশোনার পরিকল্পনা?" : "Let’s talk about"}{" "}
                <span className="text-[var(--brand-blue)]">
                  {isBn ? "আমাদের সঙ্গে কথা বলুন।" : "your study plans."}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {isBn
                  ? "কোন দেশ, বিশ্ববিদ্যালয় বা প্রোগ্রাম আপনার জন্য উপযুক্ত, তা নিয়ে প্রশ্ন আছে? আপনার লক্ষ্য ও বাজেট নিয়ে আমাদের কাউন্সেলরের সঙ্গে কথা বলুন।"
                  : "Not sure which country, university, or programme is right for you? Talk through your goals and budget with our education counsellors."}
              </p>
            </div>
            <div className="lg:pb-1">
              <p className="max-w-sm text-sm leading-7 text-slate-600">
                {isBn
                  ? "আমাদের ঢাকার অফিসে আসুন, সরাসরি ফোন করুন অথবা নিচের ফর্মে আপনার তথ্য পাঠান।"
                  : "Visit our Dhaka office, give us a call, or leave your details below. We’ll help you work out your next step."}
              </p>
              <a
                href="#contact-form"
                className="btn-sunset focus-ring mt-5 inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-6 text-sm font-bold"
              >
                {isBn
                  ? "ফ্রি কাউন্সেলিংয়ের অনুরোধ করুন"
                  : "Request a free consultation"}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </PageShell>
      </section>

      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <PageShell>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
            <div>
              <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {isBn ? "সরাসরি যোগাযোগ করুন" : "Get in touch"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {isBn
                  ? "আপনার সুবিধামতো যোগাযোগের মাধ্যম বেছে নিন।"
                  : "Choose whichever way works best for you."}
              </p>
              <dl className="mt-6 divide-y divide-stone-200">
                <div className="flex gap-4 py-5">
                  <Phone
                    className="mt-1 size-5 shrink-0 text-[var(--brand-blue)]"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-sm text-slate-500">
                      {dict.contact.phoneLabel}
                    </dt>
                    <dd>
                      <a
                        href={`tel:+${DEFAULT_AGENCY_WHATSAPP}`}
                        className={linkClass}
                      >
                        {dict.contact.phoneValue}
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-4 py-5">
                  <MessageCircle
                    className="mt-1 size-5 shrink-0 text-[var(--brand-blue)]"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="text-sm text-slate-500">
                      {dict.contact.whatsappLabel}
                    </dt>
                    <dd>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noreferrer"
                        className={linkClass}
                      >
                        {dict.contact.whatsappValue}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                        <span className="sr-only">
                          {dict.chrome.footerNewTab}
                        </span>
                      </a>
                    </dd>
                  </div>
                </div>
                <div className="flex gap-4 py-5">
                  <Mail
                    className="mt-1 size-5 shrink-0 text-[var(--brand-blue)]"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <dt className="text-sm text-slate-500">
                      {dict.contact.emailLabel}
                    </dt>
                    <dd>
                      <a
                        href={`mailto:${dict.contact.emailValue}`}
                        className={`${linkClass} break-all`}
                      >
                        {dict.contact.emailValue}
                      </a>
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <MapPin
                    className="size-5 text-[var(--brand-blue)]"
                    aria-hidden="true"
                  />
                  <h3 className="font-heading text-xl font-semibold text-slate-900">
                    {dict.contact.detailsTitle}
                  </h3>
                </div>
                <address className="mt-4 text-sm leading-7 text-slate-700 not-italic">
                  {dict.contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`${linkClass} mt-2 text-[var(--brand-blue)]`}
                >
                  {isBn
                    ? "গুগল ম্যাপে দিকনির্দেশনা দেখুন"
                    : "Get directions on Google Maps"}
                  <ArrowUpRight
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="sr-only">{dict.chrome.footerNewTab}</span>
                </a>
                <div className="mt-5 flex gap-3 border-t border-stone-200 pt-5">
                  <Clock3
                    className="mt-0.5 size-4 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {dict.contact.hoursLabel}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {dict.contact.hoursValue}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {isBn
                    ? "অফিসে আসার আগে ফোন করে সময় ঠিক করে নিন।"
                    : "Please call ahead to arrange your visit."}
                </p>
              </div>
            </div>

            <div
              id="contact-form"
              className="scroll-mt-28 rounded-2xl border border-stone-200 p-6 sm:p-8 lg:p-10"
            >
              <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-[var(--brand-blue)] uppercase">
                {dict.contact.formEyebrow}
              </p>
              <LeadForm
                copy={dict.leadForm}
                source="contact"
                heading={
                  isBn
                    ? "আপনার পরিকল্পনা জানান"
                    : "Tell us what you have in mind"
                }
                intro={dict.contact.formBody}
              />
              <p className="mt-6 border-t border-stone-200 pt-5 text-xs leading-6 text-slate-500">
                {isBn
                  ? "আপনার তথ্য আপনার প্রশ্নের উত্তর ও কাউন্সেলিংয়ের জন্য ব্যবহার করা হবে। গন্তব্য এখনও ঠিক না হলে, মেসেজে তা জানাতে পারেন।"
                  : "We’ll use your details to respond to your enquiry and discuss your study options. If you haven’t chosen a destination yet, let us know in your message."}
              </p>
            </div>
          </div>
        </PageShell>
      </section>

      <section className="border-t border-stone-200 bg-[#fafafa] py-10 sm:py-12">
        <PageShell className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              {isBn ? "ছোট কোনো প্রশ্ন আছে?" : "Have a quick question?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isBn
                ? "হোয়াটসঅ্যাপে লিখুন। অফিস সময়ে আমাদের টিম উত্তর দেবে।"
                : "Send us a message on WhatsApp. Our team replies during office hours."}
            </p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="focus-ring inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-6 text-sm font-semibold text-slate-900 transition-colors hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]"
          >
            <MessageCircle
              className="size-4 text-emerald-600"
              aria-hidden="true"
            />
            {isBn ? "হোয়াটসঅ্যাপে কথা বলুন" : "Chat on WhatsApp"}
            <span className="sr-only">{dict.chrome.footerNewTab}</span>
          </a>
        </PageShell>
      </section>
    </>
  );
}

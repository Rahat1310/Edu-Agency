import { MessageCircle } from "lucide-react";

import { LeadForm } from "@/components/lead-form";
import { PageShell } from "@/components/layout/page-shell";
import type { Dictionary } from "@/lib/i18n/types";
import { getWhatsAppHref } from "@/lib/whatsapp";

type ContactPageProps = {
  dict: Dictionary;
};

export function ContactPage({ dict }: ContactPageProps) {
  const whatsappHref = getWhatsAppHref(dict.chrome.whatsappMessage);

  return (
    <section className="py-10 sm:py-16">
      <PageShell>
        <div className="eyebrow-pill inline-flex items-center gap-2">
          <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          <span>{dict.contact.eyebrow}</span>
        </div>
        <h1 className="font-heading mt-4 max-w-3xl text-4xl leading-[1.1] font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.05]">
          {dict.contact.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 font-normal text-slate-600">
          {dict.contact.lede}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">
              {dict.contact.detailsTitle}
            </h2>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="font-utility text-[0.68rem] font-bold tracking-[0.12em] text-slate-500 uppercase">
                  {dict.contact.addressLabel}
                </dt>
                <dd className="mt-2">
                  <address className="text-sm leading-7 font-medium text-slate-700 not-italic">
                    {dict.contact.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="font-utility text-[0.68rem] font-bold tracking-[0.12em] text-slate-500 uppercase">
                  {dict.contact.phoneLabel}
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-700">
                  {dict.contact.phoneValue}
                </dd>
              </div>
              <div>
                <dt className="font-utility text-[0.68rem] font-bold tracking-[0.12em] text-slate-500 uppercase">
                  {dict.contact.whatsappLabel}
                </dt>
                <dd className="mt-2">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    <MessageCircle
                      className="size-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    {dict.contact.whatsappValue}
                    <span className="sr-only">{dict.chrome.footerNewTab}</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-utility text-[0.68rem] font-bold tracking-[0.12em] text-slate-500 uppercase">
                  {dict.contact.emailLabel}
                </dt>
                <dd className="mt-2 text-sm font-medium text-slate-700">
                  {dict.contact.emailValue}
                </dd>
              </div>
            </dl>
          </div>

          <div
            id="contact-form"
            className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="eyebrow-pill inline-flex items-center gap-2">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>{dict.contact.formEyebrow}</span>
            </div>
            <LeadForm
              className="mt-5"
              copy={dict.leadForm}
              source="contact"
              heading={dict.contact.formTitle}
              intro={dict.contact.formBody}
            />
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              {dict.contact.formHint}
            </p>
          </div>
        </div>
      </PageShell>
    </section>
  );
}

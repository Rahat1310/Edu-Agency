import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ChatWidget } from "@/components/marketing/chat-widget";
import { JsonLd } from "@/components/seo/json-ld";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/types";
import { organizationJsonLd } from "@/lib/seo/organization";
import { getWhatsAppHref } from "@/lib/whatsapp";

type SiteLayoutProps = {
  children: React.ReactNode;
  locale: Locale;
  dict: Dictionary;
};

export function SiteLayout({ children, locale, dict }: SiteLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col">
      <JsonLd data={organizationJsonLd(dict)} />
      <a
        href="#main-content"
        className="focus-ring fixed top-3 left-3 z-50 -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--brand-navy)] shadow-lg transition-transform focus:translate-y-0 motion-reduce:transition-none"
      >
        {dict.chrome.skipToContent}
      </a>
      <SiteHeader locale={locale} dict={dict} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} dict={dict} />
      <ChatWidget
        locale={locale}
        copy={dict.chatbot}
        leadCopy={dict.leadForm}
        whatsappHref={getWhatsAppHref(dict.chrome.whatsappMessage)}
      />
    </div>
  );
}

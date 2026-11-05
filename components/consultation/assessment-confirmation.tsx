import React from "react";
import { MessageCircle, Phone } from "lucide-react";
import type { Confirmation } from "@/lib/consultation/schema";
import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/en";

export function AssessmentConfirmation({
  confirmation,
  locale,
}: {
  confirmation: Confirmation;
  locale: Locale;
}) {
  const isBn = locale === "bn";
  const c = confirmation.counselor;
  const phone = c?.phone ?? en.contact.phoneValue;
  const displayPhone = phone.startsWith("+880") ? `0${phone.slice(4)}` : phone;
  const whatsapp = c?.whatsapp ?? process.env.NEXT_PUBLIC_WHATSAPP_PHONE_NUMBER;
  const text = `Hello, I submitted my student profile assessment with Study Abroad Consultant. My reference number is ${confirmation.reference}. I would like to discuss my study abroad options.`;

  return (
    <section
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
      aria-labelledby="assessment-success-heading"
      aria-live="polite"
    >
      <p className="mb-4 font-semibold text-emerald-700">
        {isBn ? "ধন্যবাদ" : "Thank you"}, {confirmation.firstName}.
      </p>
      <h2
        id="assessment-success-heading"
        tabIndex={-1}
        className="scroll-mt-24 text-2xl font-bold text-[#102b4e]"
      >
        {c
          ? isBn
            ? "আপনার কাউন্সেলর নিয়োগ করা হয়েছে!"
            : "Your counsellor has been assigned!"
          : isBn
            ? "আপনার প্রোফাইল মূল্যায়নের তথ্য জমা হয়েছে!"
            : "Your assessment has been submitted successfully!"}
      </h2>
      <p className="mt-4 leading-7 text-slate-600">
        {isBn
          ? "আপনার উত্তরগুলো সংরক্ষণ করা হয়েছে। আপনার কাউন্সেলর আপনার প্রোফাইল মূল্যায়ন করবেন এবং ভর্তি, বৃত্তি ও পড়াশোনার উপযুক্ত পথ সম্পর্কে দিকনির্দেশনা দেবেন।"
          : "Your answers have been saved. Your counsellor will assess your profile and guide you through suitable study paths, admission options and scholarship opportunities."}
      </p>
      <p className="my-6 rounded-xl bg-slate-50 p-4 font-semibold">
        {isBn ? "আপনার রেফারেন্স" : "Your reference"}: {confirmation.reference}
      </p>
      {c ? (
        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="text-xl font-bold text-[#102b4e]">{c.fullName}</h3>
          <p className="mt-1 text-slate-600">{c.title}</p>
          <p className="mt-3 text-slate-600">
            {isBn
              ? "আপনার কাউন্সেলর আপনার তথ্য পর্যালোচনা করে যোগাযোগ করবেন। জরুরি প্রয়োজনে সরাসরি ফোন করুন বা হোয়াটসঅ্যাপে কথা বলুন।"
              : "Your counsellor will review your information and contact you. For urgent enquiries, you can call or chat on WhatsApp directly."}
          </p>
        </div>
      ) : (
        <p className="text-slate-600">
          {isBn
            ? "আমাদের দল শীঘ্রই একজন কাউন্সেলর নিয়োগ করবে। জরুরি প্রয়োজনে আমাদের অফিসে যোগাযোগ করুন।"
            : "Our team will assign a counsellor shortly. For urgent enquiries, please contact our office."}
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`tel:${phone.replace(/[^+\d]/g, "")}`}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 px-5 py-3 font-semibold text-[#102b4e] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Phone className="size-4" aria-hidden="true" />
          <span className="sr-only">{isBn ? "ফোন করুন: " : "Call: "}</span>
          {displayPhone}
        </a>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {isBn ? "হোয়াটসঅ্যাপে কথা বলুন" : "Chat on WhatsApp"}
            <span className="sr-only">
              {isBn ? " (নতুন ট্যাবে খুলবে)" : " (opens in a new tab)"}
            </span>
          </a>
        )}
      </div>
    </section>
  );
}

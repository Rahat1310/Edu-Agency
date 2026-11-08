"use client";

import React from "react";
import {
  ArrowUpRight,
  Check,
  Download,
  Mail,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react";
import type { Confirmation } from "@/lib/consultation/schema";
import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/en";
import { buildAssessmentReceipt } from "@/lib/consultation/receipt";

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
  const downloadDetails = () => {
    const receipt = buildAssessmentReceipt(
      confirmation,
      c ?? {
        fullName: "Study Abroad Consultant",
        title: "Office contact",
        phone,
        whatsapp: whatsapp ?? "",
      },
    );
    const url = URL.createObjectURL(
      new Blob([receipt.text], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${confirmation.reference}-counsellor-details.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_48px_-24px_rgba(16,43,78,0.25)]"
      aria-labelledby="assessment-success-heading"
      aria-live="polite"
    >
      <div className="border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50/60 p-6 sm:p-9">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white shadow-sm">
            <Check className="size-6" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <p className="font-semibold text-emerald-800">
            {isBn ? "ধন্যবাদ" : "Thank you"}, {confirmation.firstName}.
          </p>
        </div>
        <h2
          id="assessment-success-heading"
          tabIndex={-1}
          className="max-w-xl scroll-mt-24 text-2xl leading-tight font-bold tracking-tight text-[#102b4e] sm:text-3xl"
        >
          {c
            ? isBn
              ? "আপনার কাউন্সেলর নিয়োগ করা হয়েছে!"
              : "Your counsellor has been assigned!"
            : isBn
              ? "আপনার প্রোফাইল মূল্যায়নের তথ্য জমা হয়েছে!"
              : "Your assessment has been submitted successfully!"}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          {isBn
            ? "আপনার উত্তরগুলো সংরক্ষণ করা হয়েছে। আপনার কাউন্সেলর আপনার প্রোফাইল মূল্যায়ন করবেন এবং ভর্তি, বৃত্তি ও পড়াশোনার উপযুক্ত পথ সম্পর্কে দিকনির্দেশনা দেবেন।"
            : "Your answers have been saved. Your counsellor will assess your profile and guide you through suitable study paths, admission options and scholarship opportunities."}
        </p>
        <div className="mt-6 inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm">
          <span className="text-slate-500">
            {isBn ? "আপনার রেফারেন্স" : "Your reference"}
          </span>
          <span className="font-mono font-semibold tracking-wide break-all text-[#102b4e]">
            {confirmation.reference}
          </span>
        </div>
      </div>
      <div className="p-6 sm:p-9">
        {c ? (
          <div>
            <p className="mb-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">
              {isBn ? "আপনার কাউন্সেলর" : "Your dedicated counsellor"}
            </p>
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[#102b4e] text-white">
                <UserRound className="size-7" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg leading-snug font-bold text-[#102b4e] sm:text-xl">
                  {c.fullName}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{c.title}</p>
              </div>
            </div>
            <div className="mt-6 space-y-2 rounded-xl border border-l-4 border-amber-200/80 border-l-amber-400 bg-amber-50/70 p-4 text-sm leading-7 text-slate-700 sm:p-5">
              <p>
                {isBn ? (
                  <>
                    আপনার কাউন্সেলর আপনার তথ্য{" "}
                    <strong className="font-bold text-[#102b4e]">
                      পর্যালোচনা
                    </strong>{" "}
                    করে যোগাযোগ করবেন।
                  </>
                ) : (
                  <>
                    Your counsellor will{" "}
                    <strong className="font-bold text-[#102b4e]">review</strong>{" "}
                    your information and contact you.
                  </>
                )}
              </p>
              <p>
                {isBn ? (
                  <>
                    <strong className="rounded bg-amber-200 px-1.5 py-0.5 font-bold text-amber-950">
                      জরুরি
                    </strong>{" "}
                    প্রয়োজনে সরাসরি ফোন করুন বা{" "}
                    <strong className="font-bold text-emerald-800">
                      হোয়াটসঅ্যাপে
                    </strong>{" "}
                    কথা বলুন।
                  </>
                ) : (
                  <>
                    For{" "}
                    <strong className="rounded bg-amber-200 px-1.5 py-0.5 font-bold text-amber-950">
                      urgent
                    </strong>{" "}
                    enquiries, you can call or chat on{" "}
                    <strong className="font-bold text-emerald-800">
                      WhatsApp
                    </strong>{" "}
                    directly.
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-600">
            {isBn
              ? "আমাদের দল শীঘ্রই একজন কাউন্সেলর নিয়োগ করবে। জরুরি প্রয়োজনে আমাদের অফিসে যোগাযোগ করুন।"
              : "Our team will assign a counsellor shortly. For urgent enquiries, please contact our office."}
          </p>
        )}
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-[#102b4e] transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Phone className="size-4" aria-hidden="true" />
            <span>{isBn ? "ফোন করুন: " : "Call: "}</span>
            {displayPhone}
          </a>
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {isBn ? "হোয়াটসঅ্যাপে কথা বলুন" : "Chat on WhatsApp"}
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only">
                {isBn ? " (নতুন ট্যাবে খুলবে)" : " (opens in a new tab)"}
              </span>
            </a>
          )}
        </div>
        <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
          <h3 className="font-semibold text-[#102b4e]">
            {isBn
              ? "আপনার কাউন্সেলরের তথ্য সংরক্ষণ করুন"
              : "Keep your counsellor’s details"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {isBn
              ? "এই পেজটি বন্ধ করার আগে আপনার রেফারেন্স ও যোগাযোগের তথ্য ডাউনলোড করুন। পরে লগইন করলে এই নিশ্চিতকরণ পেজটি আবার দেখা যাবে না।"
              : "Download your reference and contact details before closing this page. This confirmation won’t appear again when you sign in."}
          </p>
          <button
            type="button"
            onClick={downloadDetails}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#102b4e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1b416e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <Download className="size-4" aria-hidden="true" />
            {isBn ? "তথ্য ডাউনলোড করুন (.txt)" : "Download details (.txt)"}
          </button>
          <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <Mail className="mt-1 size-4 shrink-0" aria-hidden="true" />
            <span>
              {confirmation.emailStatus === "queued"
                ? isBn
                  ? `${confirmation.studentEmail} ঠিকানায় নিশ্চিতকরণ ইমেইল পাঠানোর অনুরোধ করা হয়েছে। ইনবক্স ও স্প্যাম ফোল্ডার দেখুন।`
                  : `A confirmation email has been queued for ${confirmation.studentEmail}. Check your inbox and spam folder.`
                : confirmation.emailStatus === "unavailable"
                  ? isBn
                    ? "ইমেইল পাঠানো এখন চালু নেই। আপনার তথ্যের কপি ডাউনলোড করে রাখুন।"
                    : "Email delivery isn’t available yet. Download a copy of your details to keep."
                  : isBn
                    ? "ইমেইল ঠিকানা দেওয়া হয়নি। আপনার তথ্যের কপি ডাউনলোড করে রাখুন।"
                    : "No email address was provided. Download a copy of your details to keep."}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

"use client";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import {
  assessmentSchema,
  countries,
  tests,
  supportingDocumentOptions,
  CONSENT_TEXT,
  type Assessment,
  type Confirmation,
} from "@/lib/consultation/schema";
import { TurnstileField } from "@/components/turnstile-field";
import { localizedHref } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { AssessmentConfirmation } from "./assessment-confirmation";

const initial: Assessment = {
  name: "",
  dob: "",
  age: "",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  passport: "No",
  sscGrade: "",
  sscYear: "",
  hscStatus: "Completed",
  hscGrade: "",
  hscYear: "",
  bachelorGrade: "",
  bachelorYear: "",
  institution: "",
  lastDegree: "",
  lastSubject: "",
  previousDegreeResult: "",
  previousDegreeYear: "",
  studyGap: "No",
  gapDuration: "",
  gapExplanation: "",
  country: "Not Sure Yet",
  degree: "Bachelor's",
  subject: "",
  intake: "",
  intakeUnsure: false,
  languages: [{ test: "Not Taken", score: "" }],
  hskLevel: "",
  hskScore: "",
  supportingDocuments: [],
  otherInformation: "",
  publications: "",
  publicationCount: "",
  publicationDetails: "",
  recommendations: "",
  consent: false,
};
const groups = [
  ["name", "dob", "age", "phone", "whatsapp", "email", "location", "passport"],
  [
    "degree",
    "sscGrade",
    "sscYear",
    "hscStatus",
    "hscGrade",
    "hscYear",
    "bachelorGrade",
    "bachelorYear",
    "institution",
    "lastDegree",
    "lastSubject",
    "previousDegreeResult",
    "previousDegreeYear",
    "studyGap",
    "gapDuration",
    "gapExplanation",
  ],
  ["country", "degree", "subject", "intake"],
  [
    "languages",
    "hskLevel",
    "hskScore",
    "publications",
    "publicationCount",
    "publicationDetails",
    "recommendations",
    "supportingDocuments",
    "otherInformation",
    "consent",
  ],
];
const steps = [
  "Personal Information",
  "Academic Background",
  "Study Plan",
  "Language & Other Information",
];
const control =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 focus:border-blue-700 focus:outline-2 focus:outline-blue-700";
const button =
  "rounded-full bg-[#102b4e] px-6 py-3 font-semibold text-white disabled:opacity-50";
export function AssessmentForm({
  locale,
  introduction,
  initialStudyPlan,
}: {
  locale: Locale;
  introduction?: ReactNode;
  initialStudyPlan?: Partial<
    Pick<Assessment, "country" | "intake" | "otherInformation">
  >;
}) {
  const [a, setA] = useState<Assessment>(() => ({
    ...initial,
    ...initialStudyPlan,
  }));
  const [step, setStep] = useState(0);
  const [review, setReview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const key = useRef("");
  const locked = useRef(false);
  const website = useRef<HTMLInputElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const tracked = useRef(false);
  const update = (name: keyof Assessment, value: unknown) =>
    setA((prev) => ({ ...prev, [name]: value }));
  const field = (
    name: keyof Assessment,
    label: string,
    options?: readonly string[],
    type = "text",
    hint?: string,
  ) => (
    <div key={name}>
      <label htmlFor={name} className="font-medium text-slate-800">
        {label}
      </label>
      {options ? (
        <select
          id={name}
          className={control}
          value={String(a[name])}
          onChange={(e) => update(name, e.target.value)}
          aria-invalid={!!errors[name]}
          aria-describedby={`${name}-hint ${name}-error`}
        >
          {options.map((v) => (
            <option key={v} value={v}>
              {v || "Choose an option"}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          className={control}
          type={type}
          maxLength={
            type === "number"
              ? undefined
              : name === "gapExplanation" || name === "publicationDetails"
                ? 1500
                : 160
          }
          value={String(a[name])}
          onChange={(e) => update(name, e.target.value)}
          aria-invalid={!!errors[name]}
          aria-describedby={`${name}-hint ${name}-error`}
          autoComplete={
            (
              {
                name: "name",
                phone: "tel",
                email: "email",
                dob: "bday",
              } as Record<string, string>
            )[name]
          }
        />
      )}
      <p id={`${name}-hint`} className="mt-1 text-sm text-slate-500">
        {hint}
      </p>
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-700">
          {errors[name]}
        </p>
      )}
    </div>
  );
  const validate = (all = false) => {
    const result = assessmentSchema.safeParse(a);
    const found: Record<string, string> = {};
    if (!result.success)
      result.error.issues.forEach((i) => {
        const path = i.path.join(".");
        if (all || groups[step]!.includes(String(i.path[0])))
          found[path] = i.message;
      });
    setErrors(found);
    if (Object.keys(found).length) {
      setMessage("Please correct the highlighted answers.");
      if (all) {
        setReview(false);
        const index = groups.findIndex((g) =>
          g.includes(Object.keys(found)[0]!.split(".")[0]!),
        );
        if (index >= 0) setStep(index);
      }
      requestAnimationFrame(() =>
        document.getElementById(Object.keys(found)[0]!)?.focus(),
      );
      return false;
    }
    setMessage("");
    return true;
  };
  const move = (next: number) => {
    setStep(next);
    setMessage("");
    requestAnimationFrame(() => title.current?.focus());
  };
  async function submit() {
    if (locked.current || !validate(true)) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    if (!key.current) key.current = crypto.randomUUID();
    const params = new URLSearchParams(window.location.search);
    const attribution = Object.fromEntries(
      ["source", "medium", "campaign", "content", "term"].map((k) => [
        k,
        (params.get(`utm_${k}`) ?? "").slice(0, 160),
      ]),
    );
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: key.current,
          website: website.current?.value ?? "",
          turnstileToken: token,
          assessment: { ...a, attribution },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields ?? {});
        setMessage(data.error ?? "Please try again.");
        setReview(false);
        if (data.fields) {
          const first = Object.keys(data.fields)[0]?.split(".")[0] ?? "";
          const index = groups.findIndex((g) => g.includes(first));
          if (index >= 0) setStep(index);
        }
        setReset((n) => n + 1);
        return;
      }
      setConfirmation(data);
      requestAnimationFrame(() => {
        const heading = document.getElementById("assessment-success-heading");
        heading?.focus();
        heading?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
      setA(initial);
      if (!tracked.current) {
        tracked.current = true;
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer ?? [];
        w.dataLayer.push({
          event: "consultation_assessment_submitted",
          form_name: "student_assessment",
        });
      }
    } catch {
      setMessage(
        "We could not confirm your submission. Your answers are still here. Please try again.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  if (confirmation)
    return (
      <>
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-semibold tracking-wider text-[#92702c] uppercase">
            Study Abroad Consultant
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#102b4e] sm:text-4xl">
            {locale === "bn"
              ? "আপনার পরবর্তী পদক্ষেপ"
              : "Your next step starts here"}
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            {locale === "bn"
              ? "আপনার তথ্য জমা হয়েছে। কাউন্সেলরের যোগাযোগের তথ্য ও পরবর্তী নির্দেশনা নিচে দেখুন।"
              : "Your profile is submitted. Find your counsellor’s contact details and what happens next below."}
          </p>
        </header>
        <AssessmentConfirmation confirmation={confirmation} locale={locale} />
      </>
    );
  return (
    <>
      {introduction}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (review) void submit();
          else if (validate()) {
            if (step === 3) setReview(true);
            else move(step + 1);
          }
        }}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-10"
      >
        <ol
          aria-label="Assessment progress"
          className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {steps.map((s, i) => (
            <li
              key={s}
              aria-current={step === i ? "step" : undefined}
              className={`border-t-4 pt-3 text-sm ${step >= i ? "border-[#b88d38] text-[#102b4e]" : "border-slate-200 text-slate-500"}`}
            >
              <span className="font-bold">{i + 1}. </span>
              {s}
            </li>
          ))}
        </ol>
        <h2
          ref={title}
          tabIndex={-1}
          className="mb-6 text-xl font-semibold text-[#102b4e]"
        >
          {review ? "Review & Submit" : `${step + 1}. ${steps[step]}`}
        </h2>
        {message && (
          <p
            role="alert"
            className="mb-6 rounded-lg bg-red-50 p-3 text-red-800"
          >
            {message}
          </p>
        )}
        <div className="absolute -left-[10000px]" aria-hidden="true">
          <label>
            Website
            <input
              ref={website}
              tabIndex={-1}
              autoComplete="off"
              name="website"
            />
          </label>
        </div>
        {review ? (
          <div className="space-y-6">
            {groups.map((group, i) => (
              <section key={i}>
                <div className="flex justify-between">
                  <h3 className="font-semibold">{steps[i]}</h3>
                  <button
                    type="button"
                    className="text-blue-800 underline"
                    onClick={() => {
                      setReview(false);
                      move(i);
                    }}
                  >
                    Edit
                  </button>
                </div>
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  {group
                    .filter((k) => k !== "consent" && a[k as keyof Assessment])
                    .map((k) => (
                      <div
                        key={k}
                        className="min-w-0 rounded-lg bg-slate-50 p-3"
                      >
                        <dt className="text-sm text-slate-500">
                          {k.replace(/([A-Z])/g, " $1")}
                        </dt>
                        <dd className="mt-1 break-words">
                          {k === "languages"
                            ? a.languages
                                .map(
                                  (l) =>
                                    `${l.test}${l.score ? `: ${l.score}` : ""}`,
                                )
                                .join(", ")
                            : k === "supportingDocuments"
                              ? a.supportingDocuments?.join(", ") ||
                                "None selected"
                              : String(a[k as keyof Assessment])}
                        </dd>
                      </div>
                    ))}
                </dl>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {step === 0 && (
              <>
                {field("name", "Full name *")}
                {field(
                  "dob",
                  "Date of birth (or provide age)",
                  undefined,
                  "date",
                )}
                {field("age", "Age (if no date of birth)", undefined, "number")}
                {field(
                  "phone",
                  "Mobile number *",
                  undefined,
                  "tel",
                  "Bangladesh: 01XXXXXXXXX. Overseas: include +country code.",
                )}
                {field(
                  "whatsapp",
                  "WhatsApp number (only if different)",
                  undefined,
                  "tel",
                )}
                {field(
                  "email",
                  "Email (optional)",
                  undefined,
                  "email",
                  "Add your email to receive a copy of your reference and counsellor details.",
                )}
                {field("location", "Current district, city / country *")}
                {field("passport", "Passport availability *", [
                  "Yes",
                  "No",
                  "Applied / Processing",
                ])}
              </>
            )}
            {step === 1 && (
              <>
                {field("degree", "Intended degree level *", [
                  "Bachelor's",
                  "Master's",
                  "PhD",
                ])}
                {field(
                  "sscGrade",
                  "SSC / equivalent grade *",
                  undefined,
                  "text",
                  "Use your qualification's grading scale, e.g. 4.5/5, 82%, A.",
                )}
                {field(
                  "sscYear",
                  "SSC / equivalent passing year *",
                  undefined,
                  "number",
                )}
                {field("hscStatus", "HSC / equivalent status *", [
                  "Completed",
                  "Result Pending / Appearing",
                ])}
                {a.hscStatus === "Completed" &&
                  field("hscGrade", "HSC / equivalent grade *")}
                {field(
                  "hscYear",
                  a.hscStatus === "Completed"
                    ? "HSC passing year *"
                    : "Expected HSC passing year (optional)",
                  undefined,
                  "number",
                )}
                {a.degree !== "Bachelor's" && (
                  <>
                    {field("bachelorGrade", "Bachelor's CGPA / grade *")}
                    {field(
                      "bachelorYear",
                      "Bachelor's passing year *",
                      undefined,
                      "number",
                    )}
                    {field(
                      "institution",
                      "University / institution (optional)",
                    )}
                  </>
                )}
                {field("lastDegree", "Last degree / qualification *")}
                {field("lastSubject", "Last subject / major *")}
                {a.degree === "PhD" && (
                  <>
                    {field(
                      "previousDegreeResult",
                      "Most recent postgraduate result *",
                    )}
                    {field(
                      "previousDegreeYear",
                      "Postgraduate passing year *",
                      undefined,
                      "number",
                    )}
                  </>
                )}
                {field("studyGap", "Study gap *", ["No", "Yes"])}
                {a.studyGap === "Yes" && (
                  <>
                    {field(
                      "gapDuration",
                      "Study gap duration *",
                      undefined,
                      "text",
                      "For example: 2 years",
                    )}
                    {field(
                      "gapExplanation",
                      "Study gap explanation (optional)",
                    )}
                  </>
                )}
              </>
            )}
            {step === 2 && (
              <>
                {field("country", "Preferred country *", countries)}
                {field("degree", "Intended degree level *", [
                  "Bachelor's",
                  "Master's",
                  "PhD",
                ])}
                {field(
                  "subject",
                  "Preferred subject *",
                  undefined,
                  "text",
                  "For example: Computer Science, Business, or Not Sure Yet.",
                )}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={a.intakeUnsure}
                      onChange={(e) => update("intakeUnsure", e.target.checked)}
                    />
                    Intake: Not Sure Yet
                  </label>
                  {!a.intakeUnsure &&
                    field(
                      "intake",
                      "Preferred intake month and year *",
                      undefined,
                      "month",
                    )}
                </div>
                <p className="text-sm text-slate-500 sm:col-span-2">
                  Destination and programme availability will be reviewed with
                  your counsellor.
                </p>
              </>
            )}
            {step === 3 && (
              <>
                <div className="space-y-4 sm:col-span-2">
                  <h3 className="font-medium">Language proficiency *</h3>
                  {a.languages.map((l, i) => (
                    <div
                      key={i}
                      className="grid gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-2"
                    >
                      <div>
                        <label htmlFor={`test-${i}`}>Test / proficiency</label>
                        <select
                          id={`test-${i}`}
                          className={control}
                          value={l.test}
                          onChange={(e) =>
                            update(
                              "languages",
                              a.languages.map((v, j) =>
                                j === i
                                  ? { test: e.target.value, score: "" }
                                  : v,
                              ),
                            )
                          }
                        >
                          {tests.map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      {l.test !== "Not Taken" && (
                        <div>
                          <label htmlFor={`languages.${i}.score`}>
                            {l.test === "MOI"
                              ? "MOI availability / status"
                              : "Score / level"}
                          </label>
                          <input
                            id={`languages.${i}.score`}
                            className={control}
                            value={l.score}
                            maxLength={160}
                            onChange={(e) =>
                              update(
                                "languages",
                                a.languages.map((v, j) =>
                                  j === i ? { ...v, score: e.target.value } : v,
                                ),
                              )
                            }
                            aria-describedby={`language-error-${i}`}
                          />
                          <p
                            id={`language-error-${i}`}
                            className="text-sm text-red-700"
                          >
                            {errors[`languages.${i}.score`]}
                          </p>
                        </div>
                      )}
                      {a.languages.length > 1 && (
                        <button
                          type="button"
                          className="text-left text-sm text-red-700 underline"
                          onClick={() =>
                            update(
                              "languages",
                              a.languages.filter((_, j) => j !== i),
                            )
                          }
                        >
                          Remove test
                        </button>
                      )}
                    </div>
                  ))}
                  <p
                    id="languages"
                    role="alert"
                    className="text-sm text-red-700"
                  >
                    {errors.languages}
                  </p>
                  {a.languages.length < 10 && (
                    <button
                      type="button"
                      className="text-blue-800 underline"
                      onClick={() =>
                        update("languages", [
                          ...a.languages,
                          {
                            test:
                              tests.find(
                                (t) => !a.languages.some((l) => l.test === t),
                              ) ?? "Other Proficiency",
                            score: "",
                          },
                        ])
                      }
                    >
                      Add another language test
                    </button>
                  )}
                </div>
                {field(
                  "hskLevel",
                  "HSK level (optional)",
                  undefined,
                  "number",
                  a.country === "China"
                    ? "Add Chinese proficiency if available."
                    : undefined,
                )}
                {field("hskScore", "HSK score (optional)", undefined, "number")}
                {a.degree === "PhD" && (
                  <>
                    {field("publications", "Research publications *", [
                      "",
                      "Yes",
                      "No",
                    ])}
                    {a.publications === "Yes" && (
                      <>
                        {field(
                          "publicationCount",
                          "Number of publications (optional)",
                          undefined,
                          "number",
                        )}
                        {field(
                          "publicationDetails",
                          "Publication description (optional)",
                        )}
                      </>
                    )}
                  </>
                )}
                {a.degree !== "Bachelor's" &&
                  field("recommendations", "Recommendation letters *", [
                    "",
                    "Available",
                    "Not Available",
                    "In Progress",
                  ])}
                <fieldset className="sm:col-span-2">
                  <legend className="font-medium text-slate-800">
                    Supporting documents & activities (optional)
                  </legend>
                  <p
                    id="supporting-documents-hint"
                    className="mt-1 text-sm text-slate-500"
                  >
                    Select all documents and activities you have available.
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {supportingDocumentOptions.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-slate-800"
                      >
                        <input
                          type="checkbox"
                          name="supportingDocuments"
                          value={option}
                          className="mt-0.5 size-5 shrink-0 accent-blue-800"
                          checked={
                            a.supportingDocuments?.includes(option) ?? false
                          }
                          aria-describedby="supporting-documents-hint"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setA((prev) => ({
                              ...prev,
                              supportingDocuments: checked
                                ? [...(prev.supportingDocuments ?? []), option]
                                : (prev.supportingDocuments ?? []).filter(
                                    (value) => value !== option,
                                  ),
                            }));
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="otherInformation"
                    className="font-medium text-slate-800"
                  >
                    Other documents / any other info you want to share
                  </label>
                  <textarea
                    id="otherInformation"
                    name="otherInformation"
                    className={control}
                    rows={4}
                    maxLength={2000}
                    value={a.otherInformation ?? ""}
                    onChange={(e) => update("otherInformation", e.target.value)}
                    aria-invalid={!!errors.otherInformation}
                    aria-describedby="otherInformation-hint otherInformation-error"
                  />
                  <p
                    id="otherInformation-hint"
                    className="mt-1 text-sm text-slate-500"
                  >
                    Optional. Share any additional details (up to 2,000
                    characters).
                  </p>
                  {errors.otherInformation && (
                    <p
                      id="otherInformation-error"
                      className="mt-1 text-sm text-red-700"
                    >
                      {errors.otherInformation}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {(step === 3 || review) && (
          <div className="mt-8 space-y-4">
            <label className="flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                className="mt-1 size-5 shrink-0"
                checked={a.consent}
                onChange={(e) => update("consent", e.target.checked)}
                aria-describedby="consent-error"
              />
              <span>
                {CONSENT_TEXT}{" "}
                <Link
                  href={localizedHref("/privacy", locale)}
                  className="text-blue-800 underline"
                  target="_blank"
                >
                  Privacy policy
                </Link>
              </span>
            </label>
            <p id="consent-error" className="text-sm text-red-700">
              {errors.consent}
            </p>
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <TurnstileField
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onToken={setToken}
                resetSignal={reset}
              />
            )}
          </div>
        )}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={busy || (step === 0 && !review)}
            className="rounded-full border border-slate-300 px-6 py-3 disabled:opacity-40"
            onClick={() => {
              if (review) setReview(false);
              else move(step - 1);
            }}
          >
            Back
          </button>
          <button className={button} type="submit" disabled={busy}>
            {busy
              ? "Saving assessment…"
              : review
                ? "Submit assessment"
                : step === 3
                  ? "Review & Submit"
                  : "Continue"}
          </button>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          {locale === "bn"
            ? "আপনার প্রোফাইল মূল্যায়ন সবসময় বিনামূল্যে।"
            : "Your profile assessment is always free."}
        </p>
      </form>
    </>
  );
}

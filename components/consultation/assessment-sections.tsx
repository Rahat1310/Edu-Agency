import React from "react";
import type { AssessmentSection } from "@/lib/consultation/presentation";

export function AssessmentSections({
  sections,
  compact = false,
}: {
  sections: AssessmentSection[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-5">
      {sections.map(({ title, rows }) => (
        <section
          key={title}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <h3 className="border-b border-slate-100 bg-slate-50 px-5 py-4 font-semibold text-slate-900">
            {title}
          </h3>
          <dl
            className={`grid gap-x-8 px-5 ${compact ? "" : "sm:grid-cols-2"}`}
          >
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="min-w-0 border-b border-slate-100 py-4"
              >
                <dt className="text-sm text-slate-500">{label}</dt>
                <dd className="mt-1 break-words whitespace-pre-wrap text-slate-900">
                  {Array.isArray(value) ? (
                    <ul className="list-disc space-y-1 pl-5">
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

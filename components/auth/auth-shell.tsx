import { CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

type AuthShellProps = {
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
};

const PANEL_COPY = {
  "sign-in": {
    eyebrow: "Student & Counsellor Portal",
    heading: "Welcome back to your study journey.",
    body: "Sign in to check your application progress, review counsellor feedback, and manage your admission documents.",
    highlights: [
      "Track university offers and intake deadlines",
      "Upload & verify passport and academic files",
      "Direct updates from our Dhaka advisory desk",
    ],
  },
  "sign-up": {
    eyebrow: "Begin Your Application",
    heading: "Start your guided study route.",
    body: "Create your student account to shortlist universities, submit documents securely, and work directly with a dedicated counsellor.",
    highlights: [
      "Personalized shortlisting for 4 study destinations",
      "Step-by-step admission and visa checklist",
      "Free guidance from our Dhaka principal office",
    ],
  },
} as const;

export function AuthShell({ mode, children }: AuthShellProps) {
  const copy = PANEL_COPY[mode];

  return (
    <section className="relative overflow-hidden bg-[#f6f7f8] py-10 sm:py-16 lg:py-20">
      {/* Subtle website-themed ambient mesh & translucent glass ribbons */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 58% 68% at 82% 24%, rgba(196, 71, 28, 0.11), transparent 68%), radial-gradient(ellipse 52% 60% at 14% 82%, rgba(16, 43, 70, 0.08), transparent 68%), radial-gradient(ellipse 46% 52% at 64% 88%, rgba(22, 130, 181, 0.07), transparent 66%)",
          }}
        />
        {/* Frosted diagonal light planes behind the central glass card */}
        <div className="absolute -top-24 right-[16%] h-[140%] w-44 -skew-x-[11deg] border-x border-white/80 bg-gradient-to-b from-white/55 via-white/25 to-transparent" />
        <div className="absolute -top-24 right-[6%] h-[140%] w-24 -skew-x-[11deg] border-l border-white/70 bg-gradient-to-b from-white/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Frosted glass split card matching website palette */}
        <div className="relative overflow-hidden rounded-[24px] border border-white/95 bg-white/72 shadow-[0_24px_64px_-12px_rgba(16,43,70,0.12),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl">
          {/* Soft right-side glass tint */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] bg-gradient-to-br from-[#102b46]/[0.035] via-[#c4471c]/[0.035] to-white/45 lg:block"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-[1.12fr_1px_0.88fr]">
            {/* Left column: Clerk auth card */}
            <div className="flex items-center justify-center p-6 sm:p-10 lg:px-14 lg:py-12">
              <div className="auth-clerk-host w-full max-w-[460px]">
                {children}
              </div>
            </div>

            {/* Center hairline divider */}
            <div
              aria-hidden="true"
              className="my-10 hidden bg-gradient-to-b from-transparent via-slate-300/75 to-transparent lg:block"
            />

            {/* Right column: Editorial guidance panel */}
            <div className="flex flex-col justify-between border-t border-slate-200/70 bg-white/35 p-6 sm:p-10 lg:border-t-0 lg:bg-transparent lg:px-12 lg:py-12">
              <div>
                <p className="eyebrow-pill">{copy.eyebrow}</p>
                <h2 className="font-heading mt-3 text-2xl leading-[1.18] font-bold tracking-tight text-[#102b46] sm:text-[1.95rem]">
                  {copy.heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {copy.body}
                </p>

                <ul className="mt-7 space-y-3">
                  {copy.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-slate-700"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-[#c4471c]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 border-t border-slate-200/75 pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#102b46]">
                  <ShieldCheck
                    className="size-4 text-[#16704f]"
                    aria-hidden="true"
                  />
                  <span>
                    China &middot; India &middot; Malaysia &middot; South Korea
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <Link
                    href="/privacy"
                    className="transition-colors hover:text-[#c4471c]"
                  >
                    Privacy policy
                  </Link>
                  <Link
                    href="/contact"
                    className="transition-colors hover:text-[#c4471c]"
                  >
                    Need help? Contact us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const clerkAppearance = {
  layout: {
    logoImageUrl: "/logo.png",
  },
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorBackground: "var(--background)",
    colorForeground: "var(--foreground)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorDanger: "var(--destructive)",
    colorInput: "var(--input)",
    colorInputForeground: "var(--foreground)",
    colorNeutral: "var(--foreground)",
    colorBorder: "var(--border)",
    colorRing: "var(--ring)",
    borderRadius: "var(--radius)",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-card text-card-foreground border-border shadow-sm",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton:
      "border-border bg-background text-foreground hover:bg-muted",
    formFieldInput: "border-input bg-background text-foreground",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/80",
    footerActionLink: "text-primary",
  },
};

export const authCardAppearance = {
  layout: {
    socialButtonsPlacement: "bottom" as const,
  },
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "#c4471c",
    colorPrimaryForeground: "#ffffff",
    colorBackground: "transparent",
    colorForeground: "#102b46",
    colorMuted: "#f1f5f9",
    colorMutedForeground: "#475569",
    colorDanger: "#be123c",
    colorInput: "rgba(255, 255, 255, 0.88)",
    colorInputForeground: "#102b46",
    colorNeutral: "#102b46",
    colorBorder: "rgba(148, 163, 184, 0.42)",
    colorRing: "rgba(196, 71, 28, 0.28)",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full max-w-none shadow-none bg-transparent border-0",
    card: "w-full bg-transparent shadow-none border-0 p-0 gap-5",
    logoBox: "hidden",
    header: "text-left items-start gap-1.5",
    headerTitle:
      "font-heading text-2xl sm:text-[1.85rem] font-bold tracking-tight text-[#102b46] leading-tight",
    headerSubtitle: "text-sm text-slate-600 leading-relaxed",
    socialButtonsBlockButton:
      "h-11 rounded-xl border border-slate-200/90 bg-white/85 text-[#102b46] hover:bg-white hover:border-[#c4471c]/40 transition-all shadow-xs",
    socialButtonsBlockButtonText: "text-sm font-semibold text-slate-800",
    dividerLine: "bg-slate-200/80",
    dividerText:
      "text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400",
    formFieldLabel: "text-xs font-semibold text-[#102b46] mb-1.5",
    formFieldInput:
      "h-11 rounded-xl border border-slate-200/90 bg-white/90 px-3.5 text-sm text-[#102b46] placeholder:text-slate-400 focus:border-[#c4471c] focus:ring-2 focus:ring-[#c4471c]/20 shadow-2xs transition-colors",
    formFieldInputShowPasswordButton: "text-slate-500 hover:text-[#c4471c]",
    formFieldAction:
      "text-xs font-semibold text-[#c4471c] hover:text-[#a73612]",
    formButtonPrimary:
      "h-11 rounded-xl bg-[#c4471c] text-white font-semibold text-sm hover:bg-[#a73612] shadow-[0_8px_20px_-4px_rgba(196,71,28,0.35)] transition-all",
    footer:
      "bg-transparent bg-none border-t border-slate-200/75 pt-4 mt-2 [&>div]:bg-transparent",
    footerAction: "justify-center",
    footerActionText: "text-xs text-slate-500",
    footerActionLink:
      "text-xs font-semibold text-[#c4471c] hover:text-[#a73612]",
    identityPreview:
      "rounded-xl border border-slate-200/90 bg-white/80 px-3 py-2",
    identityPreviewText: "text-sm font-medium text-[#102b46]",
    identityPreviewEditButton:
      "text-xs font-semibold text-[#c4471c] hover:text-[#a73612]",
    otpCodeFieldInput:
      "rounded-xl border border-slate-200 bg-white text-[#102b46] focus:border-[#c4471c]",
    formResendCodeLink:
      "text-xs font-semibold text-[#c4471c] hover:text-[#a73612]",
    backLink: "text-xs font-medium text-slate-500 hover:text-[#102b46]",
    alert: "rounded-xl border border-rose-200 bg-rose-50/90 text-rose-800",
    alertText: "text-xs text-rose-800",
  },
};

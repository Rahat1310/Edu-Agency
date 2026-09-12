import type { FieldErrors } from "@/lib/validation-helpers";

export type LeadSubmitErrorCode =
  | "turnstile"
  | "rate_limit"
  | "validation"
  | "config"
  | "server";

export type LeadSubmitSuccess = {
  ok: true;
};

export type LeadSubmitFailure = {
  ok: false;
  code: LeadSubmitErrorCode;
  message: string;
  fields?: FieldErrors;
};

export type LeadSubmitResult = LeadSubmitSuccess | LeadSubmitFailure;

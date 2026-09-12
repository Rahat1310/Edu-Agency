import type { ProgramCountry, ProgramLevel, TuitionCurrency } from "@/db/schema";
import { intakeMonths } from "@/lib/schemas/program";

export const programCountryLabels: Record<ProgramCountry, string> = {
  china: "China",
  india: "India",
  malaysia: "Malaysia",
  south_korea: "South Korea",
};

export const programLevelLabels: Record<ProgramLevel, string> = {
  bachelor: "Bachelor",
  master: "Master",
  phd: "PhD",
  language: "Language",
  diploma: "Diploma",
};

export const tuitionCurrencyLabels: Record<TuitionCurrency, string> = {
  CNY: "CNY — Chinese Yuan",
  INR: "INR — Indian Rupee",
  MYR: "MYR — Malaysian Ringgit",
  KRW: "KRW — South Korean Won",
};

export const defaultCurrencyByCountry: Record<ProgramCountry, TuitionCurrency> =
  {
    china: "CNY",
    india: "INR",
    malaysia: "MYR",
    south_korea: "KRW",
  };

export const intakeMonthLabels = intakeMonths;

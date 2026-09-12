"use client";

import { ProgramCompareSkeleton } from "@/components/marketing/skeleton";
import { useDictionary } from "@/lib/i18n/use-locale";

export default function ProgramCompareLoading() {
  const dict = useDictionary();
  return <ProgramCompareSkeleton label={dict.programs.compare.loadingAria} />;
}

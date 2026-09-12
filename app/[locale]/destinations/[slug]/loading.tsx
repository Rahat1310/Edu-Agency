"use client";

import { DestinationPageSkeleton } from "@/components/marketing/skeleton";
import { useDictionary } from "@/lib/i18n/use-locale";

export default function DestinationLoading() {
  const dict = useDictionary();
  return (
    <DestinationPageSkeleton label={dict.intakeCountdown.loadingAria} />
  );
}

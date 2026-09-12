"use client";

import { DestinationPageSkeleton } from "@/components/marketing/skeleton";
import { useDictionary } from "@/lib/i18n/use-locale";

export default function PreDepartureLoading() {
  const dict = useDictionary();
  return <DestinationPageSkeleton label={dict.preDeparture.loadingAria} />;
}

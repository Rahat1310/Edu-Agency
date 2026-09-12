"use client";

import { SuccessStoriesSkeleton } from "@/components/marketing/skeleton";
import { useDictionary } from "@/lib/i18n/use-locale";

export default function SuccessStoriesLoading() {
  const dict = useDictionary();
  return <SuccessStoriesSkeleton label={dict.successStories.loadingAria} />;
}

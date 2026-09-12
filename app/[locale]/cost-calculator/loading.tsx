"use client";

import { CostCalculatorSkeleton } from "@/components/marketing/skeleton";
import { useDictionary } from "@/lib/i18n/use-locale";

export default function CostCalculatorLoading() {
  const dict = useDictionary();
  return <CostCalculatorSkeleton label={dict.costCalculator.loadingAria} />;
}

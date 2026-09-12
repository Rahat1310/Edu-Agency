"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { DeskToastProvider } from "@/components/desk/toast";

export function PortalProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <DeskToastProvider>{children}</DeskToastProvider>
    </MotionConfig>
  );
}

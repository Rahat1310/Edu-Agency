"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useDeskMotion } from "@/lib/desk/motion";

export function PortalPageFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reduce, panel } = useDeskMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
        transition={panel}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

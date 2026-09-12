"use client";

import { useReducedMotion, type Easing, type Transition } from "framer-motion";

const instant: Transition = { duration: 0 };
const easeOutExpo: Easing = [0.22, 1, 0.36, 1];

/**
 * Desk motion tokens. Every caller must use these so
 * prefers-reduced-motion collapses to an instant change.
 */
export function useDeskMotion() {
  const reduce = Boolean(useReducedMotion());

  const panel: Transition = reduce
    ? instant
    : { type: "tween", duration: 0.22, ease: easeOutExpo };
  const overlay: Transition = reduce
    ? instant
    : { type: "tween", duration: 0.18, ease: "easeOut" };
  const toast: Transition = reduce
    ? instant
    : { type: "tween", duration: 0.18, ease: easeOutExpo };
  const micro: Transition = reduce
    ? instant
    : { type: "tween", duration: 0.12, ease: "easeOut" };

  return { reduce, instant, panel, overlay, toast, micro };
}

export function slidePanel(reduce: boolean) {
  if (reduce) {
    return {
      initial: { x: 0, opacity: 1 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 0, opacity: 1 },
    };
  }

  return {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  };
}

export function fadeOverlay(reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 1 },
      animate: { opacity: 1 },
      exit: { opacity: 1 },
    };
  }

  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };
}

export function toastMotion(reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 1, y: 0 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 1, y: 0 },
    };
  }

  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
  };
}

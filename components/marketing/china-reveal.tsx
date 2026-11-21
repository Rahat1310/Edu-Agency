"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Progressive enhancement: content stays visible without JavaScript. */
export function ChinaReveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (
      !element ||
      preference.matches ||
      !element.animate ||
      !window.IntersectionObserver
    )
      return;
    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        animation = element.animate(
          [
            { opacity: 0, transform: "translateY(22px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 650,
            delay,
            easing: "cubic-bezier(.2,.7,.2,1)",
            fill: "backwards",
          },
        );
        observer.disconnect();
      },
      { threshold: 0.08 },
    );
    const reduceMotion = () => {
      if (preference.matches) animation?.finish();
    };
    preference.addEventListener("change", reduceMotion);
    observer.observe(element);
    return () => {
      observer.disconnect();
      animation?.cancel();
      preference.removeEventListener("change", reduceMotion);
    };
  }, [delay]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

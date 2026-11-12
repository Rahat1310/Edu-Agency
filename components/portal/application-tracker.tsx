"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Clock3,
  FileCheck2,
} from "lucide-react";
import Link from "next/link";
import {
  applicationTrackingSteps,
  trackingStatusLabels,
  type ApplicationTracking,
} from "@/lib/applications/tracking";
import { useDeskMotion } from "@/lib/desk/motion";
import { formatLeadDate } from "@/lib/leads/labels";
import styles from "./application-tracker.module.css";

export function ApplicationTracker({
  tracking,
  submittedAt,
  reference,
  live = false,
}: {
  tracking: ApplicationTracking;
  submittedAt: string | null;
  reference: string;
  live?: boolean;
}) {
  const { reduce, panel } = useDeskMotion();
  const router = useRouter();
  useEffect(() => {
    if (!live) return;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [live, router]);
  const complete = applicationTrackingSteps.filter(
    (step) => tracking[step.id]?.status === "completed",
  ).length;
  const blocked = applicationTrackingSteps.find(
    (step) => tracking[step.id]?.status === "blocked",
  );
  const current =
    blocked ??
    applicationTrackingSteps.find(
      (step) => tracking[step.id]?.status === "in_progress",
    ) ??
    applicationTrackingSteps.find(
      (step) => tracking[step.id]?.status !== "completed",
    );
  const entry = current ? tracking[current.id] : undefined;
  const latest = Object.values(tracking)
    .map((step) => step.updatedAt)
    .sort()
    .at(-1);
  const percent = Math.round(
    (complete / applicationTrackingSteps.length) * 100,
  );
  return (
    <section
      className={styles.tracker}
      aria-labelledby={`tracker-${reference}`}
    >
      <div className={styles.overview}>
        <div className={styles.eyebrow}>
          <span className={styles.smallMark}>
            <FileCheck2 size={15} aria-hidden="true" />
          </span>{" "}
          YOUR APPLICATION
        </div>
        <h2 id={`tracker-${reference}`} className={styles.title}>
          Every step.
          <br />
          <span>A little closer.</span>
        </h2>
        <p className={styles.reference}>{reference}</p>
        <div className={styles.progressHeading}>
          <span>
            {complete} of {applicationTrackingSteps.length} milestones complete
          </span>
          <span>{percent}%</span>
        </div>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Application milestones completed"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <motion.div
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.65, ease: "easeOut" }
            }
          />
        </div>
        <div
          className={blocked ? styles.problem : styles.current}
          aria-live="polite"
          aria-atomic="true"
        >
          <p className={styles.currentLabel}>
            {blocked ? (
              <AlertCircle size={15} aria-hidden="true" />
            ) : (
              <Clock3 size={15} aria-hidden="true" />
            )}
            {blocked
              ? "NEEDS YOUR ATTENTION"
              : !submittedAt
                ? "GET STARTED"
                : complete === applicationTrackingSteps.length
                  ? "ALL STEPS COMPLETE"
                  : entry?.status === "in_progress"
                    ? "HAPPENING NOW"
                    : "UP NEXT"}
          </p>
          <h3>
            {!submittedAt
              ? "Your journey starts here"
              : (current?.label ?? "Ready for your next chapter")}
          </h3>
          <p>
            {!submittedAt
              ? "Complete your application and submit it to start tracking your progress."
              : entry?.note ||
                current?.description ||
                "Your counsellor has confirmed every milestone. Keep in touch as you prepare to travel."}
          </p>
          {!submittedAt && (
            <Link href="/portal/application">
              Complete application <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
          {blocked && (
            <Link href="/portal/application">
              Review application <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>
        <p className={styles.footer}>
          {latest
            ? `Last updated ${formatLeadDate(latest)}`
            : "Updates will appear after you submit."}
          <br />
          Updated by your admissions team.
        </p>
      </div>
      <div className={styles.timelinePanel}>
        <div className={styles.timelineHeading}>
          <h3>Application journey</h3>
          <span>8 milestones</span>
        </div>
        <ol className={styles.timeline}>
          {applicationTrackingSteps.map((step, index) => {
            const saved = tracking[step.id];
            const status = saved?.status ?? "pending";
            const active = status === "in_progress";
            const isBlocked = status === "blocked";
            return (
              <motion.li
                key={step.id}
                className={styles.step}
                data-status={status}
                aria-current={active || isBlocked ? "step" : undefined}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...panel, delay: reduce ? 0 : index * 0.045 }}
              >
                <div className={styles.marker}>
                  {active && !reduce && (
                    <motion.span
                      className={styles.pulse}
                      animate={{ scale: [1, 1.55], opacity: [0.35, 0] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                  {status === "completed" ? (
                    <Check size={16} strokeWidth={2.5} aria-hidden="true" />
                  ) : isBlocked ? (
                    <AlertCircle size={17} aria-hidden="true" />
                  ) : (
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  )}
                </div>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>
                    <h4>{step.label}</h4>
                    <span className={styles.badge}>
                      {trackingStatusLabels[status]}
                    </span>
                  </div>
                  <p>{saved?.note || step.description}</p>
                  {saved && status !== "pending" && (
                    <time dateTime={saved.updatedAt}>
                      {formatLeadDate(saved.updatedAt)}
                    </time>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

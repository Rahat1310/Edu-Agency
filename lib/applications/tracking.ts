import { z } from "zod";

export const applicationTrackingSteps = [
  {
    id: "submitted",
    label: "Application submitted",
    description: "Your application has been sent to our team.",
  },
  {
    id: "received",
    label: "Received by team",
    description: "Your counsellor checks your application details.",
  },
  {
    id: "processing",
    label: "Processing started",
    description: "We review your course and university choices.",
  },
  {
    id: "documents",
    label: "Preparing documents",
    description: "We prepare your documents for the university.",
  },
  {
    id: "university",
    label: "Sent to university",
    description: "Your application is with the university for review.",
  },
  {
    id: "offer",
    label: "Offer received",
    description: "Your counsellor will explain your offer and conditions.",
  },
  {
    id: "visa",
    label: "Visa processing",
    description: "We help prepare and track your visa application.",
  },
  {
    id: "ready",
    label: "Ready to travel",
    description: "Your final arrangements are confirmed with your counsellor.",
  },
] as const;
export const trackingStepIds = [
  "submitted",
  "received",
  "processing",
  "documents",
  "university",
  "offer",
  "visa",
  "ready",
] as const;
export type TrackingStepId = (typeof trackingStepIds)[number];
export const trackingStatuses = [
  "pending",
  "in_progress",
  "completed",
  "blocked",
] as const;
export const trackingStatusLabels = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  blocked: "Needs attention",
};
const stepSchema = z.object({
  status: z.enum(trackingStatuses),
  note: z.string().max(2000),
  updatedAt: z.iso.datetime(),
});
export type TrackingStep = z.infer<typeof stepSchema>;
export type ApplicationTracking = Partial<Record<TrackingStepId, TrackingStep>>;
const trackingSchema = z.partialRecord(z.enum(trackingStepIds), stepSchema);
export function readApplicationTracking(
  value: unknown,
  submittedAt: string | null,
): ApplicationTracking {
  const parsed = trackingSchema.safeParse(value);
  const tracking: ApplicationTracking = parsed.success
    ? { ...parsed.data }
    : {};
  // Submission is a fact from the saved form, never a staff-editable milestone.
  if (submittedAt)
    tracking.submitted = {
      status: "completed",
      note: "",
      updatedAt: submittedAt,
    };
  else return {};
  return tracking;
}
export const trackingUpdateSchema = z
  .object({
    id: z.uuid(),
    version: z.number().int().nonnegative(),
    step: z
      .enum(trackingStepIds)
      .refine(
        (step) => step !== "submitted",
        "Submission is recorded automatically.",
      ),
    status: z.enum(trackingStatuses),
    note: z.string().trim().max(2000),
  })
  .superRefine((data, ctx) => {
    if (data.status === "blocked" && !data.note)
      ctx.addIssue({
        code: "custom",
        path: ["note"],
        message: "Explain the problem and what the student should do next.",
      });
  });
export type TrackingUpdate = z.infer<typeof trackingUpdateSchema>;
export function applyTrackingUpdate(
  tracking: ApplicationTracking,
  input: { step: TrackingStepId; status: TrackingStep["status"]; note: string },
  now: string,
):
  { ok: true; tracking: ApplicationTracking } | { ok: false; message: string } {
  if (input.step === "submitted")
    return { ok: false, message: "Submission is recorded automatically." };
  if (input.status === "blocked" && !input.note.trim())
    return { ok: false, message: "Add a reason the student can read." };
  const index = trackingStepIds.indexOf(input.step);
  if (
    (input.status === "in_progress" || input.status === "completed") &&
    trackingStepIds
      .slice(0, index)
      .some((id) => tracking[id]?.status !== "completed")
  )
    return {
      ok: false,
      message: "Complete the earlier steps before updating this one.",
    };
  if (
    (input.status === "pending" || input.status === "in_progress") &&
    trackingStepIds
      .slice(index + 1)
      .some((id) => tracking[id] && tracking[id]?.status !== "pending")
  )
    return {
      ok: false,
      message: "Reset the later steps first before reopening this step.",
    };
  return {
    ok: true,
    tracking: {
      ...tracking,
      [input.step]: {
        status: input.status,
        note: input.note.trim(),
        updatedAt: now,
      },
    },
  };
}

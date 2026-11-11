import { z } from "zod";
import { applicationDocumentKeys } from "@/lib/applications/documents";
import { universityReviewStatuses } from "@/lib/applications/schema";

export const applicationReviewSchema = z
  .object({
    id: z.uuid(),
    revision: z.number().int().nonnegative(),
    requestChanges: z.boolean(),
    reviewMessage: z.string().trim().max(2000),
    universityReview: z.enum(universityReviewStatuses),
    proposedUniversity: z.string().trim().max(160),
    universityNote: z.string().trim().max(2000),
    requestedDocuments: z
      .array(z.string().refine((key) => applicationDocumentKeys.includes(key)))
      .max(50),
    contactNote: z.string().trim().max(1000),
  })
  .superRefine((data, ctx) => {
    if (data.requestChanges && !data.reviewMessage)
      ctx.addIssue({
        code: "custom",
        path: ["reviewMessage"],
        message: "Explain what the student should correct.",
      });
    if (
      ["unavailable", "alternative_suggested", "agreed"].includes(
        data.universityReview,
      ) &&
      !data.universityNote
    )
      ctx.addIssue({
        code: "custom",
        path: ["universityNote"],
        message: "Explain the university update for the student.",
      });
    if (
      ["alternative_suggested", "agreed"].includes(data.universityReview) &&
      !data.proposedUniversity
    )
      ctx.addIssue({
        code: "custom",
        path: ["proposedUniversity"],
        message: "Enter the suggested or agreed university.",
      });
    if (data.universityReview === "agreed" && !data.contactNote)
      ctx.addIssue({
        code: "custom",
        path: ["contactNote"],
        message: "Record when and how the student agreed to this choice.",
      });
  });

export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;

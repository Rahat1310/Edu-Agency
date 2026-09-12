import { z } from "zod";

import { phoneSchema } from "@/lib/schemas/lead";

export const portalPhoneSchema = z.object({
  phone: phoneSchema,
});

export type PortalPhoneValues = z.infer<typeof portalPhoneSchema>;

export const resolveUnlinkedSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("link"),
    unlinkedAccountId: z.string().uuid(),
    leadId: z.string().uuid(),
  }),
  z.object({
    action: z.literal("create"),
    unlinkedAccountId: z.string().uuid(),
  }),
]);

export type ResolveUnlinkedInput = z.infer<typeof resolveUnlinkedSchema>;

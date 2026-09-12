import { z } from "zod";

export type FieldErrors = Record<string, string[]>;

export type ValidationSuccess<T> = {
  success: true;
  data: T;
};

export type ValidationFailure = {
  success: false;
  status: 400;
  error: {
    message: string;
    fields: FieldErrors;
  };
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Validate untrusted input with a Zod schema before any database call.
 * On failure, return this result as HTTP 400 with field-level messages.
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  input: unknown,
): ValidationResult<z.infer<T>> {
  const result = schema.safeParse(input);

  if (!result.success) {
    const fields: FieldErrors = {};

    for (const issue of result.error.issues) {
      const path =
        issue.path.length > 0 ? issue.path.map(String).join(".") : "_root";
      const existing = fields[path] ?? [];
      fields[path] = [...existing, issue.message];
    }

    return {
      success: false,
      status: 400,
      error: {
        message: "Validation failed",
        fields,
      },
    };
  }

  return { success: true, data: result.data };
}

export function validationErrorResponse(failure: ValidationFailure): Response {
  return Response.json(failure.error, { status: failure.status });
}

/**
 * Example schema — later phases should define a Zod schema per route/action
 * and call `validateRequest` before touching the database:
 *
 *   const parsed = validateRequest(examplePingSchema, await request.json());
 *   if (!parsed.success) return validationErrorResponse(parsed);
 */
export const examplePingSchema = z.object({
  message: z.string().trim().min(1).max(200),
});

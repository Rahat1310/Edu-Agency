import { z } from "zod";

const required = (name: string) =>
  z.string().trim().min(1, `${name} is missing or empty`);

/** Present in the schema so the gateway reads keys from `env`, but empty so marketing still boots. */
const optionalSecret = z.preprocess((value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).optional());

const envSchema = z.object({
  DATABASE_URL: required("DATABASE_URL"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: required(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  ),
  CLERK_SECRET_KEY: required("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: required("CLERK_WEBHOOK_SECRET"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().trim().min(1).default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().trim().min(1).default("/sign-up"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z
    .string()
    .trim()
    .min(1)
    .default("/portal"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z
    .string()
    .trim()
    .min(1)
    .default("/portal"),
  GROQ_API_KEY: optionalSecret,
  GEMINI_API_KEY: optionalSecret,
  OPENROUTER_API_KEY: optionalSecret,
});

export type Env = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  const names = [
    ...new Set(
      error.issues.map((issue) => {
        const name = issue.path[0];
        return typeof name === "string" || typeof name === "number"
          ? String(name)
          : "unknown";
      }),
    ),
  ];

  return `Missing or invalid environment variable${names.length === 1 ? "" : "s"}: ${names.join(", ")}. Add ${names.length === 1 ? "it" : "them"} to .env.local (see .env.example).`;
}

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(formatEnvError(result.error));
  }

  return result.data;
}

export const env = loadEnv();

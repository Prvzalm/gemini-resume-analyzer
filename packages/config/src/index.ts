import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import dotenv from "dotenv";

const optionalString = () =>
  z
    .string()
    .optional()
    .transform((value) => {
      if (typeof value !== "string") return undefined;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    });

function resolveEnvFile() {
  const customPath = process.env.ENV_FILE;
  if (customPath) {
    const absolute = path.isAbsolute(customPath)
      ? customPath
      : path.resolve(process.cwd(), customPath);
    if (fs.existsSync(absolute)) {
      return absolute;
    }
  }

  const searchRoots: string[] = [
    process.cwd(),
    path.resolve(process.cwd(), ".."),
    path.resolve(process.cwd(), "..", ".."),
    path.resolve(process.cwd(), "..", "..", ".."),
    path.resolve(__dirname, ".."),
    path.resolve(__dirname, "..", ".."),
    path.resolve(__dirname, "..", "..", ".."),
    path.resolve(__dirname, "..", "..", "..", ".."),
  ];

  for (const root of searchRoots) {
    const candidate = path.join(root, ".env");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

const envPath = resolveEnvFile();
dotenv.config(envPath ? { path: envPath } : undefined);

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: optionalString(),
    API_PORT: optionalString(),
    CLIENT_ORIGIN: optionalString(),
    NEXT_PUBLIC_API_BASE_URL: optionalString(),
    PROJECT_NAME: z.string().default("resume-analyzer"),
    CLOUDINARY_URL: optionalString(),
    CLOUDINARY_CLOUD_NAME: optionalString(),
    CLOUDINARY_API_KEY: optionalString(),
    CLOUDINARY_API_SECRET: optionalString(),
    CLOUDINARY_FOLDER: optionalString(),
    MONGO_URI: optionalString(),
  })
  .superRefine((value, ctx) => {
    const hasUrl = Boolean(value.CLOUDINARY_URL);
    const hasLegacy = Boolean(
      value.CLOUDINARY_CLOUD_NAME &&
        value.CLOUDINARY_API_KEY &&
        value.CLOUDINARY_API_SECRET
    );
    if (!hasUrl && !hasLegacy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Provide either CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET",
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv() {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Invalid environment variables: ${parsed.error.message}`);
    }
    cached = parsed.data;
  }
  return cached;
}

import axios from "axios";
import pdf from "pdf-parse";
import { v2 as cloudinary } from "cloudinary";
import { loadEnv } from "@resume-analyzer/config";

const env = loadEnv();

if (env.CLOUDINARY_URL) {
  cloudinary.config(env.CLOUDINARY_URL);
} else {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
  });
}

export async function uploadResumeToCloudinary(input: {
  resumeUrl?: string;
  fileBase64?: string;
}) {
  if (!input.resumeUrl && !input.fileBase64) {
    throw new Error("Resume source missing: provide resumeUrl or fileBase64");
  }
  const folder = env.CLOUDINARY_FOLDER ?? env.PROJECT_NAME ?? "resume-analyzer";
  const asset = input.resumeUrl ?? input.fileBase64!;
  const upload = await cloudinary.uploader.upload(asset, {
    resource_type: "raw",
    folder,
  });
  return upload;
}

export async function extractTextFromCloudinary(secureUrl: string) {
  const response = await axios.get<ArrayBuffer>(secureUrl, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data);
  const parsed = await pdf(buffer);
  return parsed.text;
}

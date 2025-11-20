# Resume Analyzer Build Manual (Nov 20 2025)

This document is the literal build log for `resume-analyzer`. Follow it line by line and you can recreate the entire monorepo without asking an AI for fillers or missing snippets.

---

## 2. Build Shared Packages (`packages/*`)

### 2.1 `@resume-analyzer/core` (heuristics + tests)

1. Scaffold directories and install dependencies:

   ```cmd
   mkdir packages
   mkdir packages\core packages\core\src packages\core\test
   npm init -y --workspace packages/core
   npm install zod@3.23.8 --workspace packages/core
   npm install --save-dev typescript@5.4.5 vitest@1.6.0 --workspace packages/core
   ```

---

## 3. Build the Express API (`apps/api`)

1. Scaffold and install dependencies:

   ```cmd
   mkdir apps apps\api apps\api\src
   npm init -y --workspace apps/api
   npm install @resume-analyzer/config@file:../../packages/config @resume-analyzer/core@file:../../packages/core axios@1.6.8 cloudinary@1.41.3 cors@2.8.5 express@4.19.2 pdf-parse@1.1.1 zod@3.23.8 --workspace apps/api
   npm install --save-dev typescript@5.4.5 ts-node-dev@2.0.0 @types/node@20.11.30 @types/express@4.17.21 @types/cors@2.8.17 --workspace apps/api
   ```

---

## 4. Build the Next.js Frontend (`apps/web`)

1. Scaffold and install frontend dependencies:

   ```cmd
   mkdir apps\web apps\web\src apps\web\src\app
   npm init -y --workspace apps/web
   npm install next@16.0.3 react@19.2.0 react-dom@19.2.0 @resume-analyzer/ui@file:../../packages/ui --workspace apps/web
   npm install --save-dev typescript@5 @types/node@20 @types/react@19 @types/react-dom@19 eslint@9 eslint-config-next@16.0.3 @tailwindcss/postcss@4 tailwindcss@4 babel-plugin-react-compiler@1.0.0 --workspace apps/web
   ```

2. `apps/web/package.json`:

   ```json
   {
     "name": "web",
     "version": "0.1.0",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "eslint"
     },
     "dependencies": {
       "@resume-analyzer/ui": "file:../../packages/ui",
       "next": "16.0.3",
       "react": "19.2.0",
       "react-dom": "19.2.0"
     },
     "devDependencies": {
       "@tailwindcss/postcss": "^4",
       "@types/node": "^20",
       "@types/react": "^19",
       "@types/react-dom": "^19",
       "babel-plugin-react-compiler": "1.0.0",
       "eslint": "^9",
       "eslint-config-next": "16.0.3",
       "tailwindcss": "^4",
       "typescript": "^5"
     }
   }
   ```

3. `apps/web/tsconfig.json` extends the root base config to enable Next.js/React 19:

   ```jsonc
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "target": "ES2017",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": true,
       "skipLibCheck": true,
       "strict": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "react-jsx",
       "incremental": true,
       "plugins": [{ "name": "next" }],
       "paths": { "@/*": ["./src/*"] }
     },
     "include": [
       "next-env.d.ts",
       "**/*.ts",
       "**/*.tsx",
       ".next/types/**/*.ts",
       ".next/dev/types/**/*.ts",
       "**/*.mts"
     ],
     "exclude": ["node_modules"]
   }
   ```

4. `apps/web/next.config.ts` keeps the setup minimal but enables the React Compiler preview:

   ```ts
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     reactCompiler: true,
   };

   export default nextConfig;
   ```

5. `apps/web/eslint.config.mjs` layers Next.js presets and re-exposes default ignores:

   ```js
   import { defineConfig, globalIgnores } from "eslint/config";
   import nextVitals from "eslint-config-next/core-web-vitals";
   import nextTs from "eslint-config-next/typescript";

   const eslintConfig = defineConfig([
     ...nextVitals,
     ...nextTs,
     globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
   ]);

   export default eslintConfig;
   ```

6. Tailwind v4 is powered via PostCSS config in `apps/web/postcss.config.mjs`:

   ```js
   const config = {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };

   export default config;
   ```

7. Global styles (`apps/web/src/app/globals.css`) import Tailwind’s reset and define CSS variables for light/dark themes:

   ```css
   @import "tailwindcss";

   :root {
     --background: #ffffff;
     --foreground: #171717;
   }

   @theme inline {
     --color-background: var(--background);
     --color-foreground: var(--foreground);
     --font-sans: var(--font-geist-sans);
     --font-mono: var(--font-geist-mono);
   }

   @media (prefers-color-scheme: dark) {
     :root {
       --background: #0a0a0a;
       --foreground: #ededed;
     }
   }

   body {
     background: var(--background);
     color: var(--foreground);
     font-family: Arial, Helvetica, sans-serif;
   }
   ```

8. The root layout (`apps/web/src/app/layout.tsx`) wires Google’s Geist fonts and exposes metadata for the whole experience:

   ```tsx
   import type { Metadata } from "next";
   import { Geist, Geist_Mono } from "next/font/google";
   import "./globals.css";

   const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
   });

   const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
   });

   export const metadata: Metadata = {
     title: "Resume Analyzer SaaS",
     description: "AI-powered resume and job match assistant",
   };

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body
           className={`${geistSans.variable} ${geistMono.variable} antialiased`}
         >
           {children}
         </body>
       </html>
     );
   }
   ```

9. The main page (`apps/web/src/app/page.tsx`) is a client component that lets users upload a PDF or paste a URL, then hits the Express API. Keep the `NEXT_PUBLIC_API_BASE_URL` env handy for deployments.

   ```tsx
   "use client";

   import { useState, useTransition, type ChangeEvent } from "react";
   import { Button, Card } from "@resume-analyzer/ui";

   const API_BASE =
     process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

   interface MatchResult {
     candidateName: string;
     targetRole: string;
     score: {
       finalScore: number;
       similarity: number;
       keywordCoverage: number;
       senioritySignal: number;
       summary: string;
     };
     ats: {
       total: number;
       sections: Array<{ name: string; score: number; insights: string[] }>;
     };
     rewrite: { pitch: string; summary: string; bulletPoints: string[] };
     cloudinaryUrl: string;
     createdAt: string;
   }

   export default function Home() {
     const [form, setForm] = useState({
       resumeUrl: "",
       jobDescription: "",
       candidateName: "You",
       targetRole: "Product Engineer",
     });
     const [result, setResult] = useState<MatchResult | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [fileData, setFileData] = useState<{
       name: string;
       base64: string;
     } | null>(null);
     const [isFileProcessing, setIsFileProcessing] = useState(false);
     const [isPending, startTransition] = useTransition();

     const handleChange =
       (field: keyof typeof form) =>
       (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         setForm((prev) => ({ ...prev, [field]: event.target.value }));
       };

     const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
       const selected = event.target.files?.[0];
       if (!selected) {
         setFileData(null);
         return;
       }
       if (selected.type !== "application/pdf") {
         setError("Only PDF files are supported right now");
         return;
       }
       const maxBytes = 6 * 1024 * 1024;
       if (selected.size > maxBytes) {
         setError("PDF is too large (max 6MB)");
         return;
       }
       setIsFileProcessing(true);
       setError(null);
       try {
         const base64 = await fileToBase64(selected);
         setFileData({ name: selected.name, base64 });
         setForm((prev) => ({ ...prev, resumeUrl: "" }));
       } catch (err) {
         setError(err instanceof Error ? err.message : "Failed to read file");
         setFileData(null);
       } finally {
         setIsFileProcessing(false);
       }
     };

     const handleAnalyze = () => {
       setError(null);
       startTransition(async () => {
         try {
           const payload = {
             ...form,
             resumeUrl: fileData ? undefined : form.resumeUrl,
             fileBase64: fileData?.base64,
           };
           const response = await fetch(`${API_BASE}/api/uploads/resume`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify(payload),
           });
           if (!response.ok) {
             const message = await response.text();
             throw new Error(message || "Failed to analyze resume");
           }
           const data: MatchResult = await response.json();
           setResult(data);
         } catch (err) {
           setError(err instanceof Error ? err.message : "Unexpected error");
           setResult(null);
         }
       });
     };

     const canSubmit = Boolean(
       form.jobDescription && (form.resumeUrl || fileData) && !isFileProcessing
     );

     return (
       <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
         <main className="mx-auto flex w-full max-w-6xl flex-col gap-10">
           <header className="text-center text-white px-4">
             <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200">
               Resume Analyzer
             </p>
             <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
               Upload a resume, paste a JD, get instant ATS insights
             </h1>
             <p className="mt-4 text-base text-slate-200">
               Paste any public PDF link{" "}
               <span className="font-semibold">or</span> upload the file from
               your desktop. We store it securely, run a match score, and return
               rewrite-ready tips.
             </p>
           </header>

           <div className="grid gap-6 lg:grid-cols-2">
             <Card title="Upload details" className="p-5 sm:p-6 lg:p-8">
               <label className="flex flex-col gap-2">
                 <span className="text-sm font-medium text-slate-700">
                   Public PDF URL
                 </span>
                 <input
                   type="url"
                   value={form.resumeUrl}
                   onChange={handleChange("resumeUrl")}
                   placeholder="https://.../resume.pdf"
                   className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                 />
               </label>
               <div className="mt-4">
                 <label className="flex flex-col gap-2">
                   <span className="text-sm font-medium text-slate-700">
                     or Upload PDF
                   </span>
                   <input
                     type="file"
                     accept="application/pdf"
                     onChange={handleFileChange}
                     className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-none file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-800"
                   />
                 </label>
                 {fileData && (
                   <p className="mt-2 text-xs text-slate-500">
                     Selected:{" "}
                     <span className="font-medium">{fileData.name}</span>
                   </p>
                 )}
                 {isFileProcessing && (
                   <p className="mt-2 text-xs text-purple-600">
                     Processing PDF…
                   </p>
                 )}
               </div>
               <label className="mt-4 flex flex-col gap-2">
                 <span className="text-sm font-medium text-slate-700">
                   Job description
                 </span>
                 <textarea
                   value={form.jobDescription}
                   onChange={handleChange("jobDescription")}
                   rows={8}
                   placeholder="Paste the JD here..."
                   className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                 />
               </label>
               <div className="mt-4 grid gap-4 sm:grid-cols-2">
                 <label className="flex flex-col gap-2">
                   <span className="text-sm font-medium text-slate-700">
                     Candidate name
                   </span>
                   <input
                     type="text"
                     value={form.candidateName}
                     onChange={handleChange("candidateName")}
                     className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                   />
                 </label>
                 <label className="flex flex-col gap-2">
                   <span className="text-sm font-medium text-slate-700">
                     Target role
                   </span>
                   <input
                     type="text"
                     value={form.targetRole}
                     onChange={handleChange("targetRole")}
                     className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                   />
                 </label>
               </div>
               <div className="mt-6 flex items-center justify-between">
                 <span className="text-xs text-slate-500">
                   Attach a public link or upload a PDF (stored securely in
                   Cloudinary).
                 </span>
                 <Button
                   onClick={handleAnalyze}
                   disabled={isPending || !canSubmit}
                   className="shadow-lg shadow-purple-300/40"
                 >
                   {isPending ? "Analyzing..." : "Analyze resume"}
                 </Button>
               </div>
               {!form.jobDescription && (
                 <p className="mt-3 text-xs text-amber-600">
                   Paste the job description to activate the analyzer.
                 </p>
               )}
               {!form.resumeUrl && !fileData && (
                 <p className="mt-1 text-xs text-amber-600">
                   Provide a public URL or upload a PDF file.
                 </p>
               )}
               {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
             </Card>

             <Card
               title="Result"
               className="bg-slate-900 text-white border-0 flex h-full min-h-128 flex-col md:h-auto p-5 sm:p-6 lg:p-8"
             >
               {result ? (
                 <div
                   className="space-y-4 overflow-y-auto pr-2"
                   style={{ maxHeight: "40rem" }}
                 >
                   <div>
                     <p className="text-sm uppercase tracking-wide text-slate-400">
                       Match score
                     </p>
                     <p className="text-5xl font-extrabold">
                       {result.score.finalScore}%
                     </p>
                     <p className="text-sm text-slate-300">
                       {result.score.summary}
                     </p>
                   </div>
                   <div className="grid gap-3 sm:grid-cols-3">
                     <Metric
                       label="Similarity"
                       value={`${result.score.similarity}%`}
                     />
                     <Metric
                       label="Keywords"
                       value={`${result.score.keywordCoverage}%`}
                     />
                     <Metric
                       label="Seniority"
                       value={`${result.score.senioritySignal}%`}
                     />
                   </div>
                   <div>
                     <p className="text-sm font-semibold">
                       ATS Breakdown ({result.ats.total}%)
                     </p>
                     <ul className="mt-2 space-y-2 text-sm text-slate-200">
                       {result.ats.sections.map((section) => (
                         <li key={section.name}>
                           <strong>{section.name}: </strong>
                           {section.score}% – {section.insights.join(" ")}
                         </li>
                       ))}
                     </ul>
                   </div>
                   <div>
                     <p className="text-sm font-semibold">Rewrite ideas</p>
                     <p className="mt-1 text-sm text-slate-300">
                       {result.rewrite.summary}
                     </p>
                     <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-200">
                       {result.rewrite.bulletPoints.map((point) => (
                         <li key={point}>{point}</li>
                       ))}
                     </ul>
                   </div>
                 </div>
               ) : (
                 <div className="flex h-full min-h-80 flex-col items-center justify-center text-center text-sm text-slate-300">
                   <p>
                     Run your first analysis to see ATS scores, rewrite prompts,
                     and candidate ranking insights.
                   </p>
                 </div>
               )}
             </Card>
           </div>
         </main>
       </div>
     );
   }

   function Metric({ label, value }: { label: string; value: string }) {
     return (
       <div className="rounded-xl bg-slate-800/60 p-4 text-center">
         <p className="text-xs uppercase tracking-widest text-slate-400">
           {label}
         </p>
         <p className="mt-2 text-2xl font-bold text-white">{value}</p>
       </div>
     );
   }

   function fileToBase64(file: File) {
     return new Promise<string>((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => {
         const result = reader.result;
         if (typeof result === "string") {
           resolve(result);
         } else {
           reject(new Error("Could not read file"));
         }
       };
       reader.onerror = () =>
         reject(reader.error ?? new Error("File read error"));
       reader.readAsDataURL(file);
     });
   }
   ```

10. `apps/api/package.json`:

    ```json
    {
      "name": "@resume-analyzer/api",
      "version": "0.1.0",
      "private": true,
      "type": "commonjs",
      "main": "dist/server.js",
      "scripts": {
        "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
        "build": "tsc -p tsconfig.json",
        "start": "node dist/server.js",
        "lint": "tsc --noEmit -p tsconfig.json"
      },
      "dependencies": {
        "@resume-analyzer/config": "file:../../packages/config",
        "@resume-analyzer/core": "file:../../packages/core",
        "axios": "^1.6.8",
        "cloudinary": "^1.41.3",
        "cors": "^2.8.5",
        "express": "^4.19.2",
        "pdf-parse": "^1.1.1",
        "zod": "^3.23.8"
      },
      "devDependencies": {
        "@types/cors": "^2.8.17",
        "@types/express": "^4.17.21",
        "@types/node": "^20.11.30",
        "ts-node-dev": "^2.0.0",
        "typescript": "^5.4.5"
      }
    }
    ```

11. `apps/api/tsconfig.json`:

    ```jsonc
    {
      "extends": "../../tsconfig.base.json",
      "compilerOptions": {
        "outDir": "dist",
        "rootDir": "src",
        "module": "CommonJS",
        "moduleResolution": "Node"
      },
      "include": ["src"],
      "exclude": ["node_modules", "dist"]
    }
    ```

12. Create the following source files under `apps/api/src`:

    - `server.ts`
    - `routes/resume-router.ts`
    - `routes/match-router.ts`
    - `services/cloudinary-service.ts`
    - `services/resume-service.ts`
    - `data/memory-store.ts`
    - `utils/logger.ts`
    - `types.ts`
    - `types/pdf-parse.d.ts`

    `server.ts`

    ```typescript
    import cors from "cors";
    import express, {
      type NextFunction,
      type Request,
      type Response,
    } from "express";
    import { loadEnv } from "@resume-analyzer/config";
    import matchRouter from "./routes/match-router";
    import resumeRouter from "./routes/resume-router";
    import { buildRequestLogger } from "./utils/logger";

    const env = loadEnv();

    const app = express();
    app.use(cors({ origin: env.CLIENT_ORIGIN ?? "*", credentials: true }));
    app.use(express.json({ limit: "15mb" }));
    app.use(buildRequestLogger());

    app.get("/health", (_, res) => {
      res.json({
        status: "ok",
        service: "resume-api",
        timestamp: new Date().toISOString(),
      });
    });

    app.use("/api/uploads", resumeRouter);
    app.use("/api/matches", matchRouter);

    app.use(
      (error: Error, _req: Request, res: Response, _next: NextFunction) => {
        console.error("Unexpected error", error);
        res.status(500).json({ message: error.message ?? "Unexpected error" });
      }
    );

    const port = Number(env.API_PORT ?? env.PORT ?? 4000);
    app.listen(port, () => {
      console.log(`🔌 Resume API listening on http://localhost:${port}`);
    });
    ```

    `routes/resume-router.ts`

    ```typescript
    import { Router } from "express";
    import { z } from "zod";
    import { buildResumeInsight } from "../services/resume-service";

    const router = Router();

    const uploadSchema = z
      .object({
        resumeUrl: z.string().url().optional(),
        fileBase64: z.string().min(1).optional(),
        jobDescription: z.string().min(10),
        candidateName: z.string().default("Candidate"),
        targetRole: z.string().default("Software Engineer"),
      })
      .refine((data) => data.resumeUrl || data.fileBase64, {
        message: "Provide either a resume URL or a PDF upload",
        path: ["resumeUrl"],
      });

    router.post("/resume", async (req, res, next) => {
      try {
        const payload = uploadSchema.parse(req.body);
        const result = await buildResumeInsight(payload);
        res.json(result);
      } catch (error) {
        next(error);
      }
    });

    export default router;
    ```

    `routes/match-router.ts`

    ```typescript
    import { Router } from "express";
    import { z } from "zod";
    import {
      rankCandidates,
      scoreResumeText,
    } from "../services/resume-service";

    const router = Router();

    const scoreSchema = z.object({
      resumeText: z.string().min(50),
      jobDescription: z.string().min(50),
    });

    router.post("/score", async (req, res, next) => {
      try {
        const payload = scoreSchema.parse(req.body);
        const score = await scoreResumeText(payload);
        res.json(score);
      } catch (error) {
        next(error);
      }
    });

    const rankSchema = z.object({
      jobDescription: z.string().min(50),
      candidates: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          resumeText: z.string().min(50),
        })
      ),
    });

    router.post("/rankings", async (req, res, next) => {
      try {
        const payload = rankSchema.parse(req.body);
        const ranking = await rankCandidates(payload);
        res.json(ranking);
      } catch (error) {
        next(error);
      }
    });

    export default router;
    ```

    `services/cloudinary-service.ts`

    ```typescript
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
        throw new Error(
          "Resume source missing: provide resumeUrl or fileBase64"
        );
      }
      const folder =
        env.CLOUDINARY_FOLDER ?? env.PROJECT_NAME ?? "resume-analyzer";
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
    ```

    `services/resume-service.ts`

    ```typescript
    import type { MatchResult } from "../types";
    import { memoryStore } from "../data/memory-store";
    import {
      extractTextFromCloudinary,
      uploadResumeToCloudinary,
    } from "./cloudinary-service";
    import {
      buildAtsBreakdown,
      rankCandidates as rankCandidateCore,
      rewriteResume,
      scoreResumeAgainstJob,
      type RankingResult,
    } from "@resume-analyzer/core";

    interface UploadPayload {
      resumeUrl?: string;
      fileBase64?: string;
      jobDescription: string;
      candidateName: string;
      targetRole: string;
    }

    export async function buildResumeInsight(
      payload: UploadPayload
    ): Promise<MatchResult> {
      const uploadResult = await uploadResumeToCloudinary({
        resumeUrl: payload.resumeUrl,
        fileBase64: payload.fileBase64,
      });
      const resumeText = await extractTextFromCloudinary(
        uploadResult.secure_url
      );

      const score = scoreResumeAgainstJob(
        resumeText,
        payload.jobDescription,
        payload.targetRole
      );
      const ats = buildAtsBreakdown(resumeText, payload.jobDescription);
      const rewrite = rewriteResume(
        resumeText,
        payload.jobDescription,
        payload.targetRole
      );

      const result: MatchResult = {
        id: uploadResult.public_id,
        candidateName: payload.candidateName,
        targetRole: payload.targetRole,
        score,
        ats,
        rewrite,
        resumeText,
        cloudinaryUrl: uploadResult.secure_url,
        createdAt: new Date().toISOString(),
      };

      memoryStore.insert(result);
      return result;
    }

    export async function scoreResumeText(params: {
      resumeText: string;
      jobDescription: string;
    }) {
      return scoreResumeAgainstJob(params.resumeText, params.jobDescription);
    }

    export async function rankCandidates(input: {
      jobDescription: string;
      candidates: Array<{ id: string; name: string; resumeText: string }>;
    }): Promise<RankingResult> {
      const ranking = rankCandidateCore(input.jobDescription, input.candidates);
      return ranking;
    }

    export function getRecentMatches(limit = 5) {
      return memoryStore.getRecent(limit);
    }
    ```

    `data/memory-store.ts`

    ```typescript
    import type { MatchResult } from "../types.js";

    class MemoryStore {
      private matches: MatchResult[] = [];

      insert(match: MatchResult) {
        this.matches.unshift(match);
        this.matches = this.matches.slice(0, 50);
      }

      getRecent(limit = 5) {
        return this.matches.slice(0, limit);
      }
    }

    export const memoryStore = new MemoryStore();
    ```

    `utils/logger.ts`

    ```typescript
    import { Request, Response, NextFunction } from "express";

    export function buildRequestLogger() {
      return (req: Request, res: Response, next: NextFunction) => {
        const started = Date.now();
        res.on("finish", () => {
          const ms = Date.now() - started;
          console.log(
            `${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms}ms)`
          );
        });
        next();
      };
    }
    ```

    `types.ts`

    ```typescript
    import type {
      AtsBreakdown,
      RankingResult,
      RewritePlan,
      ResumeScore,
    } from "@resume-analyzer/core";

    export interface MatchResult {
      id: string;
      candidateName: string;
      targetRole: string;
      resumeText: string;
      cloudinaryUrl: string;
      score: ResumeScore;
      ats: AtsBreakdown;
      rewrite: RewritePlan;
      createdAt: string;
    }

    export type { RankingResult };
    ```

    `types/pdf-parse.d.ts`

    ```typescript
    declare module "pdf-parse" {
      interface PDFInfo {
        numpages: number;
        numrender: number;
        info: Record<string, unknown>;
        metadata: unknown;
        version: string;
      }

      interface PDFParseResult {
        numpages: number;
        numrender: number;
        info: PDFInfo;
        metadata: unknown;
        text: string;
        version: string;
      }

      function pdf(data: Buffer): Promise<PDFParseResult>;
      export = pdf;
    }
    ```

### 2.2 `@resume-analyzer/config` (env loader)

1. Scaffold folders and install dependencies:

   ```cmd
   mkdir packages\config packages\config\src
   npm init -y --workspace packages/config
   npm install dotenv@16.4.5 zod@3.23.8 --workspace packages/config
   npm install --save-dev typescript@5.4.5 --workspace packages/config
   ```

2. `packages/config/package.json`:

   ```json
   {
     "name": "@resume-analyzer/config",
     "version": "0.1.0",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist"],
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "lint": "tsc --noEmit -p tsconfig.json",
       "prepare": "npm run build"
     },
     "dependencies": {
       "dotenv": "^16.4.5",
       "zod": "^3.23.8"
     },
     "devDependencies": { "typescript": "^5.4.5" }
   }
   ```

### 2.3 `@resume-analyzer/ui` (shared Button + Card)

1. Scaffold the package:

   ```cmd
   mkdir packages\ui packages\ui\src
   npm init -y --workspace packages/ui
   npm install --save-dev typescript@5.4.5 @types/react@18.2.66 @types/react-dom@18.2.21 --workspace packages/ui
   ```

2. `packages/ui/package.json`:

   ```json
   {
     "name": "@resume-analyzer/ui",
     "version": "0.1.0",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist"],
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "lint": "tsc --noEmit -p tsconfig.json",
       "prepare": "npm run build"
     },
     "peerDependencies": {
       "react": "^18.0.0",
       "react-dom": "^18.0.0"
     },
     "devDependencies": {
       "@types/react": "^18.2.66",
       "@types/react-dom": "^18.2.21",
       "typescript": "^5.4.5"
     }
   }
   ```

3. `packages/ui/tsconfig.json`:

   ```jsonc
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": "src",
       "declaration": true,
       "jsx": "react-jsx"
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

4. Components:

   `src/index.ts`

   ```typescript
   export * from "./button.js";
   export * from "./card.js";
   ```

   `src/button.tsx`

   ```tsx
   import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

   interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
     variant?: "primary" | "ghost";
   }

   export function Button({
     children,
     className = "",
     variant = "primary",
     ...props
   }: PropsWithChildren<ButtonProps>) {
     const base =
       "rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:ring";
     const variants: Record<typeof variant, string> = {
       primary:
         "bg-purple-600 text-white hover:bg-purple-500 focus-visible:ring-purple-300",
       ghost:
         "bg-transparent text-purple-700 hover:bg-purple-50 focus-visible:ring-purple-200",
     } as const;

     return (
       <button
         className={`${base} ${variants[variant]} ${className}`.trim()}
         {...props}
       >
         {children}
       </button>
     );
   }
   ```

   `src/card.tsx`

   ```tsx
   import type { PropsWithChildren } from "react";

   interface CardProps extends PropsWithChildren {
     title?: string;
     className?: string;
   }

   export function Card({ title, className = "", children }: CardProps) {
     return (
       <section
         className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`.trim()}
       >
         {title && (
           <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
         )}
         <div className={title ? "mt-4" : ""}>{children}</div>
       </section>
     );
   }
   ```

5. `packages/config/tsconfig.json`:

   ```jsonc
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": "src",
       "declaration": true,
       "declarationMap": true,
       "module": "CommonJS",
       "moduleResolution": "Node"
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

6. `packages/config/src/index.ts`:

   ```typescript
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
         throw new Error(
           `Invalid environment variables: ${parsed.error.message}`
         );
       }
       cached = parsed.data;
     }
     return cached;
   }
   ```

7. Add Vitest coverage in `packages/core/test/core.test.ts`:

   ```typescript
   import { describe, expect, it } from "vitest";
   import {
     buildAtsBreakdown,
     rankCandidates,
     rewriteResume,
     scoreResumeAgainstJob,
   } from "../src/index.js";

   const resume = `Built internal AI resume screener
   - Increased recruiter throughput by 35%
   - Led 4 engineers to ship matching engine`;

   const jd = `Looking for a senior engineer who can design AI systems, work with recruiters, and drive launches.`;

   describe("@resume-analyzer/core", () => {
     it("scores resumes consistently", () => {
       const result = scoreResumeAgainstJob(resume, jd);
       expect(result.finalScore).toBeGreaterThan(10);
     });

     it("generates ATS insights", () => {
       const ats = buildAtsBreakdown(resume, jd);
       expect(ats.sections.length).toBeGreaterThan(0);
     });

     it("produces rewrite suggestions", () => {
       const rewrite = rewriteResume(resume, jd, "Senior AI Engineer");
       expect(rewrite.bulletPoints.length).toBeGreaterThan(0);
     });

     it("ranks candidates by score", () => {
       const rankings = rankCandidates(jd, [
         { id: "1", name: "Alex", resumeText: resume },
         { id: "2", name: "Sam", resumeText: "Entry level support specialist" },
       ]);
       expect(rankings.rankings[0].id).toBe("1");
     });
   });
   ```

   `rewrite.ts`

   ```typescript
   export interface RewritePlan {
     pitch: string;
     summary: string;
     bulletPoints: string[];
   }

   export function rewriteResume(
     resumeText: string,
     jobDescription: string,
     targetRole = "candidate"
   ): RewritePlan {
     const opening = `Updated branding for ${targetRole}: Blend your strongest metrics with the top priorities from the job description.`;
     const summary = `Focus on achievements that map to: ${extractTopRequirements(
       jobDescription
     ).join(", ")}.`;
     const bulletPoints = buildBulletPoints(resumeText, jobDescription);

     return {
       pitch: opening,
       summary,
       bulletPoints,
     };
   }

   function extractTopRequirements(text: string) {
     return text
       .split(/[\,\n]/)
       .map((line) => line.trim())
       .filter((line) => line.length > 5)
       .slice(0, 3);
   }

   function buildBulletPoints(resumeText: string, jobDescription: string) {
     const base = resumeText
       .split(/\n|\. /)
       .filter((line) => line.length > 25)
       .slice(0, 2);
     const requirements = extractTopRequirements(jobDescription);

     return [
       ...requirements.map(
         (req) =>
           `Quantify how you addressed "${req}" with metrics (e.g., +25% growth).`
       ),
       ...base.map((line) => `Sharpen: ${line}`),
     ].slice(0, 5);
   }
   ```

   `ranking.ts`

   ```typescript
   import { scoreResumeAgainstJob, type ResumeScore } from "./match.js";

   export interface CandidateInput {
     id: string;
     name: string;
     resumeText: string;
   }

   export interface RankingResult {
     jobDescription: string;
     rankings: Array<{ id: string; name: string; score: ResumeScore }>;
     generatedAt: string;
   }

   export function rankCandidates(
     jobDescription: string,
     candidates: CandidateInput[]
   ): RankingResult {
     const rankings = candidates
       .map((candidate) => ({
         id: candidate.id,
         name: candidate.name,
         score: scoreResumeAgainstJob(candidate.resumeText, jobDescription),
       }))
       .sort((a, b) => b.score.finalScore - a.score.finalScore);

     return {
       jobDescription,
       rankings,
       generatedAt: new Date().toISOString(),
     };
   }
   ```

   `ats.ts`

   ```typescript
   import { tokenize } from "./vectorizer.js";

   export interface AtsBreakdownSection {
     name: string;
     score: number;
     insights: string[];
   }

   export interface AtsBreakdown {
     total: number;
     sections: AtsBreakdownSection[];
   }

   export function buildAtsBreakdown(
     resumeText: string,
     jobDescription: string
   ): AtsBreakdown {
     const resumeTokens = new Set(tokenize(resumeText));
     const jobTokens = tokenize(jobDescription);
     const keywords = Array.from(new Set(jobTokens)).slice(0, 30);

     const keywordHits = keywords.filter((token) =>
       resumeTokens.has(token)
     ).length;
     const keywordScore = keywords.length ? keywordHits / keywords.length : 0;

     const actionVerbs = [
       "built",
       "scaled",
       "improved",
       "designed",
       "shipped",
       "launched",
     ];
     const actionScore =
       actionVerbs.filter((verb) => resumeText.toLowerCase().includes(verb))
         .length / actionVerbs.length;

     const formattingHints =
       resumeText.length > 500
         ? ["Resume length looks solid"]
         : ["Consider adding more context"];

     const sections: AtsBreakdownSection[] = [
       {
         name: "Keyword Coverage",
         score: Number((keywordScore * 100).toFixed(2)),
         insights:
           keywordScore > 0.6
             ? ["Great keyword match"]
             : ["Add more role-specific keywords"],
       },
       {
         name: "Action Verbs",
         score: Number((actionScore * 100).toFixed(2)),
         insights:
           actionScore > 0.5
             ? ["Nice impact-oriented language"]
             : ["Try highlighting achievements with strong verbs"],
       },
       {
         name: "Formatting & Clarity",
         score: 70,
         insights: formattingHints,
       },
     ];

     const total = Number(
       (
         sections.reduce((acc, section) => acc + section.score, 0) /
         sections.length
       ).toFixed(2)
     );

     return { total, sections };
   }
   ```

   `match.ts`

   ```typescript
   import { buildVector, cosineSimilarity, tokenize } from "./vectorizer.js";

   export interface ResumeScore {
     similarity: number;
     keywordCoverage: number;
     senioritySignal: number;
     finalScore: number;
     summary: string;
   }

   const seniorityKeywords: Record<string, string[]> = {
     junior: ["junior", "entry", "intern"],
     mid: ["mid", "intermediate", "engineer"],
     senior: ["senior", "lead", "principal", "staff"],
     manager: ["manager", "head", "director"],
   };

   export function scoreResumeAgainstJob(
     resumeText: string,
     jobDescription: string,
     targetRole = "candidate"
   ): ResumeScore {
     const resumeTokens = tokenize(resumeText);
     const jobTokens = tokenize(jobDescription);

     const resumeVector = buildVector(resumeTokens);
     const jobVector = buildVector(jobTokens);

     const similarity = cosineSimilarity(resumeVector, jobVector);
     const keywordCoverage = calculateCoverage(jobTokens, resumeTokens);
     const senioritySignal = measureSeniority(jobDescription, resumeText);

     const finalScore = Number(
       (
         (similarity * 0.5 + keywordCoverage * 0.3 + senioritySignal * 0.2) *
         100
       ).toFixed(2)
     );

     const summary = `Similarity ${(similarity * 100).toFixed(
       1
     )}%, keyword coverage ${(keywordCoverage * 100).toFixed(1)}%, seniority ${(
       senioritySignal * 100
     ).toFixed(1)}%`;

     return {
       similarity: Number((similarity * 100).toFixed(2)),
       keywordCoverage: Number((keywordCoverage * 100).toFixed(2)),
       senioritySignal: Number((senioritySignal * 100).toFixed(2)),
       finalScore,
       summary: `${targetRole}: ${summary}`,
     };
   }

   function calculateCoverage(jobTokens: string[], resumeTokens: string[]) {
     const jobSet = new Set(jobTokens);
     const resumeSet = new Set(resumeTokens);
     let hits = 0;
     jobSet.forEach((token) => {
       if (resumeSet.has(token)) {
         hits += 1;
       }
     });
     return jobSet.size ? hits / jobSet.size : 0;
   }

   function measureSeniority(jobDescription: string, resume: string) {
     const level = detectLevel(jobDescription);
     if (!level) {
       return 0.5;
     }
     const keywords = seniorityKeywords[level];
     const resumeLower = resume.toLowerCase();
     const hits = keywords.filter((kw) => resumeLower.includes(kw)).length;
     return Math.min(1, hits / keywords.length);
   }

   function detectLevel(text: string): keyof typeof seniorityKeywords | null {
     const lower = text.toLowerCase();
     return (
       (
         Object.keys(seniorityKeywords) as Array<keyof typeof seniorityKeywords>
       ).find((level) =>
         seniorityKeywords[level].some((kw) => lower.includes(kw))
       ) ?? null
     );
   }
   ```

8. Create `packages/core/package.json`:

   ```json
   {
     "name": "@resume-analyzer/core",
     "version": "0.1.0",
     "type": "module",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist"],
     "scripts": {
       "build": "tsc -p tsconfig.json",
       "dev": "tsc -w -p tsconfig.json",
       "lint": "tsc --noEmit -p tsconfig.json",
       "test": "vitest run",
       "test:watch": "vitest",
       "prepare": "npm run build"
     },
     "dependencies": { "zod": "^3.23.8" },
     "devDependencies": {
       "typescript": "^5.4.5",
       "vitest": "^1.6.0"
     }
   }
   ```

9. Add `packages/core/tsconfig.json`:

   ```jsonc
   {
     "extends": "../../tsconfig.base.json",
     "compilerOptions": {
       "outDir": "dist",
       "rootDir": "src",
       "declaration": true,
       "declarationMap": true
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist"]
   }
   ```

10. Configure Vitest at `packages/core/vitest.config.ts`:

    ```typescript
    import { defineConfig } from "vitest/config";

    export default defineConfig({
      test: {
        globals: true,
        environment: "node",
      },
    });
    ```

11. Implement source files under `packages/core/src`:

    `index.ts`

    ```typescript
    export * from "./match.js";
    export * from "./ats.js";
    export * from "./rewrite.js";
    export * from "./ranking.js";
    export * from "./vectorizer.js";
    ```

    `vectorizer.ts`

    ```typescript
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "to",
      "of",
      "in",
      "on",
      "for",
      "with",
    ]);

    export function tokenize(text: string) {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length > 1 && !stopWords.has(token));
    }

    export function buildVector(tokens: string[]) {
      const vector = new Map<string, number>();
      tokens.forEach((token) => {
        vector.set(token, (vector.get(token) ?? 0) + 1);
      });
      return vector;
    }

    export function cosineSimilarity(
      a: Map<string, number>,
      b: Map<string, number>
    ) {
      let dot = 0;
      let magA = 0;
      let magB = 0;

      a.forEach((value, key) => {
        magA += value * value;
        if (b.has(key)) {
          dot += value * (b.get(key) ?? 0);
        }
      });

      b.forEach((value) => {
        magB += value * value;
      });

      if (!magA || !magB) {
        return 0;
      }

      return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }
    ```

## 0. Prerequisites

- **OS / Shell**: Windows 11 using `cmd.exe`.
- **Runtime**: Node.js >= 18.18.0 (npm >= 10). Confirm:

  ```cmd
  node --version
  npm --version
  ```

- **Accounts**: Cloudinary credentials (either a single `CLOUDINARY_URL` or the granular API key trio). Optional Mongo Atlas URI for future persistence.
- **Global tools**: Git (for version control) and your favorite editor (VS Code here).

---

## 1. Bootstrap the Root Workspace

1. Create the folder, initialize npm, and install root dev tooling:

   ```cmd
   cd d:\\Mac-Files\\Resume-Projects
   mkdir resume-analyzer
   cd resume-analyzer
   npm init -y
   npm install --save-dev typescript@5.4.5 npm-run-all@4.1.5
   ```

2. Replace `package.json` with the monorepo manifest:

   ```json
   {
     "name": "resume-analyzer",
     "version": "0.1.0",
     "private": true,
     "description": "AI-powered resume and job match SaaS platform",
     "type": "module",
     "workspaces": ["apps/*", "packages/*"],
     "scripts": {
       "dev": "npm-run-all --parallel dev:web dev:api",
       "dev:web": "npm run dev --workspace apps/web",
       "dev:api": "npm run dev --workspace apps/api",
       "build": "npm-run-all build:web build:api",
       "build:web": "npm run build --workspace apps/web",
       "build:api": "npm run build --workspace apps/api",
       "lint": "npm-run-all lint:web lint:api",
       "lint:web": "npm run lint --workspace apps/web",
       "lint:api": "npm run lint --workspace apps/api",
       "test": "npm run test --workspace packages/core"
     },
     "engines": { "node": ">=18.18.0" },
     "keywords": ["resume", "ai", "saas", "job-match"],
     "license": "MIT",
     "devDependencies": {
       "npm-run-all": "^4.1.5",
       "typescript": "^5.4.5"
     }
   }
   ```

3. Add `.gitignore` so builds and secrets never leak:

   ```ignore
   node_modules
   .next
   out
   dist
   tmp
   .env*
   !.env.example
   .DS_Store
   coverage
   uploads
   ```

4. Document the environment contract in `.env.example` (copy to `.env` with real secrets):

   ```dotenv
   NODE_ENV=development
   PORT=4000
   API_PORT=4000
   CLIENT_ORIGIN=http://localhost:3000
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   PROJECT_NAME=resume-analyzer
   CLOUDINARY_URL=cloudinary://key:secret@cloud_name
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=resume-analyzer
   MONGO_URI=mongodb+srv://user:pass@cluster/db
   ```

5. Share TypeScript settings through `tsconfig.base.json`:

   ```jsonc
   {
     "compilerOptions": {
       "target": "ES2020",
       "module": "ESNext",
       "moduleResolution": "Bundler",
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "baseUrl": "."
     },
     "include": ["packages", "apps"],
     "exclude": ["node_modules", "dist"]
   }
   ```

6. Drop a high-level `README.md` (same content that currently ships with the repo) summarizing the apps, packages, quick start commands, and environment guidance.

---

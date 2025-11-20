# Resume Analyzer Monorepo

AI-powered resume + job match SaaS starter using npm workspaces.

## Apps

- `apps/web`: Next.js 14 frontend with Tailwind CSS and shared UI components.
- `apps/api`: Express + TypeScript backend handling Cloudinary uploads, PDF parsing, and heuristic AI scoring.

## Packages

- `@resume-analyzer/core`: Token-based similarity scoring, ATS breakdowns, rewrites, and candidate ranking utilities.
- `@resume-analyzer/config`: Zod-backed runtime env validation shared by all services.
- `@resume-analyzer/ui`: Small React component kit (Button, Card) consumed by the Next app.

## Quick start

```cmd
cd d:\Mac-Files\Resume-Projects\resume-analyzer
npm install
npm run build --workspaces
npm run dev
```

### Dev servers

- `npm run dev:web` → Next.js at http://localhost:3000
- `npm run dev:api` → Express API at http://localhost:4000

Set environment variables from `.env.example` before starting the API so Cloudinary uploads succeed.

### Environment tips

- Use either `CLOUDINARY_URL` (single string like `cloudinary://key:secret@cloud`) or the granular trio `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Control where PDFs land in Cloudinary by setting `CLOUDINARY_FOLDER` or `PROJECT_NAME` (e.g., `PROJECT_NAME=resume-analyzer` saves uploads under that folder automatically).
- Drop your Mongo connection string in `MONGO_URI` when you are ready to persist resume history beyond the in-memory store.
- `.env` is auto-discovered by the shared config package even when running workspace-specific scripts; if you want to point somewhere else, set `ENV_FILE=path/to/custom.env` before starting the apps.

### Uploading resumes

- Frontend now supports two flows: paste any publicly reachable PDF URL **or** upload the PDF directly from your device.
- Uploaded files are streamed to Cloudinary using the folder defined by `CLOUDINARY_FOLDER`/`PROJECT_NAME`, so assets stay organized per project.
- API clients can send either `resumeUrl` or `fileBase64` (data URL) to `/api/uploads/resume`; at least one is required.

## Testing

```cmd
cd packages\core
npm run test
```

## Learn more

Additional notes live in `docs/ARCHITECTURE.md` and `docs/LEARNING.md`.

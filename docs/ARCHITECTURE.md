# Resume Analyzer Architecture

## Overview

- **Frontend**: Next.js 14 (App Router) with Tailwind CSS and shared UI package.
- **Backend**: Express + TypeScript service handling Cloudinary uploads, PDF parsing, and AI-like scoring via `@resume-analyzer/core`.
- **Shared Packages**:
  - `@resume-analyzer/core`: Deterministic heuristics that mimic embedding scoring, ATS breakdowns, rewrites, and ranking.
  - `@resume-analyzer/config`: Centralized environment validation powered by Zod.
  - `@resume-analyzer/ui`: React component primitives reused across surfaces.
- **Storage**: Cloudinary stores raw resumes; Mongo/Redis are planned but mocked with an in-memory store for now.

## Request Flow

1. User submits resume URL + JD from the web app.
2. Next app calls the `/api/uploads/resume` endpoint exposed by the Express service.
3. Backend uploads the PDF to Cloudinary, fetches the bytes, and extracts text via `pdf-parse`.
4. `@resume-analyzer/core` computes similarity, ATS insights, rewrite prompts, and optional rankings.
5. Response is cached in memory and returned to the UI for display.

## Bonus Capabilities

- Ranking endpoint sorts candidates for a JD.
- ATS breakdown call explains keyword coverage, action verbs, and formatting hints.
- Rewrite service crafts bullet points to help users iterate quickly.

Future enhancements include persisting history in MongoDB, queuing job rewrites with Redis/BullMQ, and integrating paid credits through Stripe webhooks.

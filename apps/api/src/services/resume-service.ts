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
  const resumeText = await extractTextFromCloudinary(uploadResult.secure_url);

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

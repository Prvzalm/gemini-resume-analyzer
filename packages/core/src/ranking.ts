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

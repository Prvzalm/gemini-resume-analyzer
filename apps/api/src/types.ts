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

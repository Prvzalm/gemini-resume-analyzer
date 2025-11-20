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

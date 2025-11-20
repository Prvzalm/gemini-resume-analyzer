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

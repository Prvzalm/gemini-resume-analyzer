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
    .split(/[,\n]/)
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

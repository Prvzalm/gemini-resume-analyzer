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

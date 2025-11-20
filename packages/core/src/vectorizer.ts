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

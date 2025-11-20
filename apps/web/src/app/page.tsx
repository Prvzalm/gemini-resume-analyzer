"use client";

import { useState, useTransition, type ChangeEvent } from "react";
import { Button, Card } from "@resume-analyzer/ui";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface MatchResult {
  candidateName: string;
  targetRole: string;
  score: {
    finalScore: number;
    similarity: number;
    keywordCoverage: number;
    senioritySignal: number;
    summary: string;
  };
  ats: {
    total: number;
    sections: Array<{ name: string; score: number; insights: string[] }>;
  };
  rewrite: { pitch: string; summary: string; bulletPoints: string[] };
  cloudinaryUrl: string;
  createdAt: string;
}

export default function Home() {
  const [form, setForm] = useState({
    resumeUrl: "",
    jobDescription: "",
    candidateName: "You",
    targetRole: "Product Engineer",
  });
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{
    name: string;
    base64: string;
  } | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange =
    (field: keyof typeof form) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) {
      setFileData(null);
      return;
    }
    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported right now");
      return;
    }
    const maxBytes = 6 * 1024 * 1024; // 6MB safety cap
    if (selected.size > maxBytes) {
      setError("PDF is too large (max 6MB)");
      return;
    }
    setIsFileProcessing(true);
    setError(null);
    try {
      const base64 = await fileToBase64(selected);
      setFileData({ name: selected.name, base64 });
      setForm((prev) => ({ ...prev, resumeUrl: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      setFileData(null);
    } finally {
      setIsFileProcessing(false);
    }
  };

  const handleAnalyze = () => {
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          ...form,
          resumeUrl: fileData ? undefined : form.resumeUrl,
          fileBase64: fileData?.base64,
        };
        const response = await fetch(`${API_BASE}/api/uploads/resume`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Failed to analyze resume");
        }
        const data: MatchResult = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
        setResult(null);
      }
    });
  };

  const canSubmit = Boolean(
    form.jobDescription && (form.resumeUrl || fileData) && !isFileProcessing
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="text-center text-white px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200">
            Resume Analyzer
          </p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            Upload a resume, paste a JD, get instant ATS insights
          </h1>
          <p className="mt-4 text-base text-slate-200">
            Paste any public PDF link <span className="font-semibold">or</span>{" "}
            upload the file from your desktop. We store it securely, run a match
            score, and return rewrite-ready tips.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Upload details" className="p-5 sm:p-6 lg:p-8">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Public PDF URL
              </span>
              <input
                type="url"
                value={form.resumeUrl}
                onChange={handleChange("resumeUrl")}
                placeholder="https://.../resume.pdf"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
              />
            </label>
            <div className="mt-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  or Upload PDF
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-4 py-3 text-sm file:mr-4 file:rounded-lg file:border-none file:bg-purple-100 file:px-4 file:py-2 file:text-sm file:font-medium file:text-purple-800"
                />
              </label>
              {fileData && (
                <p className="mt-2 text-xs text-slate-500">
                  Selected: <span className="font-medium">{fileData.name}</span>
                </p>
              )}
              {isFileProcessing && (
                <p className="mt-2 text-xs text-purple-600">Processing PDF…</p>
              )}
            </div>
            <label className="mt-4 flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">
                Job description
              </span>
              <textarea
                value={form.jobDescription}
                onChange={handleChange("jobDescription")}
                rows={8}
                placeholder="Paste the JD here..."
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
              />
            </label>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Candidate name
                </span>
                <input
                  type="text"
                  value={form.candidateName}
                  onChange={handleChange("candidateName")}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-700">
                  Target role
                </span>
                <input
                  type="text"
                  value={form.targetRole}
                  onChange={handleChange("targetRole")}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Attach a public link or upload a PDF (stored securely in
                Cloudinary).
              </span>
              <Button
                onClick={handleAnalyze}
                disabled={isPending || !canSubmit}
                className="shadow-lg shadow-purple-300/40"
              >
                {isPending ? "Analyzing..." : "Analyze resume"}
              </Button>
            </div>
            {!form.jobDescription && (
              <p className="mt-3 text-xs text-amber-600">
                Paste the job description to activate the analyzer.
              </p>
            )}
            {!form.resumeUrl && !fileData && (
              <p className="mt-1 text-xs text-amber-600">
                Provide a public URL or upload a PDF file.
              </p>
            )}
            {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
          </Card>

          <Card
            title="Result"
            className="bg-slate-900 text-white border-0 flex h-full min-h-128 flex-col md:h-auto p-5 sm:p-6 lg:p-8"
          >
            {result ? (
              <div
                className="space-y-4 overflow-y-auto pr-2"
                style={{ maxHeight: "40rem" }}
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-400">
                    Match score
                  </p>
                  <p className="text-5xl font-extrabold">
                    {result.score.finalScore}%
                  </p>
                  <p className="text-sm text-slate-300">
                    {result.score.summary}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric
                    label="Similarity"
                    value={`${result.score.similarity}%`}
                  />
                  <Metric
                    label="Keywords"
                    value={`${result.score.keywordCoverage}%`}
                  />
                  <Metric
                    label="Seniority"
                    value={`${result.score.senioritySignal}%`}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    ATS Breakdown ({result.ats.total}%)
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-200">
                    {result.ats.sections.map((section) => (
                      <li key={section.name}>
                        <strong>{section.name}: </strong>
                        {section.score}% – {section.insights.join(" ")}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold">Rewrite ideas</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {result.rewrite.summary}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-200">
                    {result.rewrite.bulletPoints.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-80 flex-col items-center justify-center text-center text-sm text-slate-300">
                <p>
                  Run your first analysis to see ATS scores, rewrite prompts,
                  and candidate ranking insights.
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 p-4 text-center">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Could not read file"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

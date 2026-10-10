"use client";

import { useMemo, useState } from "react";

type AnalysisResult = {
  wordCount: number;
  keywordInTitle: boolean;
  keywordInFirst100Words: boolean;
  headingCount: number;
  longParagraphCount: number;
};

export default function Home() {
  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const normalizedKeyword = useMemo(
    () => keyword.trim().toLowerCase(),
    [keyword]
  );

  function analyzeContent() {
    const cleanContent = content.trim();

    const words = cleanContent
      ? cleanContent.split(/\s+/).filter(Boolean)
      : [];

    const first100Words = words.slice(0, 100).join(" ").toLowerCase();

    const lines = cleanContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const headingCount = lines.filter((line) =>
      /^#{1,6}\s+/.test(line)
    ).length;

    const paragraphs = cleanContent
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const longParagraphCount = paragraphs.filter((paragraph) => {
      const paragraphWords = paragraph.split(/\s+/).filter(Boolean);
      return paragraphWords.length > 120;
    }).length;

    setResults({
      wordCount: words.length,
      keywordInTitle:
        normalizedKeyword.length > 0 &&
        title.toLowerCase().includes(normalizedKeyword),
      keywordInFirst100Words:
        normalizedKeyword.length > 0 &&
        first100Words.includes(normalizedKeyword),
      headingCount,
      longParagraphCount,
    });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-zinc-400">
          Local-first writing review
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          DraftLocal
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
          Review content and README files without sending your draft to a cloud
          AI service.
        </p>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex gap-3">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black">
              Content Review
            </button>

            <button className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300">
              README Review
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Article title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter your article title"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Target keyword
              </label>

              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Enter your target keyword"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Content
              </label>

              <textarea
                rows={12}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste your draft here..."
                className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
              />
            </div>

            <button
              type="button"
              onClick={analyzeContent}
              className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black"
            >
              Analyze locally
            </button>
          </div>
        </div>

        {results && (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Review results</h2>

            <div className="mt-5 space-y-3">
              <ResultRow
                label="Word count"
                value={String(results.wordCount)}
                status="info"
              />

              <ResultRow
                label="Keyword in title"
                value={results.keywordInTitle ? "Pass" : "Needs attention"}
                status={results.keywordInTitle ? "pass" : "warn"}
              />

              <ResultRow
                label="Keyword in first 100 words"
                value={
                  results.keywordInFirst100Words
                    ? "Pass"
                    : "Needs attention"
                }
                status={
                  results.keywordInFirst100Words ? "pass" : "warn"
                }
              />

              <ResultRow
                label="Heading count"
                value={String(results.headingCount)}
                status="info"
              />

              <ResultRow
                label="Long paragraphs"
                value={String(results.longParagraphCount)}
                status={
                  results.longParagraphCount === 0 ? "pass" : "warn"
                }
              />
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          <strong className="text-zinc-200">Local processing:</strong> These
          first checks run entirely in your browser. No cloud AI service is
          being used.
        </div>
      </div>
    </main>
  );
}

function ResultRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "pass" | "warn" | "info";
}) {
  const statusClasses = {
    pass: "border-green-900/60 bg-green-950/30 text-green-300",
    warn: "border-amber-900/60 bg-amber-950/30 text-amber-300",
    info: "border-zinc-700 bg-zinc-950 text-zinc-300",
  };

  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-4 py-3 ${statusClasses[status]}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
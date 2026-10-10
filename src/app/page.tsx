"use client";

import { useMemo, useState } from "react";

type AnalysisResult = {
  wordCount: number;
  paragraphCount: number;
  headingCount: number;
  longParagraphCount: number;
  longSentenceCount: number;
  internalLinkCount: number;
  externalLinkCount: number;
  keywordInTitle: boolean;
  keywordInFirst100Words: boolean;
  keywordInHeadings: boolean;
  passedChecks: number;
  attentionChecks: number;
};

type ResultStatus = "pass" | "warn" | "info";

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

    // WORDS
    const words = cleanContent
      ? cleanContent.split(/\s+/).filter(Boolean)
      : [];

    const first100Words = words.slice(0, 100).join(" ").toLowerCase();

    // LINES
    const lines = cleanContent
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    // MARKDOWN HEADINGS
    const headings = lines.filter((line) => /^#{1,6}\s+/.test(line));

    const headingCount = headings.length;

    const keywordInHeadings =
      normalizedKeyword.length > 0 &&
      headings.some((heading) =>
        heading.toLowerCase().includes(normalizedKeyword)
      );

    // PARAGRAPHS
    const contentBlocks = cleanContent
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);

    const paragraphs = contentBlocks.filter(
      (block) => !/^#{1,6}\s+/.test(block)
    );

    const paragraphCount = paragraphs.length;

    const longParagraphCount = paragraphs.filter((paragraph) => {
      const paragraphWords = paragraph
        .split(/\s+/)
        .filter(Boolean);

      return paragraphWords.length > 120;
    }).length;

    // SENTENCES
    const sentences = cleanContent
      .replace(/^#{1,6}\s+/gm, "")
      .split(/[.!?]+(?:\s+|$)/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    const longSentenceCount = sentences.filter((sentence) => {
      const sentenceWords = sentence
        .split(/\s+/)
        .filter(Boolean);

      return sentenceWords.length > 30;
    }).length;

    // MARKDOWN LINKS
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    const links = Array.from(
      cleanContent.matchAll(markdownLinkRegex)
    ).map((match) => match[2]);

    const internalLinkCount = links.filter((url) => {
      return (
        url.startsWith("/") ||
        url.startsWith("#") ||
        url.startsWith("./") ||
        url.startsWith("../")
      );
    }).length;

    const externalLinkCount = links.filter((url) => {
      return /^https?:\/\//i.test(url);
    }).length;

    // KEYWORD CHECKS
    const keywordInTitle =
      normalizedKeyword.length > 0 &&
      title.toLowerCase().includes(normalizedKeyword);

    const keywordInFirst100Words =
      normalizedKeyword.length > 0 &&
      first100Words.includes(normalizedKeyword);

    // QUALITY CHECKS USED IN SUMMARY
    const qualityChecks = [
      keywordInTitle,
      keywordInFirst100Words,
      keywordInHeadings,
      headingCount > 0,
      longParagraphCount === 0,
      longSentenceCount === 0,
    ];

    const passedChecks = qualityChecks.filter(Boolean).length;
    const attentionChecks =
      qualityChecks.length - passedChecks;

    setResults({
      wordCount: words.length,
      paragraphCount,
      headingCount,
      longParagraphCount,
      longSentenceCount,
      internalLinkCount,
      externalLinkCount,
      keywordInTitle,
      keywordInFirst100Words,
      keywordInHeadings,
      passedChecks,
      attentionChecks,
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Review results
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  Rule-based checks performed in your browser.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm">
                <span className="font-semibold text-green-300">
                  {results.passedChecks} passed
                </span>

                <span className="mx-2 text-zinc-600">
                  /
                </span>

                <span className="font-semibold text-amber-300">
                  {results.attentionChecks} need attention
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <ResultRow
                label="Word count"
                value={String(results.wordCount)}
                status="info"
                explanation="Total number of words found in the draft."
              />

              <ResultRow
                label="Paragraph count"
                value={String(results.paragraphCount)}
                status="info"
                explanation="Counts text blocks separated by blank lines."
              />

              <ResultRow
                label="Heading count"
                value={String(results.headingCount)}
                status={results.headingCount > 0 ? "pass" : "warn"}
                explanation="Detects Markdown headings such as ## Example Heading."
              />

              <ResultRow
                label="Keyword in title"
                value={
                  results.keywordInTitle
                    ? "Pass"
                    : "Needs attention"
                }
                status={
                  results.keywordInTitle ? "pass" : "warn"
                }
                explanation="Checks whether the target keyword appears in the article title."
              />

              <ResultRow
                label="Keyword in first 100 words"
                value={
                  results.keywordInFirst100Words
                    ? "Pass"
                    : "Needs attention"
                }
                status={
                  results.keywordInFirst100Words
                    ? "pass"
                    : "warn"
                }
                explanation="Checks whether the target keyword appears early in the draft."
              />

              <ResultRow
                label="Keyword in headings"
                value={
                  results.keywordInHeadings
                    ? "Pass"
                    : "Needs attention"
                }
                status={
                  results.keywordInHeadings
                    ? "pass"
                    : "warn"
                }
                explanation="Checks Markdown headings for the target keyword."
              />

              <ResultRow
                label="Long paragraphs"
                value={String(results.longParagraphCount)}
                status={
                  results.longParagraphCount === 0
                    ? "pass"
                    : "warn"
                }
                explanation="Flags paragraphs containing more than 120 words."
              />

              <ResultRow
                label="Long sentences"
                value={String(results.longSentenceCount)}
                status={
                  results.longSentenceCount === 0
                    ? "pass"
                    : "warn"
                }
                explanation="Flags sentences containing more than 30 words."
              />

              <ResultRow
                label="Internal links"
                value={String(results.internalLinkCount)}
                status="info"
                explanation="Counts relative Markdown links such as /blog/example."
              />

              <ResultRow
                label="External links"
                value={String(results.externalLinkCount)}
                status="info"
                explanation="Counts Markdown links beginning with http:// or https://."
              />
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          <strong className="text-zinc-200">
            Local processing:
          </strong>{" "}
          These checks run entirely in your browser. No cloud AI service is
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
  explanation,
}: {
  label: string;
  value: string;
  status: ResultStatus;
  explanation: string;
}) {
  const statusClasses = {
    pass:
      "border-green-900/60 bg-green-950/30 text-green-300",
    warn:
      "border-amber-900/60 bg-amber-950/30 text-amber-300",
    info:
      "border-zinc-700 bg-zinc-950 text-zinc-300",
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${statusClasses[status]}`}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">
          {label}
        </span>

        <strong className="shrink-0">
          {value}
        </strong>
      </div>

      <p className="mt-1 text-xs opacity-70">
        {explanation}
      </p>
    </div>
  );
}
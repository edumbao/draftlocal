"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CreateMLCEngine,
  type MLCEngine,
} from "@mlc-ai/web-llm";

type ReviewMode = "content" | "readme";
type ResultStatus = "pass" | "warn" | "info";

type ContentAnalysisResult = {
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

type ReadmeAnalysisResult = {
  hasPurpose: boolean;
  hasInstallation: boolean;
  hasPrerequisites: boolean;
  hasUsage: boolean;
  hasConfiguration: boolean;
  mentionsEnvironmentVariables: boolean;
  hasTroubleshooting: boolean;
  hasLicense: boolean;
  passedChecks: number;
  attentionChecks: number;
};

export default function Home() {
  const [mode, setMode] = useState<ReviewMode>("content");

  const [title, setTitle] = useState("");
  const [keyword, setKeyword] = useState("");
  const [content, setContent] = useState("");

  const [projectName, setProjectName] = useState("");
  const [readmeContent, setReadmeContent] = useState("");

  const [contentResults, setContentResults] =
    useState<ContentAnalysisResult | null>(null);

  const [readmeResults, setReadmeResults] =
    useState<ReadmeAnalysisResult | null>(null);

  const [aiStatus, setAiStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const [aiProgress, setAiProgress] = useState("");
  const [aiError, setAiError] = useState("");

  const [aiReviewStatus, setAiReviewStatus] = useState<
    "idle" | "reviewing" | "done" | "error"
  >("idle");

  const [aiReview, setAiReview] = useState("");
  const [aiReviewError, setAiReviewError] = useState("");

  const [isOnline, setIsOnline] = useState(true);

  const engineRef = useRef<MLCEngine | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

    const headings = lines.filter((line) => /^#{1,6}\s+/.test(line));

    const headingCount = headings.length;

    const keywordInHeadings =
      normalizedKeyword.length > 0 &&
      headings.some((heading) =>
        heading.toLowerCase().includes(normalizedKeyword)
      );

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

    const externalLinkCount = links.filter((url) =>
      /^https?:\/\//i.test(url)
    ).length;

    const keywordInTitle =
      normalizedKeyword.length > 0 &&
      title.toLowerCase().includes(normalizedKeyword);

    const keywordInFirst100Words =
      normalizedKeyword.length > 0 &&
      first100Words.includes(normalizedKeyword);

    const qualityChecks = [
      keywordInTitle,
      keywordInFirst100Words,
      keywordInHeadings,
      headingCount > 0,
      longParagraphCount === 0,
      longSentenceCount === 0,
    ];

    const passedChecks = qualityChecks.filter(Boolean).length;
    const attentionChecks = qualityChecks.length - passedChecks;

    setContentResults({
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

  function analyzeReadme() {
    const cleanReadme = readmeContent.trim();
    const lowerReadme = cleanReadme.toLowerCase();

    const hasPurpose =
      cleanReadme.length > 0 &&
      cleanReadme.split(/\s+/).filter(Boolean).length >= 20;

    const hasInstallation =
      /(^|\n)#{1,6}\s+(installation|install|getting started)/im.test(
        cleanReadme
      );

    const hasPrerequisites =
      /(^|\n)#{1,6}\s+(prerequisites|requirements|before you start)/im.test(
        cleanReadme
      ) ||
      /\bprerequisite(s)?\b/i.test(cleanReadme);

    const hasUsage =
      /(^|\n)#{1,6}\s+(usage|how to use|example|examples)/im.test(
        cleanReadme
      );

    const hasConfiguration =
      /(^|\n)#{1,6}\s+(configuration|config|setup)/im.test(cleanReadme);

    const mentionsEnvironmentVariables =
      /\b(environment variable|environment variables|env variable|env variables|\.env)\b/i.test(
        cleanReadme
      );

    const hasTroubleshooting =
      /(^|\n)#{1,6}\s+(troubleshooting|common issues|known issues)/im.test(
        cleanReadme
      );

    const hasLicense =
      /(^|\n)#{1,6}\s+license/im.test(cleanReadme) ||
      /\bmit license\b/i.test(lowerReadme) ||
      /\bapache license\b/i.test(lowerReadme) ||
      /\bgpl\b/i.test(lowerReadme);

    const checks = [
      hasPurpose,
      hasInstallation,
      hasPrerequisites,
      hasUsage,
      hasConfiguration,
      mentionsEnvironmentVariables,
      hasTroubleshooting,
      hasLicense,
    ];

    const passedChecks = checks.filter(Boolean).length;
    const attentionChecks = checks.length - passedChecks;

    setReadmeResults({
      hasPurpose,
      hasInstallation,
      hasPrerequisites,
      hasUsage,
      hasConfiguration,
      mentionsEnvironmentVariables,
      hasTroubleshooting,
      hasLicense,
      passedChecks,
      attentionChecks,
    });
  }

  async function enableLocalAI() {
    if (engineRef.current) {
      setAiStatus("ready");
      return;
    }

    try {
      setAiStatus("loading");
      setAiError("");
      setAiProgress("Starting local AI...");

      const engine = await CreateMLCEngine(
        "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
        {
          initProgressCallback: (progress) => {
            setAiProgress(progress.text);
          },
        }
      );

      engineRef.current = engine;

      setAiStatus("ready");
      setAiProgress("Local AI is ready.");
    } catch (error) {
      console.error(error);

      setAiStatus("error");

      setAiError(
        error instanceof Error
          ? error.message
          : "Local AI failed to load."
      );
    }
  }

  async function reviewClarityLocally() {
    if (!engineRef.current) {
      setAiReviewStatus("error");
      setAiReviewError("Enable Local AI first.");
      return;
    }

    const sourceText =
      mode === "content"
        ? content.trim()
        : readmeContent.trim();

    if (!sourceText) {
      setAiReviewStatus("error");
      setAiReviewError(
        mode === "content"
          ? "Paste some content first."
          : "Paste README content first."
      );
      return;
    }

    const shortExcerpt = sourceText
      .split(/\s+/)
      .slice(0, 180)
      .join(" ");

    try {
      setAiReviewStatus("reviewing");
      setAiReview("");
      setAiReviewError("");

      const response =
        await engineRef.current.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "You are a concise writing reviewer. Focus only on clarity for beginner readers. Do not rewrite the text. Do not add information that is not present.",
            },
            {
              role: "user",
              content: `Review the text below.

Identify one thing that may confuse a beginner.

Explain the issue in no more than two short sentences.

Text:
${shortExcerpt}`,
            },
          ],
          temperature: 0.2,
          max_tokens: 100,
        });

      const message =
        response.choices[0]?.message?.content?.trim();

      setAiReview(
        message || "The local model returned no feedback."
      );

      setAiReviewStatus("done");
    } catch (error) {
      console.error(error);

      setAiReviewStatus("error");

      setAiReviewError(
        error instanceof Error
          ? error.message
          : "The local clarity review failed."
      );
    }
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <StatusCard
            label="Internet"
            value={isOnline ? "Online" : "Offline"}
            status={isOnline ? "info" : "pass"}
          />

          <StatusCard
            label="Local AI"
            value={
              aiStatus === "ready"
                ? "Ready"
                : aiStatus === "loading"
                ? "Loading"
                : aiStatus === "error"
                ? "Error"
                : "Not loaded"
            }
            status={
              aiStatus === "ready"
                ? "pass"
                : aiStatus === "error"
                ? "warn"
                : "info"
            }
          />
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex gap-3">
            <button
              type="button"
              onClick={() => setMode("content")}
              className={
                mode === "content"
                  ? "rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                  : "rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300"
              }
            >
              Content Review
            </button>

            <button
              type="button"
              onClick={() => setMode("readme")}
              className={
                mode === "readme"
                  ? "rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                  : "rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300"
              }
            >
              README Review
            </button>
          </div>

          {mode === "content" ? (
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
                Analyze content locally
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Project name
                </label>

                <input
                  type="text"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Enter your project name"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  README content
                </label>

                <textarea
                  rows={16}
                  value={readmeContent}
                  onChange={(event) => setReadmeContent(event.target.value)}
                  placeholder="Paste your README.md content here..."
                  className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 font-mono text-sm text-white outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                type="button"
                onClick={analyzeReadme}
                className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black"
              >
                Analyze README locally
              </button>
            </div>
          )}
        </div>

        {mode === "content" && contentResults && (
          <ContentResults results={contentResults} />
        )}

        {mode === "readme" && readmeResults && (
          <ReadmeResults
            results={readmeResults}
            projectName={projectName}
          />
        )}

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Local AI
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Optional clarity feedback using a small model running on this
                device.
              </p>
            </div>

            {aiStatus === "idle" && (
              <button
                type="button"
                onClick={enableLocalAI}
                className="rounded-lg bg-white px-4 py-3 text-sm font-medium text-black"
              >
                Enable Local AI
              </button>
            )}

            {aiStatus === "ready" && (
              <span className="rounded-lg border border-green-900/60 bg-green-950/30 px-4 py-2 text-sm font-medium text-green-300">
                Model ready
              </span>
            )}
          </div>

          {aiStatus === "loading" && (
            <div className="mt-5 rounded-lg border border-zinc-700 bg-zinc-950 p-4">
              <p className="text-sm font-medium">
                Loading local model...
              </p>

              <p className="mt-2 text-sm text-zinc-400">
                {aiProgress}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                The first model setup usually requires internet access so the
                model can be downloaded and stored by the browser.
              </p>
            </div>
          )}

          {aiStatus === "error" && (
            <div className="mt-5 rounded-lg border border-red-900/60 bg-red-950/30 p-4">
              <p className="font-medium text-red-300">
                Local AI could not load.
              </p>

              <p className="mt-2 text-sm text-red-200/70">
                {aiError}
              </p>
            </div>
          )}

          {aiStatus === "ready" && (
            <>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <StatusCard
                  label="Model"
                  value="Qwen2.5 0.5B"
                  status="info"
                />

                <StatusCard
                  label="Processing"
                  value="This device"
                  status="pass"
                />

                <StatusCard
                  label="Cloud AI API"
                  value="None"
                  status="pass"
                />

                <StatusCard
                  label="Offline after first download"
                  value="Ready"
                  status="pass"
                />

                <StatusCard
                  label="First setup"
                  value="Internet required"
                  status="info"
                />

                <StatusCard
                  label="After model download"
                  value="Offline review supported"
                  status="pass"
                />
              </div>

              {!isOnline && (
                <div className="mt-4 rounded-lg border border-green-900/60 bg-green-950/30 p-4">
                  <p className="font-medium text-green-300">
                    Offline mode detected
                  </p>

                  <p className="mt-1 text-sm text-green-200/70">
                    The model is available from browser storage, so local
                    clarity review can continue without a live cloud
                    connection.
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={reviewClarityLocally}
                disabled={aiReviewStatus === "reviewing"}
                className="mt-4 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {aiReviewStatus === "reviewing"
                  ? "Reviewing locally..."
                  : "Review clarity locally"}
              </button>
            </>
          )}

          {aiReviewStatus === "done" && (
            <div className="mt-5 rounded-lg border border-blue-900/60 bg-blue-950/20 p-4">
              <p className="text-sm font-medium text-blue-300">
                Local AI clarity feedback
              </p>

              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {aiReview}
              </p>

              <p className="mt-3 text-xs text-zinc-500">
                This review uses only a short excerpt and may miss context from
                the rest of the document.
              </p>
            </div>
          )}

          {aiReviewStatus === "error" && (
            <div className="mt-5 rounded-lg border border-red-900/60 bg-red-950/30 p-4">
              <p className="font-medium text-red-300">
                Clarity review could not run.
              </p>

              <p className="mt-2 text-sm text-red-200/70">
                {aiReviewError}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-400">
          <strong className="text-zinc-200">
            Local processing:
          </strong>{" "}
          Rule-based checks run entirely in your browser. Local AI inference
          also runs on this device after the model has been downloaded.
        </div>
      </div>
    </main>
  );
}

function StatusCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: ResultStatus;
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
      <p className="text-xs uppercase tracking-wide opacity-60">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>
    </div>
  );
}

function ContentResults({
  results,
}: {
  results: ContentAnalysisResult;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <ResultsHeader
        title="Content review results"
        passedChecks={results.passedChecks}
        attentionChecks={results.attentionChecks}
      />

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
          value={results.keywordInTitle ? "Pass" : "Needs attention"}
          status={results.keywordInTitle ? "pass" : "warn"}
          explanation="Checks whether the target keyword appears in the article title."
        />

        <ResultRow
          label="Keyword in first 100 words"
          value={
            results.keywordInFirst100Words
              ? "Pass"
              : "Needs attention"
          }
          status={results.keywordInFirst100Words ? "pass" : "warn"}
          explanation="Checks whether the target keyword appears early in the draft."
        />

        <ResultRow
          label="Keyword in headings"
          value={results.keywordInHeadings ? "Pass" : "Needs attention"}
          status={results.keywordInHeadings ? "pass" : "warn"}
          explanation="Checks Markdown headings for the target keyword."
        />

        <ResultRow
          label="Long paragraphs"
          value={String(results.longParagraphCount)}
          status={results.longParagraphCount === 0 ? "pass" : "warn"}
          explanation="Flags paragraphs containing more than 120 words."
        />

        <ResultRow
          label="Long sentences"
          value={String(results.longSentenceCount)}
          status={results.longSentenceCount === 0 ? "pass" : "warn"}
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
  );
}

function ReadmeResults({
  results,
  projectName,
}: {
  results: ReadmeAnalysisResult;
  projectName: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <ResultsHeader
        title={
          projectName.trim()
            ? `${projectName.trim()} README review`
            : "README review results"
        }
        passedChecks={results.passedChecks}
        attentionChecks={results.attentionChecks}
      />

      <div className="mt-6 space-y-3">
        <BooleanResultRow
          label="Project purpose"
          passed={results.hasPurpose}
          explanation="Checks whether the README contains enough introductory text to explain the project."
        />

        <BooleanResultRow
          label="Installation"
          passed={results.hasInstallation}
          explanation="Looks for an Installation, Install, or Getting Started section."
        />

        <BooleanResultRow
          label="Prerequisites"
          passed={results.hasPrerequisites}
          explanation="Looks for prerequisites, requirements, or setup requirements."
        />

        <BooleanResultRow
          label="Usage"
          passed={results.hasUsage}
          explanation="Looks for a Usage, How to Use, or Examples section."
        />

        <BooleanResultRow
          label="Configuration"
          passed={results.hasConfiguration}
          explanation="Looks for a Configuration, Config, or Setup section."
        />

        <BooleanResultRow
          label="Environment variables"
          passed={results.mentionsEnvironmentVariables}
          explanation="Checks whether environment variables or a .env file are mentioned."
        />

        <BooleanResultRow
          label="Troubleshooting"
          passed={results.hasTroubleshooting}
          explanation="Looks for troubleshooting, common issues, or known issues guidance."
        />

        <BooleanResultRow
          label="License"
          passed={results.hasLicense}
          explanation="Looks for a License section or a common license name."
        />
      </div>
    </div>
  );
}

function ResultsHeader({
  title,
  passedChecks,
  attentionChecks,
}: {
  title: string;
  passedChecks: number;
  attentionChecks: number;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-zinc-400">
          Rule-based checks performed in your browser.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm">
        <span className="font-semibold text-green-300">
          {passedChecks} passed
        </span>

        <span className="mx-2 text-zinc-600">/</span>

        <span className="font-semibold text-amber-300">
          {attentionChecks} need attention
        </span>
      </div>
    </div>
  );
}

function BooleanResultRow({
  label,
  passed,
  explanation,
}: {
  label: string;
  passed: boolean;
  explanation: string;
}) {
  return (
    <ResultRow
      label={label}
      value={passed ? "Pass" : "Needs attention"}
      status={passed ? "pass" : "warn"}
      explanation={explanation}
    />
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
        <span className="font-medium">{label}</span>

        <strong className="shrink-0">{value}</strong>
      </div>

      <p className="mt-1 text-xs opacity-70">
        {explanation}
      </p>
    </div>
  );
}
"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { AgentGrid } from "@/components/analysis/agent-grid";
import { useAnalysisStream } from "@/hooks/use-analysis-stream";
import { useSounds } from "@/components/shared/sound-provider";
import type { RawCommit } from "@/lib/git/types";
type Phase = "cloning" | "analyzing" | "transitioning";

export default function AnalyzePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <AnalyzePage />
    </Suspense>
  );
}

function AnalyzePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repo = searchParams.get("repo") ?? "";
  const { agents, isComplete, timelineData, error, startAnalysis } =
    useAnalysisStream();
  const { playSwoosh } = useSounds();

  const [phase, setPhase] = useState<Phase>("cloning");
  const [extractError, setExtractError] = useState<string | null>(null);
  const startedRef = useRef(false);
  const timelineDataRef = useRef(timelineData);
  timelineDataRef.current = timelineData;

  const repoName = repo.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\.git$/, "");

  const extract = useCallback(async () => {
    if (!repo) {
      setExtractError("No repository URL provided. Add ?repo= to the URL.");
      return;
    }

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: repo }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `Extract failed (${res.status})`
        );
      }

      const { commits } = (await res.json()) as { commits: RawCommit[] };

      if (commits.length < 5) {
        throw new Error(
          `This repo only has ${commits.length} commit${commits.length === 1 ? "" : "s"}. Git Historian needs at least 5 commits to build a meaningful timeline.`
        );
      }

      setPhase("analyzing");
      startAnalysis(commits);
    } catch (err: unknown) {
      setExtractError(
        err instanceof Error ? err.message : "Failed to extract repository"
      );
    }
  }, [repo, startAnalysis]);

  // Kick off extraction once
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    extract();
  }, [extract]);

  // When analysis completes, play sound and start exit animation
  useEffect(() => {
    if (!isComplete || phase !== "analyzing") return;
    playSwoosh("down");
    setPhase("transitioning");
  }, [isComplete, phase, playSwoosh]);

  // After transition animation completes, navigate to timeline
  useEffect(() => {
    if (phase !== "transitioning") return;

    const timer = setTimeout(() => {
      const data = timelineDataRef.current;
      if (!data || data.length === 0) {
        setExtractError("Analysis completed but no timeline events generated. Try a repo with more history.");
        setPhase("cloning");
        return;
      }

      try {
        sessionStorage.setItem("git-historian-timeline", JSON.stringify(data));
      } catch {
        // sessionStorage may be full or unavailable
      }

      router.push(`/timeline?repo=${encodeURIComponent(repoName)}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [phase, repoName, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Error overlay */}
      {extractError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex max-w-md flex-col items-center gap-4 text-center"
          role="alert"
        >
          <p className="text-16 text-red-400">{extractError}</p>
          <Link
            href="/"
            className="text-14 text-[color:var(--color-gray9)] underline underline-offset-4 hover:text-[color:var(--color-high-contrast)]"
          >
            Go back
          </Link>
        </motion.div>
      )}

      {/* Main layout — always show AgentGrid */}
      {!extractError && (
        <motion.div
          animate={
            phase === "transitioning"
              ? { scale: 0.8, filter: "blur(2px)", opacity: 0 }
              : { scale: 1, filter: "blur(0px)", opacity: 1 }
          }
          transition={
            phase === "transitioning"
              ? { type: "spring", stiffness: 150, damping: 20, duration: 0.4 }
              : undefined
          }
          className="flex w-full justify-center"
        >
          <AgentGrid
            agents={agents}
            repoName={repoName}
            error={error}
            isCloning={phase === "cloning"}
          />
        </motion.div>
      )}
    </div>
  );
}

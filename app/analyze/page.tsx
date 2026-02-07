"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AgentGrid } from "@/components/analysis/agent-grid";
import { useAnalysisStream } from "@/hooks/use-analysis-stream";
import { useSounds } from "@/components/shared/sound-provider";
import type { RawCommit } from "@/lib/git/types";
import type { TimelineEvent } from "@/lib/timeline/types";

const DEMO_REPO_PATTERN = /github\.com\/helloluma\/edwardguillen/;

type Phase = "extracting" | "analyzing" | "transitioning" | "complete";

export default function AnalyzePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
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
  const repo = searchParams.get("repo") ?? "";
  const { agents, isComplete, timelineData, error, startAnalysis, simulateDemo } =
    useAnalysisStream();
  const { playSwoosh } = useSounds();

  const [phase, setPhase] = useState<Phase>("extracting");
  const [extractError, setExtractError] = useState<string | null>(null);
  const [demoTimeline, setDemoTimeline] = useState<TimelineEvent[] | null>(null);
  const startedRef = useRef(false);

  // Derive repo name from URL for display
  const repoName = repo.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\.git$/, "");

  const loadDemo = useCallback(async () => {
    setPhase("analyzing");

    // Start simulation and fetch cached data in parallel
    const [, demoRes] = await Promise.all([
      simulateDemo(),
      fetch("/api/demo").then((r) => r.json()) as Promise<{ timeline: TimelineEvent[] }>,
    ]);

    setDemoTimeline(demoRes.timeline);
  }, [simulateDemo]);

  const extract = useCallback(async () => {
    if (!repo) {
      setExtractError("No repository URL provided. Add ?repo= to the URL.");
      return;
    }

    // Use pre-cached data for the demo repo
    if (DEMO_REPO_PATTERN.test(repo)) {
      loadDemo();
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
      setPhase("analyzing");
      startAnalysis(commits);
    } catch (err: unknown) {
      setExtractError(
        err instanceof Error ? err.message : "Failed to extract repository"
      );
    }
  }, [repo, startAnalysis, loadDemo]);

  // Kick off extraction once
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    extract();
  }, [extract]);

  // Handle pipeline completion -> transition
  useEffect(() => {
    if (!isComplete || phase !== "analyzing") return;

    playSwoosh("down");
    setPhase("transitioning");

    const timer = setTimeout(() => {
      setPhase("complete");
    }, 600);

    return () => clearTimeout(timer);
  }, [isComplete, phase, playSwoosh]);

  // Redirect to timeline when complete
  useEffect(() => {
    if (phase !== "complete") return;

    const data = timelineData ?? demoTimeline;
    if (!data) return;

    // Store timeline data for the timeline page to pick up
    try {
      sessionStorage.setItem(
        "git-historian-timeline",
        JSON.stringify(data)
      );
    } catch {
      // sessionStorage may be full or unavailable
    }

    window.location.href = `/timeline?repo=${encodeURIComponent(repoName)}`;
  }, [phase, timelineData, demoTimeline, repoName]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <AnimatePresence mode="wait">
        {/* Extracting phase */}
        {phase === "extracting" && !extractError && (
          <motion.div
            key="extracting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            <p className="text-16 text-foreground">Cloning repository...</p>
            <p className="text-14 font-mono text-muted-foreground">
              {repoName}
            </p>
          </motion.div>
        )}

        {/* Extract error */}
        {extractError && (
          <motion.div
            key="extract-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex max-w-md flex-col items-center gap-4 text-center"
            role="alert"
          >
            <p className="text-16 text-red">{extractError}</p>
            <Link
              href="/"
              className="text-14 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Go back
            </Link>
          </motion.div>
        )}

        {/* Analyzing phase */}
        {(phase === "analyzing" || phase === "transitioning") && (
          <motion.div
            key="analyzing"
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
            exit={{ opacity: 0 }}
            className="flex w-full justify-center"
          >
            <AgentGrid
              agents={agents}
              repoName={repoName}
              error={error}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { AgentGrid } from "@/components/analysis/agent-grid";
import { useFakeAnalysis } from "@/hooks/use-fake-analysis";
import { getDemoRepo } from "@/lib/timeline/demo-repos";
import { useSounds } from "@/components/shared/sound-provider";
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
  const demoSlug = searchParams.get("demo") ?? "";
  const demoRepo = getDemoRepo(demoSlug);
  const repoName = demoRepo?.repoName ?? "";

  const { agents, isComplete, timelineId, error, startAnalysis } =
    useFakeAnalysis();
  const { playSwoosh } = useSounds();

  const [phase, setPhase] = useState<Phase>("cloning");
  const [extractError, setExtractError] = useState<string | null>(null);
  const startedRef = useRef(false);

  // Kick off fake analysis: brief "cloning" phase, then start animation
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!demoRepo) {
      setExtractError("Unknown repository. Please go back and select one.");
      return;
    }

    // Simulate a brief "cloning" phase, then start fake analysis
    const timer = setTimeout(() => {
      setPhase("analyzing");
      startAnalysis(demoSlug);
    }, 800);

    return () => clearTimeout(timer);
  }, [demoRepo, demoSlug, startAnalysis]);

  // When analysis completes, play sound and start exit animation
  useEffect(() => {
    if (!isComplete || phase !== "analyzing") return;
    playSwoosh("down");
    setPhase("transitioning");
  }, [isComplete, phase, playSwoosh]);

  // After transition animation completes, navigate to demo timeline
  useEffect(() => {
    if (phase !== "transitioning") return;

    const timer = setTimeout(() => {
      if (!timelineId) {
        setExtractError("Something went wrong. Please try again.");
        setPhase("cloning");
        return;
      }

      router.push(`/timeline/demo/${timelineId}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [phase, timelineId, router]);

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

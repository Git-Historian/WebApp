"use client";

import { motion, AnimatePresence } from "motion/react";
import type { AgentStatus } from "@/lib/ai/types";
import { AgentPanel } from "./agent-panel";
import { SiteHeader } from "@/components/shared/site-header";

const AGENT_PROGRESS_LABELS: Record<string, string> = {
  "commit-analyst": "Analyzing commits",
  "architecture-tracker": "Mapping architecture",
  "complexity-scorer": "Scoring complexity",
  "narrative-writer": "Writing the story",
};

function OverallProgress({
  agents,
  isCloning,
}: {
  agents: AgentStatus[];
  isCloning?: boolean;
}) {
  const total = agents.reduce((sum, a) => sum + a.progress, 0);
  const percent = isCloning ? 0 : Math.round(total / agents.length);

  // Find currently active agent for label
  const activeAgent = agents.find(
    (a) => a.status === "thinking" || a.status === "running"
  );
  const allDone = agents.every((a) => a.status === "complete");
  const isWorking = isCloning || (!allDone && !isCloning);

  let label: string;
  if (isCloning) {
    label = "Cloning repository";
  } else if (allDone) {
    label = "Analysis complete";
  } else if (activeAgent) {
    label = AGENT_PROGRESS_LABELS[activeAgent.name] ?? "Analyzing";
  } else {
    label = "Preparing agents";
  }

  return (
    <div className="flex flex-col gap-2.5" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Overall analysis progress">
      <div className="flex items-center justify-between">
        <span className="text-13 font-medium text-[color:var(--color-gray9)] relative overflow-hidden">
          {label}
          {isWorking && (
            <span
              className="absolute inset-0 animate-[text-shimmer_2s_ease-in-out_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, var(--color-gray7) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
              aria-hidden="true"
            >
              {label}
            </span>
          )}
        </span>
        {!isCloning && (
          <span className="text-13 font-mono text-[color:var(--color-gray9)] tabular-nums">
            {percent}%
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-gray4)] relative">
        {/* Indeterminate pulse while cloning — sits behind the fill */}
        {isCloning && (
          <div
            className="absolute inset-0 animate-[track-pulse_1.5s_ease-in-out_infinite]"
            style={{
              background: "linear-gradient(120deg, var(--color-agent-analyst) 0%, var(--color-agent-architect) 50%, var(--color-agent-complexity) 100%)",
              opacity: 0.25,
            }}
          />
        )}
        {/* Determinate fill — grows from 0 */}
        {percent > 0 && (
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${percent}%`,
              background: "linear-gradient(120deg, var(--color-agent-analyst) 0%, var(--color-agent-architect) 50%, var(--color-agent-complexity) 100%)",
              transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Smooth shimmer sweep */}
            <div
              className="absolute inset-0 animate-[bar-shimmer_2s_linear_infinite]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function AgentGrid({
  agents,
  repoName,
  error,
  isCloning,
}: {
  agents: AgentStatus[];
  repoName?: string;
  error?: string | null;
  isCloning?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[720px] flex-col">
      <SiteHeader />

      <div className="px-6 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-semibold -tracking-[0.02em] text-[color:var(--color-high-contrast)]">
            Analyzing Repository
          </h1>
          {repoName && (
            <p className="text-14 font-mono text-[color:var(--color-gray9)]">{repoName}</p>
          )}
        </div>

        <OverallProgress agents={agents} isCloning={isCloning} />

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-12 border border-red-500/30 bg-red-500/10 px-4 py-3 text-14 text-red-400"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        {/* 2x2 Grid — appears after cloning finishes */}
        <AnimatePresence>
          {!isCloning && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 18,
                mass: 0.8,
                staggerChildren: 0.08,
              }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              {agents.map((agent, i) => (
                <AgentPanel key={agent.name} agent={agent} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import { motion } from "motion/react";
import type { AgentStatus } from "@/lib/ai/types";
import { AgentPanel } from "./agent-panel";

function OverallProgress({ agents }: { agents: AgentStatus[] }) {
  const total = agents.reduce((sum, a) => sum + a.progress, 0);
  const percent = Math.round(total / agents.length);

  return (
    <div className="flex flex-col gap-2" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Overall analysis progress">
      <div className="flex items-center justify-between">
        <span className="text-13 text-muted-foreground">Analysis Progress</span>
        <span className="text-13 font-mono text-muted-foreground tabular-nums">
          {percent}%
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray4">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
    </div>
  );
}

export function AgentGrid({
  agents,
  repoName,
  error,
}: {
  agents: AgentStatus[];
  repoName?: string;
  error?: string | null;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-20 font-medium text-foreground">
          Analyzing Repository
        </h2>
        {repoName && (
          <p className="text-14 font-mono text-muted-foreground">{repoName}</p>
        )}
      </div>

      <OverallProgress agents={agents} />

      {/* Error banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-8 border border-red bg-red/10 px-4 py-3 text-14 text-red"
          role="alert"
        >
          {error}
        </motion.div>
      )}

      {/* 2x2 Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {agents.map((agent, i) => (
          <AgentPanel key={agent.name} agent={agent} index={i} />
        ))}
      </div>
    </div>
  );
}

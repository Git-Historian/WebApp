"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentName, AgentStatus } from "@/lib/ai/types";

// ─── Agent names in pipeline order ───────────────────────────────────
const AGENT_NAMES: AgentName[] = [
  "commit-analyst",
  "architecture-tracker",
  "complexity-scorer",
  "narrative-writer",
];

// ─── Fake thinking text per agent ────────────────────────────────────
const THINKING_TEXT: Record<AgentName, string[]> = {
  "commit-analyst": [
    "Scanning 147 commits across 14 months\u2026",
    "Identifying significant milestones\u2026",
    "Clustering related changes\u2026",
  ],
  "architecture-tracker": [
    "Tracing dependency graph\u2026",
    "Mapping directory structure evolution\u2026",
    "Detecting stack changes\u2026",
  ],
  "complexity-scorer": [
    "Calculating cyclomatic complexity\u2026",
    "Measuring refactoring ratios\u2026",
    "Scoring codebase health\u2026",
  ],
  "narrative-writer": [
    "Weaving the narrative arc\u2026",
    "Connecting milestones to story beats\u2026",
    "Crafting the final timeline\u2026",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Initial agent state ─────────────────────────────────────────────
function initialAgentStatuses(): AgentStatus[] {
  return AGENT_NAMES.map((name) => ({
    name,
    status: "idle" as const,
    progress: 0,
  }));
}

// ─── Public interface (mirrors useAnalysisStream) ────────────────────
export interface FakeAnalysisState {
  agents: AgentStatus[];
  isComplete: boolean;
  timelineId: string | null;
  error: string | null;
  startAnalysis: (slug: string) => void;
}

export function useFakeAnalysis(): FakeAnalysisState {
  const [agents, setAgents] = useState<AgentStatus[]>(initialAgentStatuses);
  const [isComplete, setIsComplete] = useState(false);
  const [timelineId, setTimelineId] = useState<string | null>(null);
  const [error] = useState<string | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Helper: update a single agent by name
  const updateAgent = useCallback(
    (name: AgentName, patch: Partial<AgentStatus>) => {
      setAgents((prev) =>
        prev.map((a) => (a.name === name ? { ...a, ...patch } : a))
      );
    },
    []
  );

  // Schedule a timeout and track it for cleanup
  const schedule = useCallback(
    (delay: number, fn: () => void) => {
      const id = setTimeout(fn, delay);
      timersRef.current.push(id);
    },
    []
  );

  const startAnalysis = useCallback(
    (slug: string) => {
      // Clean up any previous run
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];

      // Reset state
      setAgents(initialAgentStatuses());
      setIsComplete(false);
      setTimelineId(null);

      // ─── Animation schedule ──────────────────────────────────
      // Phase 1: Agents 1-3 start in parallel (staggered)
      const baseTime = Date.now();

      schedule(0, () => {
        updateAgent("commit-analyst", {
          status: "running",
          startedAt: baseTime,
        });
      });
      schedule(100, () => {
        updateAgent("architecture-tracker", {
          status: "running",
          startedAt: baseTime + 100,
        });
      });
      schedule(200, () => {
        updateAgent("complexity-scorer", {
          status: "running",
          startedAt: baseTime + 200,
        });
      });

      // Phase 1: Thinking text
      schedule(500, () => {
        updateAgent("commit-analyst", {
          status: "thinking",
          thinking: pick(THINKING_TEXT["commit-analyst"]),
        });
      });
      schedule(600, () => {
        updateAgent("architecture-tracker", {
          status: "thinking",
          thinking: pick(THINKING_TEXT["architecture-tracker"]),
        });
      });
      schedule(700, () => {
        updateAgent("complexity-scorer", {
          status: "thinking",
          thinking: pick(THINKING_TEXT["complexity-scorer"]),
        });
      });

      // Phase 1: Progress ticks
      schedule(900, () => updateAgent("commit-analyst", { progress: 25 }));
      schedule(1100, () => updateAgent("architecture-tracker", { progress: 20 }));
      schedule(1200, () => updateAgent("complexity-scorer", { progress: 30 }));
      schedule(1500, () => updateAgent("commit-analyst", { progress: 55 }));
      schedule(1700, () => updateAgent("architecture-tracker", { progress: 50 }));
      schedule(1800, () => updateAgent("complexity-scorer", { progress: 65 }));
      schedule(2000, () => updateAgent("commit-analyst", { progress: 80 }));
      schedule(2100, () => updateAgent("architecture-tracker", { progress: 75 }));
      schedule(2200, () => updateAgent("complexity-scorer", { progress: 90 }));

      // Phase 1: Complete agents 1-3
      schedule(2500, () => {
        updateAgent("commit-analyst", {
          status: "complete",
          progress: 100,
          completedAt: baseTime + 2500,
        });
      });
      schedule(2700, () => {
        updateAgent("architecture-tracker", {
          status: "complete",
          progress: 100,
          completedAt: baseTime + 2700,
        });
      });
      schedule(2900, () => {
        updateAgent("complexity-scorer", {
          status: "complete",
          progress: 100,
          completedAt: baseTime + 2900,
        });
      });

      // Phase 2: Narrative writer starts after others complete
      schedule(3100, () => {
        updateAgent("narrative-writer", {
          status: "running",
          startedAt: baseTime + 3100,
        });
      });
      schedule(3300, () => {
        updateAgent("narrative-writer", {
          status: "thinking",
          thinking: pick(THINKING_TEXT["narrative-writer"]),
        });
      });
      schedule(3600, () => updateAgent("narrative-writer", { progress: 35 }));
      schedule(3900, () => {
        updateAgent("narrative-writer", {
          progress: 60,
          thinking: pick(THINKING_TEXT["narrative-writer"]),
        });
      });
      schedule(4200, () => updateAgent("narrative-writer", { progress: 85 }));
      schedule(4500, () => {
        updateAgent("narrative-writer", {
          status: "complete",
          progress: 100,
          completedAt: baseTime + 4500,
        });
      });

      // Pipeline complete
      schedule(4700, () => {
        setTimelineId(slug);
        setIsComplete(true);
      });
    },
    [schedule, updateAgent]
  );

  return { agents, isComplete, timelineId, error, startAnalysis };
}

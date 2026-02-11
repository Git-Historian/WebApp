"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentName, AgentStatus } from "@/lib/ai/types";

// ─── Agent names in pipeline order ───────────────────────────────────
const AGENT_NAMES: AgentName[] = [
  "commit-analyst",
  "architecture-tracker",
  "complexity-scorer",
  "narrative-writer",
];

// First 3 run in parallel, writer waits for them
const PARALLEL_AGENTS: AgentName[] = [
  "commit-analyst",
  "architecture-tracker",
  "complexity-scorer",
];

// ─── Fake thinking text per agent ────────────────────────────────────
const THINKING_TEXT: Record<AgentName, string[]> = {
  "commit-analyst": [
    "Scanning 147 commits across 14 months...",
    "Identifying significant milestones...",
    "Clustering related changes...",
    "Rating commit significance...",
    "Grouping milestone clusters...",
  ],
  "architecture-tracker": [
    "Tracing dependency graph...",
    "Mapping directory structure evolution...",
    "Detecting stack changes...",
    "Analyzing import patterns...",
    "Tracking structural shifts...",
  ],
  "complexity-scorer": [
    "Calculating cyclomatic complexity...",
    "Measuring refactoring ratios...",
    "Scoring codebase health...",
    "Estimating growth rate...",
    "Computing churn metrics...",
  ],
  "narrative-writer": [
    "Weaving the narrative arc...",
    "Connecting milestones to story beats...",
    "Crafting the final timeline...",
    "Writing era summaries...",
    "Polishing commit stories...",
  ],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Random int between min and max (inclusive) */
function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Smooth easing: generates progress values along a curve instead of random jumps */
function easeProgress(steps: number): number[] {
  const result: number[] = [];
  for (let i = 1; i <= steps; i++) {
    // ease-in-out curve: slow start, fast middle, slow finish
    const t = i / (steps + 1);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    // Map to 8-95 range with slight randomness
    const base = Math.round(8 + eased * 87);
    const jitter = rand(-3, 3);
    result.push(Math.max(5, Math.min(95, base + jitter)));
  }
  return result;
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

      const baseTime = Date.now();

      // ── Randomize the 3 parallel agents ──
      // Each gets: random start offset, random duration, smooth progress curve
      const agentPlans = PARALLEL_AGENTS.map((name) => {
        const startDelay = rand(0, 300); // staggered 0-300ms
        const duration = rand(3000, 4800); // each takes 3-4.8s
        return { name, startDelay, duration };
      });

      // Calculate when the last parallel agent will finish
      let latestFinishTime = 0;
      for (const plan of agentPlans) {
        const finish = plan.startDelay + plan.duration;
        if (finish > latestFinishTime) latestFinishTime = finish;
      }

      // ── Schedule the writer to START before all parallel agents finish ──
      // This eliminates the "stuck" gap. Writer begins while the slowest
      // agent is still wrapping up its last ~15% of progress.
      const writerStartTime = latestFinishTime - rand(400, 800);
      const writerDuration = rand(2200, 3200);
      const writerFinishTime = writerStartTime + writerDuration;

      // ── Schedule parallel agents ──
      for (const plan of agentPlans) {
        const { name, startDelay, duration } = plan;
        const finishTime = startDelay + duration;

        // Start: running
        schedule(startDelay, () => {
          updateAgent(name, {
            status: "running",
            startedAt: baseTime + startDelay,
          });
        });

        // Thinking phase: shortly after start
        schedule(startDelay + rand(120, 280), () => {
          updateAgent(name, {
            status: "thinking",
            thinking: pick(THINKING_TEXT[name]),
          });
        });

        // Smooth progress ticks: 5-7 steps along an easing curve
        const tickCount = rand(5, 7);
        const progressSteps = easeProgress(tickCount);

        for (let i = 0; i < progressSteps.length; i++) {
          // Spread ticks evenly across the duration with slight jitter
          const tickTime =
            startDelay +
            Math.round(((i + 1) / (progressSteps.length + 1)) * duration) +
            rand(-60, 60);

          const progress = progressSteps[i];
          // Rotate thinking text on ~40% of ticks
          const swapThinking = Math.random() > 0.6;

          schedule(Math.max(startDelay + 200, tickTime), () => {
            updateAgent(name, {
              progress,
              ...(swapThinking
                ? { thinking: pick(THINKING_TEXT[name]) }
                : {}),
            });
          });
        }

        // Complete
        schedule(finishTime, () => {
          updateAgent(name, {
            status: "complete",
            progress: 100,
            completedAt: baseTime + finishTime,
          });
        });
      }

      // ── Schedule narrative writer (overlaps with tail of parallel agents) ──
      schedule(writerStartTime, () => {
        updateAgent("narrative-writer", {
          status: "running",
          startedAt: baseTime + writerStartTime,
        });
      });

      schedule(writerStartTime + rand(150, 300), () => {
        updateAgent("narrative-writer", {
          status: "thinking",
          thinking: pick(THINKING_TEXT["narrative-writer"]),
        });
      });

      // Smooth progress ticks for writer
      const writerTicks = rand(4, 6);
      const writerProgress = easeProgress(writerTicks);

      for (let i = 0; i < writerProgress.length; i++) {
        const t =
          writerStartTime +
          Math.round(((i + 1) / (writerProgress.length + 1)) * writerDuration) +
          rand(-50, 50);
        const p = writerProgress[i];
        const swap = Math.random() > 0.5;

        schedule(Math.max(writerStartTime + 250, t), () => {
          updateAgent("narrative-writer", {
            progress: p,
            ...(swap
              ? { thinking: pick(THINKING_TEXT["narrative-writer"]) }
              : {}),
          });
        });
      }

      // Writer complete
      schedule(writerFinishTime, () => {
        updateAgent("narrative-writer", {
          status: "complete",
          progress: 100,
          completedAt: baseTime + writerFinishTime,
        });
      });

      // Pipeline complete
      schedule(writerFinishTime + rand(250, 400), () => {
        setTimelineId(slug);
        setIsComplete(true);
      });
    },
    [schedule, updateAgent]
  );

  // Clean up all pending timers on unmount (StrictMode, navigation, etc.)
  useEffect(() => {
    return () => {
      for (const id of timersRef.current) clearTimeout(id);
      timersRef.current = [];
    };
  }, []);

  return { agents, isComplete, timelineId, error, startAnalysis };
}

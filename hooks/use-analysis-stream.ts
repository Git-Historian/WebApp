"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentName, AgentStatus, AnalysisEvent } from "@/lib/ai/types";
import type { RawCommit } from "@/lib/git/types";
import type { TimelineEvent } from "@/lib/timeline/types";

const AGENT_NAMES: AgentName[] = [
  "commit-analyst",
  "architecture-tracker",
  "complexity-scorer",
  "narrative-writer",
];

function initialAgentStatuses(): AgentStatus[] {
  return AGENT_NAMES.map((name) => ({
    name,
    status: "idle",
    progress: 0,
  }));
}

export interface AnalysisStreamState {
  agents: AgentStatus[];
  isComplete: boolean;
  timelineData: TimelineEvent[] | null;
  error: string | null;
  startAnalysis: (commits: RawCommit[]) => void;
  simulateDemo: () => Promise<void>;
}

export function useAnalysisStream(): AnalysisStreamState {
  const [agents, setAgents] = useState<AgentStatus[]>(initialAgentStatuses);
  const [isComplete, setIsComplete] = useState(false);
  const [timelineData, setTimelineData] = useState<TimelineEvent[] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const updateAgent = useCallback(
    (name: AgentName, patch: Partial<AgentStatus>) => {
      setAgents((prev) =>
        prev.map((a) => (a.name === name ? { ...a, ...patch } : a))
      );
    },
    []
  );

  const handleEvent = useCallback(
    (event: AnalysisEvent) => {
      const { type, agent, data } = event;

      switch (type) {
        case "agent_start":
          if (agent) {
            updateAgent(agent, {
              status: "running",
              progress: 5,
              startedAt: event.timestamp,
            });
          }
          break;

        case "agent_thinking":
          if (agent) {
            updateAgent(agent, {
              status: "thinking",
              thinking: data.thinking as string,
            });
          }
          break;

        case "agent_progress":
          if (agent) {
            updateAgent(agent, {
              progress: (data.progress as number) ?? 50,
            });
          }
          break;

        case "agent_complete":
          if (agent) {
            updateAgent(agent, {
              status: "complete",
              progress: 100,
              result: data.result,
              completedAt: event.timestamp,
            });
          }
          break;

        case "pipeline_complete":
          setTimelineData((data.timeline as TimelineEvent[]) ?? null);
          setIsComplete(true);
          break;

        case "error":
          if (agent) {
            updateAgent(agent, {
              status: "error",
              error: (data.error as string) ?? "Unknown error",
            });
          } else {
            setError((data.error as string) ?? "Pipeline failed");
          }
          break;
      }
    },
    [updateAgent]
  );

  const startAnalysis = useCallback(
    async (commits: RawCommit[]) => {
      // Reset state
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setAgents(initialAgentStatuses());
      setIsComplete(false);
      setTimelineData(null);
      setError(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commits }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(
            (body as { error?: string }).error ?? `HTTP ${response.status}`
          );
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE lines
          const lines = buffer.split("\n");
          // Keep last partial line in buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            const json = trimmed.slice(6);
            if (!json) continue;

            try {
              const event = JSON.parse(json) as AnalysisEvent;
              handleEvent(event);
            } catch {
              // Skip malformed lines
            }
          }
        }
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Failed to connect to analysis"
        );
      }
    },
    [handleEvent]
  );

  const simulateDemo = useCallback(async () => {
    setAgents(initialAgentStatuses());
    setIsComplete(false);
    setError(null);

    const delay = (ms: number) =>
      new Promise<void>((r) => setTimeout(r, ms));

    // Simulate agents 1-3 starting and completing in parallel
    const parallel: AgentName[] = [
      "commit-analyst",
      "architecture-tracker",
      "complexity-scorer",
    ];

    for (const name of parallel) {
      updateAgent(name, { status: "running", progress: 5, startedAt: Date.now() });
    }

    await delay(400);

    for (const name of parallel) {
      updateAgent(name, { status: "thinking", thinking: "Analyzing commits...", progress: 40 });
    }

    await delay(600);

    for (const name of parallel) {
      updateAgent(name, { status: "complete", progress: 100, completedAt: Date.now() });
    }

    await delay(200);

    // Simulate narrative writer
    updateAgent("narrative-writer", { status: "running", progress: 5, startedAt: Date.now() });
    await delay(400);
    updateAgent("narrative-writer", { status: "thinking", thinking: "Crafting project narrative...", progress: 50 });
    await delay(600);
    updateAgent("narrative-writer", { status: "complete", progress: 100, completedAt: Date.now() });

    await delay(200);
    setIsComplete(true);
  }, [updateAgent]);

  return { agents, isComplete, timelineData, error, startAnalysis, simulateDemo };
}

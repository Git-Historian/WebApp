"use client";

import { useCallback, useRef, useState } from "react";
import type { AgentName, AgentStatus, AnalysisEvent } from "@/lib/ai/types";
import type { RawCommit } from "@/lib/git/types";

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
  /** Blob ID for the saved timeline (set when pipeline completes) */
  timelineId: string | null;
  error: string | null;
  startAnalysis: (commits: RawCommit[], repoName: string, repoUrl: string) => void;
}

export function useAnalysisStream(): AnalysisStreamState {
  const [agents, setAgents] = useState<AgentStatus[]>(initialAgentStatuses);
  const [isComplete, setIsComplete] = useState(false);
  const [timelineId, setTimelineId] = useState<string | null>(null);
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

        case "pipeline_complete": {
          // Server saves timeline to blob and sends the ID
          const id = data.timelineId as string | null;
          if (id) {
            setTimelineId(id);
          }
          setIsComplete(true);
          break;
        }

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
    async (commits: RawCommit[], repoName: string, repoUrl: string) => {
      // Reset state
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setAgents(initialAgentStatuses());
      setIsComplete(false);
      setTimelineId(null);
      setError(null);

      // Trim payload: cap commits and files per commit to avoid exceeding body limits
      const MAX_COMMITS = 150;
      const MAX_FILES_PER_COMMIT = 15;
      const trimmedCommits = commits.slice(0, MAX_COMMITS).map((c) => ({
        ...c,
        files: c.files.slice(0, MAX_FILES_PER_COMMIT),
      }));

      let receivedComplete = false;

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commits: trimmedCommits,
            repoName,
            repoUrl,
          }),
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
              if (event.type === "pipeline_complete") receivedComplete = true;
              handleEvent(event);
            } catch (e) {
              console.error("[SSE] Parse error:", e, json.slice(0, 200));
            }
          }
        }

        // Detect premature stream closure
        if (!receivedComplete) {
          setError("Analysis stream ended unexpectedly. The server may have timed out — please try a smaller repository.");
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

  return { agents, isComplete, timelineId, error, startAnalysis };
}

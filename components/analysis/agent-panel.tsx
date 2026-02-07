"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { AgentName, AgentStatus } from "@/lib/ai/types";
import { useSounds } from "@/components/shared/sound-provider";

const AGENT_META: Record<
  AgentName,
  { label: string; colorVar: string; icon: string }
> = {
  "commit-analyst": {
    label: "Commit Analyst",
    colorVar: "var(--color-agent-analyst)",
    icon: "CA",
  },
  "architecture-tracker": {
    label: "Architecture Tracker",
    colorVar: "var(--color-agent-architect)",
    icon: "AT",
  },
  "complexity-scorer": {
    label: "Complexity Scorer",
    colorVar: "var(--color-agent-complexity)",
    icon: "CS",
  },
  "narrative-writer": {
    label: "Narrative Writer",
    colorVar: "var(--color-agent-narrator)",
    icon: "NW",
  },
};

const STATUS_LABELS: Record<AgentStatus["status"], string> = {
  idle: "Waiting",
  running: "Starting...",
  thinking: "Analyzing",
  complete: "Complete",
  error: "Error",
};

const RING_SIZE = 64;
const STROKE_WIDTH = 3;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({
  progress,
  color,
}: {
  progress: number;
  color: string;
}) {
  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <svg
      width={RING_SIZE}
      height={RING_SIZE}
      className="shrink-0 -rotate-90"
      aria-hidden
    >
      <circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="var(--color-gray4)"
        strokeWidth={STROKE_WIDTH}
      />
      <motion.circle
        cx={RING_SIZE / 2}
        cy={RING_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
    </svg>
  );
}

function useElapsedTime(startedAt?: number, completedAt?: number) {
  const [elapsed, setElapsed] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }

    if (completedAt) {
      setElapsed(Math.round((completedAt - startedAt) / 1000));
      return;
    }

    function tick() {
      setElapsed(Math.round((Date.now() - startedAt!) / 1000));
      frameRef.current = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(frameRef.current);
  }, [startedAt, completedAt]);

  return elapsed;
}

export function AgentPanel({
  agent,
  index,
}: {
  agent: AgentStatus;
  index: number;
}) {
  const meta = AGENT_META[agent.name];
  const { playPop, playSnap } = useSounds();
  const elapsed = useElapsedTime(agent.startedAt, agent.completedAt);
  const prevStatusRef = useRef(agent.status);
  const thinkingRef = useRef<HTMLDivElement>(null);

  // Sound triggers on status transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = agent.status;

    if (prev !== "running" && agent.status === "running") {
      playPop();
    }
    if (prev !== "complete" && agent.status === "complete") {
      playSnap();
    }
  }, [agent.status, playPop, playSnap]);

  // Auto-scroll thinking text
  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [agent.thinking]);

  const isActive =
    agent.status === "running" || agent.status === "thinking";
  const isDone = agent.status === "complete";
  const isError = agent.status === "error";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        delay: index * 0.1,
      }}
      className="relative flex flex-col gap-4 rounded-12 border p-5"
      style={{
        borderColor: isDone
          ? meta.colorVar
          : isError
            ? "var(--color-red)"
            : isActive
              ? `color-mix(in srgb, ${meta.colorVar} 50%, transparent)`
              : "var(--color-gray4)",
      }}
      role="region"
      aria-label={`${meta.label} agent - ${STATUS_LABELS[agent.status]}`}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative grid-stack">
          <ProgressRing progress={agent.progress} color={meta.colorVar} />
          <span
            className="text-13 font-mono font-medium"
            style={{ color: meta.colorVar }}
          >
            {meta.icon}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-15 font-medium text-foreground">
              {meta.label}
            </span>
            {agent.startedAt && (
              <span className="text-12 font-mono text-muted-foreground tabular-nums">
                {elapsed}s
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: isActive
                  ? meta.colorVar
                  : isDone
                    ? "var(--color-agent-narrator)"
                    : isError
                      ? "var(--color-red)"
                      : "var(--color-gray8)",
              }}
            />
            <span className="text-13 text-muted-foreground">
              {isError ? agent.error : STATUS_LABELS[agent.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Thinking stream */}
      <div
        ref={thinkingRef}
        className="h-12 overflow-hidden text-12 font-mono leading-16 text-muted-foreground transition-opacity"
        style={{ opacity: agent.thinking ? 1 : 0.4 }}
      >
        {agent.thinking ? (
          <span>
            {agent.thinking}
            {isActive && (
              <span className="animate-blink ml-0.5 inline-block text-foreground">
                |
              </span>
            )}
          </span>
        ) : (
          <span className="italic">
            {agent.status === "idle"
              ? "Waiting for pipeline..."
              : "Processing..."}
          </span>
        )}
      </div>
    </motion.div>
  );
}

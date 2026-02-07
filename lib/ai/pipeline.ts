import { RawCommit } from "@/lib/git/types";
import {
  AgentName,
  AnalysisEvent,
  CommitAnalysis,
  ArchitectureEvent,
  ComplexitySnapshot,
  Narrative,
  PipelineResult,
} from "./types";
import { TimelineEvent, TimelineCommit } from "@/lib/timeline/types";
import {
  commitAnalyst,
  architectureTracker,
  complexityScorer,
  narrativeWriter,
} from "./agents";

type EventCallback = (event: AnalysisEvent) => void;

function emit(cb: EventCallback, event: Omit<AnalysisEvent, "timestamp">) {
  cb({ ...event, timestamp: Date.now() } as AnalysisEvent);
}

export async function runPipeline(
  commits: RawCommit[],
  onEvent: EventCallback
): Promise<{ result: PipelineResult; timeline: TimelineEvent[] }> {
  // Phase 1: Run agents 1-3 in parallel
  const agentNames: AgentName[] = [
    "commit-analyst",
    "architecture-tracker",
    "complexity-scorer",
  ];

  for (const name of agentNames) {
    emit(onEvent, {
      type: "agent_start",
      agent: name,
      data: {},
    });
  }

  const makeProgressCb =
    (agent: AgentName): ((thinking: string) => void) =>
    (thinking: string) => {
      emit(onEvent, {
        type: "agent_thinking",
        agent,
        data: { thinking },
      });
    };

  const [commitResult, archResult, complexityResult] =
    await Promise.allSettled([
      commitAnalyst(commits, makeProgressCb("commit-analyst")),
      architectureTracker(commits, makeProgressCb("architecture-tracker")),
      complexityScorer(commits, makeProgressCb("complexity-scorer")),
    ]);

  const commitAnalysis: CommitAnalysis[] =
    commitResult.status === "fulfilled" ? commitResult.value : [];
  const architectureEvents: ArchitectureEvent[] =
    archResult.status === "fulfilled" ? archResult.value : [];
  const complexitySnapshots: ComplexitySnapshot[] =
    complexityResult.status === "fulfilled" ? complexityResult.value : [];

  // Emit completion/error for each agent
  for (const [i, result] of [
    commitResult,
    archResult,
    complexityResult,
  ].entries()) {
    const agent = agentNames[i];
    if (result.status === "fulfilled") {
      emit(onEvent, {
        type: "agent_complete",
        agent,
        data: { result: result.value },
      });
    } else {
      emit(onEvent, {
        type: "error",
        agent,
        data: { error: result.reason?.message ?? "Agent failed" },
      });
    }
  }

  // Phase 2: Narrative writer uses combined results
  emit(onEvent, {
    type: "agent_start",
    agent: "narrative-writer",
    data: {},
  });

  let narratives: Narrative[] = [];
  try {
    narratives = await narrativeWriter(
      commits,
      { commitAnalysis, architectureEvents, complexitySnapshots },
      makeProgressCb("narrative-writer")
    );
    emit(onEvent, {
      type: "agent_complete",
      agent: "narrative-writer",
      data: { result: narratives },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Narrative agent failed";
    emit(onEvent, {
      type: "error",
      agent: "narrative-writer",
      data: { error: message },
    });
  }

  const pipelineResult: PipelineResult = {
    commitAnalysis,
    architectureEvents,
    complexitySnapshots,
    narratives,
  };

  // Transform into TimelineEvent[] for the radial timeline
  const timeline = buildTimeline(commits, pipelineResult);

  emit(onEvent, {
    type: "pipeline_complete",
    data: { result: pipelineResult, timeline },
  });

  return { result: pipelineResult, timeline };
}

function buildTimeline(
  commits: RawCommit[],
  result: PipelineResult
): TimelineEvent[] {
  const { commitAnalysis, architectureEvents, narratives } = result;

  // Build milestone groups from commit analysis
  const milestoneGroups = new Map<
    string,
    { commits: RawCommit[]; analyses: CommitAnalysis[]; indices: number[] }
  >();

  commitAnalysis.forEach((analysis, i) => {
    if (!analysis.milestoneGroup || i >= commits.length) return;
    const group = milestoneGroups.get(analysis.milestoneGroup) ?? {
      commits: [],
      analyses: [],
      indices: [],
    };
    group.commits.push(commits[i]);
    group.analyses.push(analysis);
    group.indices.push(i);
    milestoneGroups.set(analysis.milestoneGroup, group);
  });

  // Also include high-significance standalone commits
  const usedIndices = new Set<number>();
  for (const group of milestoneGroups.values()) {
    for (const idx of group.indices) usedIndices.add(idx);
  }

  const events: TimelineEvent[] = [];

  // Add milestone group events
  for (const [name, group] of milestoneGroups) {
    const firstCommit = group.commits[0];
    const lastCommit = group.commits[group.commits.length - 1];
    const maxSig = Math.max(...group.analyses.map((a) => a.significance));
    const year = new Date(firstCommit.date).getFullYear();

    // Find matching architecture event
    const archNote = architectureEvents.find((e) =>
      group.commits.some((c) => c.hash === e.commitHash)
    );

    // Find matching narrative
    const narrative = narratives.find((n) =>
      n.milestones.some(
        (m) => m.toLowerCase().includes(name.toLowerCase().slice(0, 10))
      )
    );

    const timelineCommits: TimelineCommit[] = group.commits.map((c) => ({
      hash: c.hash,
      author: c.author,
      date: c.date,
      message: c.message,
      insertions: c.insertions,
      deletions: c.deletions,
    }));

    events.push({
      name: `${year}`,
      year,
      degree: 0, // Will be calculated below
      variant: maxSig >= 8 ? "large" : maxSig >= 5 ? "medium" : undefined,
      title: name,
      narrative: narrative?.story,
      commits: timelineCommits,
      architectureNote: archNote?.description,
      complexityDelta: undefined,
      category: group.analyses[0]?.category,
      dateRange: `${formatDate(firstCommit.date)} - ${formatDate(lastCommit.date)}`,
    });
  }

  // Add high-significance standalone commits not in any group
  commitAnalysis.forEach((analysis, i) => {
    if (usedIndices.has(i) || analysis.significance < 7 || i >= commits.length)
      return;
    const commit = commits[i];
    const year = new Date(commit.date).getFullYear();

    events.push({
      name: `${year}`,
      year,
      degree: 0,
      variant: analysis.significance >= 9 ? "large" : "medium",
      title: commit.message,
      commits: [
        {
          hash: commit.hash,
          author: commit.author,
          date: commit.date,
          message: commit.message,
          insertions: commit.insertions,
          deletions: commit.deletions,
        },
      ],
      category: analysis.category,
    });
  });

  // Sort by date and assign degrees (0-360 spread)
  events.sort((a, b) => {
    const dateA = a.commits?.[0]?.date ?? "";
    const dateB = b.commits?.[0]?.date ?? "";
    return dateA.localeCompare(dateB);
  });

  const totalEvents = events.length;
  events.forEach((event, i) => {
    event.degree = totalEvents > 1 ? (i / (totalEvents - 1)) * 340 + 10 : 180;
  });

  return events;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

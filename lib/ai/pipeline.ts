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
import { transformData } from "@/lib/timeline/data";
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
  console.log(`[pipeline] Starting with ${commits.length} commits`);
  const pipelineStart = Date.now();

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

  console.log(`[pipeline] Agent results: commitAnalysis: ${commitAnalysis.length}, archEvents: ${architectureEvents.length}, complexity: ${complexitySnapshots.length}`);
  console.log(`[pipeline] commitResult status: ${commitResult.status}${commitResult.status === 'rejected' ? `, reason: ${commitResult.reason}` : ''}`);
  console.log(`[pipeline] archResult status: ${archResult.status}${archResult.status === 'rejected' ? `, reason: ${archResult.reason}` : ''}`);
  console.log(`[pipeline] complexityResult status: ${complexityResult.status}${complexityResult.status === 'rejected' ? `, reason: ${complexityResult.reason}` : ''}`);
  if (commitAnalysis.length > 0) {
    const withMilestones = commitAnalysis.filter(a => a.milestoneGroup);
    const highSig = commitAnalysis.filter(a => a.significance >= 7);
    console.log(`[pipeline] Milestones: ${withMilestones.length}, high-significance (>=7): ${highSig.length}`);
    console.log(`[pipeline] Unique milestone groups: ${[...new Set(withMilestones.map(a => a.milestoneGroup))].join(', ')}`);
  }

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

  console.log(`[pipeline] Phase 1 (parallel agents) completed in ${Date.now() - pipelineStart}ms`);

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
    console.error(`[pipeline] Narrative writer FAILED: ${message}`);
    if (err instanceof Error && err.stack) {
      console.error(`[pipeline] Stack: ${err.stack.split('\n').slice(0, 3).join(' | ')}`);
    }
    emit(onEvent, {
      type: "error",
      agent: "narrative-writer",
      data: { error: message },
    });
  }

  console.log(`[pipeline] Phase 2 (narrative) completed in ${Date.now() - pipelineStart}ms, narratives: ${narratives.length}`);
  // Debug: log what the narrative writer actually returned
  if (narratives.length > 0) {
    const firstNarrative = narratives[0];
    console.log(`[pipeline] Narrative sample: era: "${firstNarrative.eraTitle}", milestoneStories keys: ${firstNarrative.milestoneStories ? Object.keys(firstNarrative.milestoneStories).join(', ') : 'NONE'}, commitStories keys: ${firstNarrative.commitStories ? Object.keys(firstNarrative.commitStories).length + ' hashes' : 'NONE'}`);
    // Log all milestoneStories keys across all narratives
    const allMSKeys = narratives.flatMap(n => n.milestoneStories ? Object.keys(n.milestoneStories) : []);
    console.log(`[pipeline] All milestoneStories keys (${allMSKeys.length}): ${allMSKeys.slice(0, 10).join(', ')}${allMSKeys.length > 10 ? '...' : ''}`);
  }

  const pipelineResult: PipelineResult = {
    commitAnalysis,
    architectureEvents,
    complexitySnapshots,
    narratives,
  };

  // Transform into TimelineEvent[] for the radial timeline
  const timeline = buildTimeline(commits, pipelineResult);
  // Log narrative matching stats
  const withNarrative = timeline.filter(e => e.narrative);
  const withCommitStories = timeline.filter(e => e.commits?.some(c => c.story));
  console.log(`[pipeline] Narrative matching: ${withNarrative.length}/${timeline.length} events have narrative, ${withCommitStories.length}/${timeline.length} have commit stories`);
  console.log(`[pipeline] Built ${timeline.length} timeline events, degrees: [${timeline.map(e => e.degree).join(', ')}]`);
  console.log(`[pipeline] Total pipeline time: ${Date.now() - pipelineStart}ms`);

  // Only send timeline in the SSE event. Full pipelineResult is too large for a single SSE line
  emit(onEvent, {
    type: "pipeline_complete",
    data: { timeline },
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

    // Find matching narrative: first try milestoneStories (exact key), then era story fallback
    const milestoneNarrative = findMilestoneStory(name, narratives);
    // If no milestoneStory, fall back to the era story from date-range matching
    const eraStory = !milestoneNarrative
      ? findEraStoryByDate(firstCommit.date, narratives)
      : undefined;

    const timelineCommits: TimelineCommit[] = group.commits.map((c) => ({
      hash: c.hash,
      author: c.author,
      date: c.date,
      message: c.message,
      story: findCommitStory(c.hash, narratives),
      insertions: c.insertions,
      deletions: c.deletions,
    }));

    events.push({
      name: shortLabel(name),
      year,
      degree: 0, // Will be calculated below
      variant: maxSig >= 8 ? "large" : maxSig >= 5 ? "medium" : undefined,
      title: name,
      narrative: milestoneNarrative ?? eraStory,
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
      name: shortLabel(commit.message),
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
          story: findCommitStory(commit.hash, narratives),
          insertions: commit.insertions,
          deletions: commit.deletions,
        },
      ],
      category: analysis.category,
    });
  });

  // Sort by date
  events.sort((a, b) => {
    const dateA = a.commits?.[0]?.date ?? "";
    const dateB = b.commits?.[0]?.date ?? "";
    return dateA.localeCompare(dateB);
  });

  // Cap events to ~30 so they fit within LINE_COUNT (180 lines)
  const MAX_EVENTS = 30;
  const capped = events.length > MAX_EVENTS
    ? events.filter((_, i) => i % Math.ceil(events.length / MAX_EVENTS) === 0).slice(0, MAX_EVENTS)
    : events;

  // Use transformData to produce integer degrees the radial timeline expects
  return transformData(capped);
}

/**
 * Look up a milestone story by exact group name across all narrative eras.
 * Falls back to case-insensitive match and partial match.
 */
function findMilestoneStory(groupName: string, narratives: Narrative[]): string | undefined {
  const nameLower = groupName.toLowerCase();

  for (const narrative of narratives) {
    if (!narrative.milestoneStories) continue;

    // Exact match
    if (narrative.milestoneStories[groupName]) {
      return narrative.milestoneStories[groupName];
    }

    // Case-insensitive match
    for (const [key, story] of Object.entries(narrative.milestoneStories)) {
      if (key.toLowerCase() === nameLower) return story;
    }
  }

  // Partial match: check if any milestoneStory key contains the group name or vice versa
  for (const narrative of narratives) {
    if (!narrative.milestoneStories) continue;
    for (const [key, story] of Object.entries(narrative.milestoneStories)) {
      const keyLower = key.toLowerCase();
      if (keyLower.includes(nameLower) || nameLower.includes(keyLower)) {
        return story;
      }
    }
  }

  return undefined;
}

/**
 * Find the era story by matching a commit date to a narrative's date range.
 * Parses "Mon YYYY - Mon YYYY" format from narrative.dateRange.
 */
function findEraStoryByDate(commitDate: string, narratives: Narrative[]): string | undefined {
  const commitTime = new Date(commitDate).getTime();
  if (isNaN(commitTime)) return undefined;

  for (const narrative of narratives) {
    const parts = narrative.dateRange?.split(/\s*[-–]\s*/);
    if (!parts || parts.length < 2) continue;
    const eraStart = new Date(parts[0].trim()).getTime();
    const eraEnd = new Date(parts[1].trim()).getTime();
    if (isNaN(eraStart) || isNaN(eraEnd)) continue;

    // Give a 30-day buffer on each side for fuzzy date matching
    const buffer = 30 * 24 * 60 * 60 * 1000;
    if (commitTime >= eraStart - buffer && commitTime <= eraEnd + buffer) {
      return narrative.story;
    }
  }
  return undefined;
}

function findCommitStory(hash: string, narratives: Narrative[]): string | undefined {
  const short = hash.slice(0, 7);
  for (const narrative of narratives) {
    if (narrative.commitStories) {
      // Try both full hash prefix and 7-char
      const story = narrative.commitStories[short] ?? narrative.commitStories[hash];
      if (story) return story;
    }
  }
  return undefined;
}

function shortLabel(text: string): string {
  // Take first 2-3 words, max ~18 chars, for a compact radial label
  const words = text.split(/[\s/]+/);
  let label = words[0];
  for (let i = 1; i < words.length && label.length < 12; i++) {
    label += " " + words[i];
  }
  return label.length > 18 ? label.slice(0, 17) + "\u2026" : label;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

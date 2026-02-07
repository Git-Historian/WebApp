import { getAnthropicClient } from "./client";
import { RawCommit } from "@/lib/git/types";
import {
  CommitAnalysis,
  ArchitectureEvent,
  ComplexitySnapshot,
  Narrative,
} from "./types";

type ProgressCallback = (thinking: string) => void;

function formatCommitsForPrompt(commits: RawCommit[]): string {
  return commits
    .map(
      (c, i) =>
        `[${i + 1}] ${c.date} | ${c.hash.slice(0, 7)} | ${c.author}\n` +
        `  Message: ${c.message}\n` +
        `  Changes: +${c.insertions} -${c.deletions} | ${c.files.length} files\n` +
        `  Files: ${c.files
          .slice(0, 10)
          .map((f) => `${f.status[0].toUpperCase()}:${f.path}`)
          .join(", ")}${c.files.length > 10 ? ` (+${c.files.length - 10} more)` : ""}`
    )
    .join("\n\n");
}

async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  onProgress: ProgressCallback
): Promise<T> {
  const client = getAnthropicClient();

  onProgress("Sending request to Claude...");

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  onProgress("Parsing response...");

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from the response — handle markdown code fences
  let jsonStr = textBlock.text.trim();
  const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  return JSON.parse(jsonStr) as T;
}

// ---- Agent 1: Commit Analyst ----

export async function commitAnalyst(
  commits: RawCommit[],
  onProgress: ProgressCallback
): Promise<CommitAnalysis[]> {
  onProgress("Analyzing commit significance and milestones...");

  const systemPrompt = `You are a git commit analyst. Analyze repository commits and rate each one's significance.

Return ONLY a JSON array of objects with these fields:
- significance: number 1-10 (1=trivial, 5=notable feature, 10=major architectural shift)
- category: string (one of: "feature", "bugfix", "refactor", "docs", "infra", "dependency", "test", "style")
- milestoneGroup: string or null (group related commits into named milestones like "Authentication System", "API v2 Migration", etc.)

The array must have exactly ${commits.length} items, one per commit in order.
Focus on identifying meaningful milestones — group commits that contribute to the same goal.
Return ONLY valid JSON, no explanation.`;

  const userPrompt = `Analyze these ${commits.length} commits:\n\n${formatCommitsForPrompt(commits)}`;

  onProgress("Scoring commit significance...");
  return callClaude<CommitAnalysis[]>(systemPrompt, userPrompt, onProgress);
}

// ---- Agent 2: Architecture Tracker ----

export async function architectureTracker(
  commits: RawCommit[],
  onProgress: ProgressCallback
): Promise<ArchitectureEvent[]> {
  onProgress("Tracking architecture and stack evolution...");

  const systemPrompt = `You are a software architecture analyst. Analyze repository commits to identify architectural changes.

Return ONLY a JSON array of architecture events. Each event has:
- type: "stack_change" | "structural" | "directory_evolution"
- description: string (clear description of what changed architecturally)
- commitHash: string (the full commit hash that introduced this change)
- date: string (ISO date from the commit)

Focus on:
- New frameworks, libraries, or tools being added
- Directory restructures or major refactors
- Database or API changes
- Build system changes
- Migration from one technology to another

Only include significant architectural events (not every commit). Aim for 5-20 events.
Return ONLY valid JSON, no explanation.`;

  const userPrompt = `Analyze architectural changes in these ${commits.length} commits:\n\n${formatCommitsForPrompt(commits)}`;

  onProgress("Identifying stack changes and structural events...");
  return callClaude<ArchitectureEvent[]>(systemPrompt, userPrompt, onProgress);
}

// ---- Agent 3: Complexity Scorer ----

export async function complexityScorer(
  commits: RawCommit[],
  onProgress: ProgressCallback
): Promise<ComplexitySnapshot[]> {
  onProgress("Calculating complexity and health metrics...");

  const systemPrompt = `You are a code complexity analyst. Analyze repository commits to produce complexity snapshots over time.

Return ONLY a JSON array of complexity snapshots at regular intervals through the project history. Each snapshot has:
- date: string (ISO date)
- totalFiles: number (estimated cumulative file count at this point)
- totalLines: number (estimated cumulative line count)
- growthRate: number (lines added per day in this period, 0-1000)
- healthScore: number (0-100, where 100 is healthiest — considers refactoring, test coverage signals, code churn)
- refactoringRatio: number (0-1, ratio of deletion/modification commits vs pure additions in this period)

Create snapshots at meaningful intervals — roughly one per 10-20% of the project timeline.
Aim for 5-10 snapshots total.
Return ONLY valid JSON, no explanation.`;

  const userPrompt = `Analyze complexity evolution across these ${commits.length} commits:\n\n${formatCommitsForPrompt(commits)}`;

  onProgress("Computing growth rate and health scores...");
  return callClaude<ComplexitySnapshot[]>(systemPrompt, userPrompt, onProgress);
}

// ---- Agent 4: Narrative Writer ----

export async function narrativeWriter(
  commits: RawCommit[],
  analyses: {
    commitAnalysis: CommitAnalysis[];
    architectureEvents: ArchitectureEvent[];
    complexitySnapshots: ComplexitySnapshot[];
  },
  onProgress: ProgressCallback
): Promise<Narrative[]> {
  onProgress("Crafting project narrative...");

  const systemPrompt = `You are a technical storyteller. Using commit data and prior analysis, write a compelling documentary-style narrative of this project's evolution.

Return ONLY a JSON array of narrative eras. Each era has:
- eraTitle: string (evocative title like "The Foundation", "Growing Pains", "The Great Refactor")
- dateRange: string (e.g., "Jan 2023 - Mar 2023")
- story: string (2-4 sentences, documentary style — vivid, specific, referencing real changes)
- milestones: string[] (3-5 key milestone names from this era)

Create 3-6 eras that cover the full project timeline.
Make the narrative engaging — this is for a visual timeline, not a changelog.
Return ONLY valid JSON, no explanation.`;

  const analysisContext = `
COMMIT ANALYSIS SUMMARY:
- High significance commits (7+): ${analyses.commitAnalysis.filter((c) => c.significance >= 7).length}
- Milestone groups: ${[...new Set(analyses.commitAnalysis.map((c) => c.milestoneGroup).filter(Boolean))].join(", ")}

ARCHITECTURE EVENTS:
${analyses.architectureEvents.map((e) => `- [${e.type}] ${e.description} (${e.date})`).join("\n")}

COMPLEXITY TREND:
${analyses.complexitySnapshots.map((s) => `- ${s.date}: ${s.totalFiles} files, health ${s.healthScore}/100, growth ${s.growthRate} lines/day`).join("\n")}
`;

  const userPrompt = `Write the narrative for this project based on ${commits.length} commits and the analysis below:\n\n${analysisContext}\n\nCOMMIT LOG:\n${formatCommitsForPrompt(commits.slice(0, 100))}`;

  onProgress("Writing documentary-style era narratives...");
  return callClaude<Narrative[]>(systemPrompt, userPrompt, onProgress);
}

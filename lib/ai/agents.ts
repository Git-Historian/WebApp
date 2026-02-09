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

  const response = await client.messages.create(
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    },
    { signal: AbortSignal.timeout(45_000) }
  );

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

  // Last resort: find the first [ or { and extract to the matching close
  if (!jsonStr.startsWith("[") && !jsonStr.startsWith("{")) {
    const start = jsonStr.search(/[{[]/);
    if (start !== -1) {
      jsonStr = jsonStr.slice(start);
    }
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

  const systemPrompt = `You are a world-class documentary narrator telling the story of a codebase's evolution. Think Ken Burns meets Silicon Valley. Every repository has drama, ambition, setbacks, and breakthroughs hiding in its commit log. Your job is to find that story and make it unforgettable.

Write like each era is a chapter in a Netflix documentary about the people who built this software. Don't just describe what changed. Reveal WHY it changed. Find the tension: What problem was becoming unbearable? What bet did the team make? What broke before it got better? Every codebase has moments where someone stared at a screen and decided to tear everything apart and rebuild it right. Find those moments.

Return ONLY a JSON array of narrative eras. Each era has:
- eraTitle: string. A cinematic chapter title that captures the drama (e.g., "The Spark", "Empire of Spaghetti", "Burning It Down", "The Quiet Revolution"). Avoid generic titles like "Phase 1" or "Initial Development."
- dateRange: string (e.g., "Jan 2023 - Mar 2023")
- story: string. 2-4 sentences of vivid, evocative storytelling. Open with a hook. Use concrete details from the actual commits (real file names, real architectural decisions) but weave them into narrative. Convey the FEELING of each era: the early excitement of a greenfield project, the creeping dread of technical debt, the catharsis of a major refactor, the quiet confidence of a mature system. Write about the humans behind the code, their ambitions, their pivots, their hard-won lessons.
- milestones: string[]. 3-5 key milestones phrased as meaningful moments, not changelog entries. Instead of "Added authentication", write "The gates go up: user auth arrives." Instead of "Migrated to TypeScript", write "The great type awakening."
- commitStories: Record<string, string>. A map of commit hash (first 7 chars) to a 1-2 sentence narrative for that commit. Cover every significant commit in this era (significance 5+). Don't just restate the commit message. Tell the STORY of each commit: what problem it solved, what it unlocked, what the developer was thinking. Make even small commits feel purposeful. Example: instead of "deploy new portfolio", write "The first version hits the world. After days of local tweaks, someone finally pulled the trigger and shipped it live." For a refactor: "The old routing system had become a maze of if-else chains. This commit ripped it out and replaced it with something clean enough to build on."

STRICT FORMATTING RULES:
- NEVER use em dashes (the long dash character). Use commas, periods, or semicolons instead.
- NEVER use the -- or --- character sequences to substitute for em dashes.
- Write in a conversational, documentary tone. Short punchy sentences mixed with longer flowing ones.
- Use colons sparingly. Prefer breaking into two sentences over using a colon.

Rules for great narrative:
- Every era needs dramatic tension. What was at stake? What could have gone wrong?
- Turning points matter more than features. A refactor that saved the project is more interesting than ten new endpoints.
- Use specificity to build credibility: mention real file paths, real framework names, real patterns from the commits.
- Vary your pacing: some eras are explosive bursts of creation, others are slow burns of refinement.
- The first era should feel like an origin story. The last era should feel like the present chapter of an ongoing saga.
- Be concise but evocative. Every sentence should earn its place.

Create 3-6 eras that cover the full project timeline.
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

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

/**
 * Sanitize a JSON string by removing/escaping control characters that
 * Claude sometimes emits inside string values (literal newlines, tabs, etc.).
 * JSON.parse is strict: control chars 0x00-0x1F must be escaped inside strings.
 */
function sanitizeJsonString(json: string): string {
  // Replace control characters inside JSON string values.
  // Walk character by character, tracking whether we're inside a JSON string.
  let result = "";
  let inStr = false;
  let escaped = false;

  for (let i = 0; i < json.length; i++) {
    const ch = json[i];
    const code = json.charCodeAt(i);

    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }

    if (ch === "\\" && inStr) {
      result += ch;
      escaped = true;
      continue;
    }

    if (ch === '"') {
      inStr = !inStr;
      result += ch;
      continue;
    }

    // If inside a string and it's a control character, escape it
    if (inStr && code < 0x20) {
      if (code === 0x0a) result += "\\n";       // newline
      else if (code === 0x0d) result += "\\r";   // carriage return
      else if (code === 0x09) result += "\\t";   // tab
      else result += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    result += ch;
  }

  return result;
}

/**
 * Attempt to repair truncated JSON arrays by closing open brackets/braces.
 * Handles the common case where Claude's response gets cut off at max_tokens.
 */
function repairTruncatedJson(json: string): string {
  let str = json.trim();

  // Try parsing as-is first
  try {
    JSON.parse(str);
    return str;
  } catch {
    // Continue to repair
  }

  // Strategy 1: Find the last complete top-level array element.
  // Walk through the string tracking nesting depth to find positions where
  // a top-level array element closes (depth goes from 2 back to 1).
  if (str.startsWith("[")) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    const topLevelClosePositions: number[] = [];

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (esc) { esc = false; continue; }
      if (ch === "\\") { esc = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === "{" || ch === "[") depth++;
      if (ch === "}" || ch === "]") {
        depth--;
        // depth 1 means we just closed a top-level array element (inside the outer [])
        if (depth === 1) topLevelClosePositions.push(i);
      }
    }

    // Try from the last complete top-level element backwards
    for (let k = topLevelClosePositions.length - 1; k >= 0; k--) {
      const pos = topLevelClosePositions[k];
      const candidate = str.slice(0, pos + 1) + "]";
      try {
        JSON.parse(candidate);
        console.log(`[repairJson] Recovered ${k + 1} complete elements from truncated array`);
        return candidate;
      } catch {
        // Try next position
      }
    }
  }

  // Strategy 2: Remove trailing comma and try closing brackets
  str = str.replace(/,\s*$/, "");

  const lastCompleteComma = str.lastIndexOf("},");
  const lastCompleteBracket = str.lastIndexOf("}]");

  if (lastCompleteBracket !== -1) {
    const candidate = str.slice(0, lastCompleteBracket + 2);
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue
    }
  }

  if (lastCompleteComma !== -1) {
    const candidate = str.slice(0, lastCompleteComma + 1) + "]";
    try {
      JSON.parse(candidate);
      return candidate;
    } catch {
      // Continue
    }
  }

  // Strategy 3: Brute force. Count unclosed brackets and close them
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (const ch of str) {
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === "{") openBraces++;
    if (ch === "}") openBraces--;
    if (ch === "[") openBrackets++;
    if (ch === "]") openBrackets--;
  }

  // If we're inside a string, close it
  if (inString) str += '"';
  // Remove trailing comma
  str = str.replace(/,\s*$/, "");
  // Close remaining open braces/brackets
  for (let i = 0; i < openBraces; i++) str += "}";
  for (let i = 0; i < openBrackets; i++) str += "]";

  return str;
}

async function callClaude<T>(
  systemPrompt: string,
  userPrompt: string,
  onProgress: ProgressCallback,
  maxTokens: number = 8192,
  timeoutMs: number = 90_000
): Promise<T> {
  const client = getAnthropicClient();

  onProgress("Sending request to Claude...");

  const response = await client.messages.create(
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    },
    { signal: AbortSignal.timeout(timeoutMs) }
  );

  onProgress("Parsing response...");

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Extract JSON from the response. Handle markdown code fences
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

  // Sanitize: remove control characters that can break JSON.parse
  // (Claude sometimes emits literal tabs/newlines inside string values)
  jsonStr = sanitizeJsonString(jsonStr);

  // Try parsing, and if it fails, always attempt JSON repair
  // (response may be truncated even without max_tokens stop_reason)
  try {
    return JSON.parse(jsonStr) as T;
  } catch (firstErr) {
    const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
    console.log(`[callClaude] JSON parse failed (stop_reason: ${response.stop_reason}, length: ${jsonStr.length}): ${errMsg}`);
    // Log the area around the error position if available
    const posMatch = errMsg.match(/position (\d+)/);
    if (posMatch) {
      const pos = Number(posMatch[1]);
      console.log(`[callClaude] JSON error context: ...${jsonStr.slice(Math.max(0, pos - 40), pos)}<<<HERE>>>${jsonStr.slice(pos, pos + 40)}...`);
    }
    try {
      const repaired = repairTruncatedJson(jsonStr);
      return JSON.parse(repaired) as T;
    } catch {
      throw new Error(`Failed to parse Claude response as JSON: ${jsonStr.slice(0, 200)}...`);
    }
  }
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
Focus on identifying meaningful milestones. Group commits that contribute to the same goal.
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
- healthScore: number (0-100, where 100 is healthiest, considers refactoring, test coverage signals, code churn)
- refactoringRatio: number (0-1, ratio of deletion/modification commits vs pure additions in this period)

Create snapshots at meaningful intervals, roughly one per 10-20% of the project timeline.
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

  // Gather the exact milestone group names from the commit analyst
  const milestoneGroupNames = [
    ...new Set(
      analyses.commitAnalysis
        .map((c) => c.milestoneGroup)
        .filter((g): g is string => !!g)
    ),
  ];

  // Build a map of milestone group → commit hashes for the narrative writer
  const milestoneCommitHashes: Record<string, string[]> = {};
  analyses.commitAnalysis.forEach((ca, i) => {
    if (ca.milestoneGroup && i < commits.length) {
      if (!milestoneCommitHashes[ca.milestoneGroup]) {
        milestoneCommitHashes[ca.milestoneGroup] = [];
      }
      milestoneCommitHashes[ca.milestoneGroup].push(
        commits[i].hash.slice(0, 7)
      );
    }
  });

  const systemPrompt = `You are a legendary tech storyteller with the comedic instincts of a stand-up comic who codes. You narrate git histories the way Anthony Bourdain narrated street food: with love, attitude, and zero tolerance for pretension. Every line should hit like a tweet that gets 10k likes.

GOLDEN RULES:
1. NEVER restate commit messages. "Add OG meta tags" becomes "The site finally learned how to introduce itself at parties instead of showing up as a blank avatar and a URL nobody trusts."
2. Every sentence must earn its place. If it's boring, kill it. If it sounds like a JIRA ticket, burn it.
3. Be the friend who explains your git history at 2am and somehow makes it hilarious.

VOICE:
- Talk like a developer who's seen some things. Ship first, apologize never.
- Mix sharp observations with genuine respect for the craft. Roast the code, celebrate the coder.
- Use unexpected metaphors. A database migration isn't "updating the schema," it's "performing open-heart surgery on a patient who's still running a marathon."
- Be specific. Reference actual file names, frameworks, and patterns. "Updated styles" is a crime. "Taught globals.css to stop having an identity crisis" is art.
- Casual profanity is fine when it lands naturally. Don't force it.
- Short sentences punch. Long sentences land when they build to something worth reading.

WHAT MAKES A GOOD STORY:
- "Fourteen config files walked into a repo. Three survived." (unexpected framing)
- "The kind of commit you make at midnight when the deploy is broken and your coffee is cold." (emotional truth)
- "React got evicted. Next.js moved in. The components didn't even notice." (anthropomorphizing tech)
- "This is the commit where the site went from 'my first website' to 'wait, this is actually good.'" (narrative arc)

Return ONLY a JSON array of narrative eras. Each era has:
- eraTitle: string. Chapter titles that slap. Good: "The Great Unfucking", "Suddenly, SEO Matters", "Teaching Robots to Talk", "Zero to Deploy or Die Trying", "The Pixel Wars". Bad: "Phase 1", "Initial Development", "Updates and Improvements".
- dateRange: string (e.g., "Jan 2023 - Mar 2023")
- story: string. 2-3 sentences that would make someone stop scrolling. Open with a hook. End with a punchline or an insight that sticks. Never describe what was added; describe what changed for the humans. Make the reader feel something.
- milestones: string[]. 3-5 one-liners that could be standup bits. Not "Implemented dark mode" but "Gave the site sunglasses. It's been wearing them indoors ever since."
- milestoneStories: Record<string, string>. CRITICAL: Maps the EXACT milestone group name (provided below) to a punchy 2-3 sentence narrative. Use the EXACT group names as keys. Every milestone group in this era MUST have an entry. Each story should read like a paragraph from a really good blog post, not a PR description.
- commitStories: Record<string, string>. Maps commit hash (first 7 chars) to 1-2 sentences that make you smile. Examples:
  * "Day one. The repo exists. It's got a README and the audacity to call itself a portfolio."
  * "Deleted more code than they wrote. The bravest commit in the whole history."
  * "Someone finally realized the CSS was having a civil war with itself. This commit brokered the peace deal."
  * "The moment the site learned social skills. Shared links stopped showing up like a broken JPEG and a prayer."
  Cover every significant commit (significance 5+). Use the EXACT 7-char hashes provided below.

FORMATTING:
- NEVER use em dashes. Use commas, periods, or semicolons.
- NEVER use -- or --- sequences.
- Don't start stories with "In this era" or "During this phase." Just start with the interesting part.
- Read everything out loud. If it sounds like it belongs in a changelog, rewrite it until it doesn't.

Create 3-6 eras covering the full timeline.
Return ONLY valid JSON, no explanation.`;

  const analysisContext = `
COMMIT ANALYSIS SUMMARY:
- High significance commits (7+): ${analyses.commitAnalysis.filter((c) => c.significance >= 7).length}

MILESTONE GROUPS (use these EXACT names as keys in milestoneStories):
${milestoneGroupNames.map((name) => `- "${name}" (commits: ${milestoneCommitHashes[name]?.join(", ") ?? "none"})`).join("\n")}

ARCHITECTURE EVENTS:
${analyses.architectureEvents.map((e) => `- [${e.type}] ${e.description} (${e.date})`).join("\n")}

COMPLEXITY TREND:
${analyses.complexitySnapshots.map((s) => `- ${s.date}: ${s.totalFiles} files, health ${s.healthScore}/100, growth ${s.growthRate} lines/day`).join("\n")}
`;

  const userPrompt = `Write the narrative for this project based on ${commits.length} commits and the analysis below:\n\n${analysisContext}\n\nCOMMIT LOG:\n${formatCommitsForPrompt(commits.slice(0, 100))}`;

  onProgress("Writing documentary-style era narratives...");
  return callClaude<Narrative[]>(systemPrompt, userPrompt, onProgress, 16384, 120_000);
}

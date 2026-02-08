"use client";

import type { TimelineEvent } from "@/lib/timeline/types";
import { Badge } from "@/components/ui/badge";

/**
 * Synthesize a readable paragraph from raw commit messages when
 * the AI hasn't generated per-commit stories. Turns a list of
 * changelog-style messages into flowing sentences.
 */
function synthesizeParagraph(commits: { message: string; author: string }[]): string {
  if (commits.length === 0) return "";
  if (commits.length === 1) return commits[0].message + ".";

  // Clean up commit messages: strip trailing periods, lowercase first letter for joining
  const cleaned = commits.map((c) => {
    let msg = c.message.trim();
    // Remove trailing period/colon
    msg = msg.replace(/[.:]+$/, "");
    return msg;
  });

  // Build a flowing paragraph: first sentence stands alone, rest joined naturally
  const parts: string[] = [];
  parts.push(cleaned[0] + ".");

  for (let i = 1; i < cleaned.length; i++) {
    const msg = cleaned[i];
    // Add connecting phrases for variety
    if (i === cleaned.length - 1 && cleaned.length > 2) {
      parts.push("Finally, " + msg.charAt(0).toLowerCase() + msg.slice(1) + ".");
    } else if (i % 3 === 1) {
      parts.push("From there, " + msg.charAt(0).toLowerCase() + msg.slice(1) + ".");
    } else if (i % 3 === 2) {
      parts.push("Then, " + msg.charAt(0).toLowerCase() + msg.slice(1) + ".");
    } else {
      parts.push(msg + ".");
    }
  }

  return parts.join(" ");
}

export function EventDetail({ event }: { event: TimelineEvent }) {
  const commits = event.commits ?? [];
  const totalInsertions = commits.reduce((s, c) => s + c.insertions, 0);
  const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0);
  const authors = [...new Set(commits.map((c) => c.author))];

  // Build a combined narrative from AI-generated commit stories
  const commitStories = commits
    .map((c) => c.story)
    .filter((s): s is string => !!s);

  const combinedNarrative = commitStories.length > 0
    ? commitStories.join(" ")
    : null;

  // Fallback: synthesize a paragraph from raw commit messages
  const fallbackParagraph = !combinedNarrative && commits.length > 0
    ? synthesizeParagraph(commits)
    : null;

  return (
    <div className="text-[color:var(--color-gray12)] text-15 leading-28 flex flex-col gap-6 w-full">
      {/* Title + category */}
      <div className="flex items-center gap-3">
        <h2 className="text-24 font-semibold flex-1 -tracking-[0.02em] text-[color:var(--color-high-contrast)]">
          {event.title}
        </h2>
        {event.category && (
          <Badge variant="outline" className="text-12 shrink-0">
            {event.category}
          </Badge>
        )}
      </div>

      {/* Date range */}
      {event.dateRange && (
        <span className="text-13 font-mono text-[color:var(--color-gray9)] -mt-3">
          {event.dateRange}
        </span>
      )}

      {/* Era narrative */}
      {event.narrative && (
        <p className="leading-[1.8] text-16 text-[color:var(--color-gray12)]">
          {event.narrative}
        </p>
      )}

      {/* AI-generated commit stories as a flowing paragraph */}
      {combinedNarrative && (
        <p className="leading-[1.8] text-15 text-[color:var(--color-gray11)]">
          {combinedNarrative}
        </p>
      )}

      {/* Fallback: synthesized paragraph from raw commit messages */}
      {fallbackParagraph && (
        <p className="leading-[1.8] text-15 text-[color:var(--color-gray11)]">
          {fallbackParagraph}
        </p>
      )}

      {/* Architecture note */}
      {event.architectureNote && (
        <div className="border border-[color:var(--color-gray4)] rounded-8 p-4" role="region" aria-label="Architecture note">
          <span className="text-12 text-[color:var(--color-gray9)] uppercase tracking-wider font-medium">
            Architecture
          </span>
          <p className="text-14 mt-1 text-[color:var(--color-gray11)]">{event.architectureNote}</p>
        </div>
      )}

      {/* Compact stats footer */}
      {commits.length > 0 && (
        <div className="flex items-center gap-4 text-12 text-[color:var(--color-gray9)] pt-2 border-t border-[color:var(--color-gray4)]">
          <span className="font-mono">
            {commits.length} commit{commits.length !== 1 ? "s" : ""}
          </span>
          {(totalInsertions > 0 || totalDeletions > 0) && (
            <>
              <span className="font-mono text-[color:var(--color-green9)]" aria-label={`${totalInsertions} insertions`}>
                +{totalInsertions}
              </span>
              <span className="font-mono text-[color:var(--color-red9)]" aria-label={`${totalDeletions} deletions`}>
                -{totalDeletions}
              </span>
              <div
                className="flex h-1.5 flex-1 max-w-[120px] rounded-full overflow-hidden"
                role="progressbar"
                aria-label={`${totalInsertions} insertions, ${totalDeletions} deletions`}
                aria-valuenow={totalInsertions}
                aria-valuemin={0}
                aria-valuemax={totalInsertions + totalDeletions}
              >
                <div
                  className="bg-[color:var(--color-green9)]"
                  style={{
                    width: `${(totalInsertions / (totalInsertions + totalDeletions)) * 100}%`,
                  }}
                />
                <div
                  className="bg-[color:var(--color-red9)]"
                  style={{
                    width: `${(totalDeletions / (totalInsertions + totalDeletions)) * 100}%`,
                  }}
                />
              </div>
            </>
          )}
          {authors.length > 0 && (
            <span className="ml-auto">
              {authors.length === 1 ? authors[0] : `${authors.length} contributors`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

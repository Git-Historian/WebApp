"use client";

import type { TimelineEvent } from "@/lib/timeline/types";
import { Badge } from "@/components/ui/badge";

export function EventDetail({ event }: { event: TimelineEvent }) {
  const commits = event.commits ?? [];
  const totalInsertions = commits.reduce((s, c) => s + c.insertions, 0);
  const totalDeletions = commits.reduce((s, c) => s + c.deletions, 0);
  const authors = [...new Set(commits.map((c) => c.author))];

  // Build a combined narrative from commit stories
  const commitStories = commits
    .map((c) => c.story)
    .filter((s): s is string => !!s);

  // For commits without AI stories, use the raw message as a sentence
  const rawFallbacks = commits
    .filter((c) => !c.story)
    .map((c) => c.message);

  const combinedNarrative = commitStories.length > 0
    ? commitStories.join(" ")
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

      {/* Combined commit stories */}
      {combinedNarrative && (
        <p className="leading-[1.8] text-15 text-[color:var(--color-gray11)]">
          {combinedNarrative}
        </p>
      )}

      {/* Raw commit messages for commits without stories */}
      {rawFallbacks.length > 0 && commitStories.length > 0 && (
        <div className="flex flex-col gap-1">
          {rawFallbacks.map((msg, i) => (
            <span key={i} className="text-14 text-[color:var(--color-gray9)]">
              {msg}
            </span>
          ))}
        </div>
      )}

      {/* If no AI stories at all, show commits the old way */}
      {commitStories.length === 0 && commits.length > 0 && (
        <div className="flex flex-col gap-3">
          {commits.map((commit) => (
            <div
              key={commit.hash}
              className="flex flex-col gap-1 border-l-2 border-[color:var(--color-gray4)] pl-3 -ml-2 py-2 px-3 rounded-6 transition-colors hover:bg-[color:var(--color-gray3)]"
            >
              <div className="flex items-center gap-2">
                <code className="text-12 font-mono text-[color:var(--color-gray11)]">
                  {commit.hash.slice(0, 7)}
                </code>
                <span className="text-12 text-[color:var(--color-gray11)]">
                  {commit.author}
                </span>
              </div>
              <span className="text-14">{commit.message}</span>
              {(commit.insertions > 0 || commit.deletions > 0) && (
                <div className="flex items-center gap-2 text-12">
                  <span className="font-mono text-[color:var(--color-green9)]">
                    +{commit.insertions}
                  </span>
                  <span className="font-mono text-[color:var(--color-red9)]">
                    -{commit.deletions}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Architecture note */}
      {event.architectureNote && (
        <div className="border border-[color:var(--color-gray4)] rounded-8 p-4">
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
              <span className="font-mono text-[color:var(--color-green9)]">
                +{totalInsertions}
              </span>
              <span className="font-mono text-[color:var(--color-red9)]">
                -{totalDeletions}
              </span>
              <div className="flex h-1.5 flex-1 max-w-[120px] rounded-full overflow-hidden">
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

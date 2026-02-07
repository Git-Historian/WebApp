"use client";

import type { TimelineEvent } from "@/lib/timeline/types";
import { Badge } from "@/components/ui/badge";

export function EventDetail({ event }: { event: TimelineEvent }) {
  return (
    <div className="text-[color:var(--color-gray12)] text-15 leading-28 flex flex-col gap-6 w-full">
      <div className="flex items-center gap-3">
        <i className="text-24 flex-1">{event.title}</i>
        {event.category && (
          <Badge variant="outline" className="text-12 shrink-0">
            {event.category}
          </Badge>
        )}
      </div>

      {event.narrative && (
        <p className="leading-32 text-16">{event.narrative}</p>
      )}

      {event.architectureNote && (
        <div className="border border-[color:var(--color-gray4)] rounded-8 p-4">
          <span className="text-12 text-[color:var(--color-gray9)] uppercase tracking-wider">
            Architecture
          </span>
          <p className="text-14 mt-1">{event.architectureNote}</p>
        </div>
      )}

      {event.complexityDelta !== undefined && (
        <div className="flex items-center gap-2 text-14">
          <span className="text-[color:var(--color-gray9)]">Complexity:</span>
          <Badge
            variant={event.complexityDelta > 0 ? "destructive" : "default"}
            className="text-12"
          >
            {event.complexityDelta > 0 ? "+" : ""}
            {event.complexityDelta}%
          </Badge>
        </div>
      )}

      {event.commits && event.commits.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          <span className="text-12 text-[color:var(--color-gray9)] uppercase tracking-wider">
            Commits
          </span>
          {event.commits.map((commit) => (
            <div
              key={commit.hash}
              className="flex flex-col gap-1 border-l-2 border-[color:var(--color-gray4)] pl-3"
            >
              <div className="flex items-center gap-2">
                <code className="text-12 font-mono text-[color:var(--color-orange)]">
                  {commit.hash.slice(0, 7)}
                </code>
                <span className="text-12 text-[color:var(--color-gray9)]">
                  {commit.author}
                </span>
              </div>
              <span className="text-14">{commit.message}</span>
              {(commit.insertions > 0 || commit.deletions > 0) && (
                <div className="flex items-center gap-2 text-12">
                  <span className="text-[color:var(--color-green9)]">
                    +{commit.insertions}
                  </span>
                  <span className="text-[color:var(--color-red9)]">
                    -{commit.deletions}
                  </span>
                  <div className="flex h-2 flex-1 max-w-[200px] rounded-full overflow-hidden">
                    <div
                      className="bg-[color:var(--color-green9)]"
                      style={{
                        width: `${
                          (commit.insertions /
                            (commit.insertions + commit.deletions)) *
                          100
                        }%`,
                      }}
                    />
                    <div
                      className="bg-[color:var(--color-red9)]"
                      style={{
                        width: `${
                          (commit.deletions /
                            (commit.insertions + commit.deletions)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

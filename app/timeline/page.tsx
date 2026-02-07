"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import RadialTimeline from "@/components/timeline/radial-timeline";
import { useSounds } from "@/components/shared/sound-provider";
import { SAMPLE_DATA } from "@/lib/timeline/sample-data";
import type { TimelineEvent } from "@/lib/timeline/types";

export default function TimelinePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
        </div>
      }
    >
      <TimelinePage />
    </Suspense>
  );
}

function TimelinePage() {
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repo");
  const { muted, toggleMute } = useSounds();
  const [data, setData] = useState<TimelineEvent[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Try loading from sessionStorage (from analysis flow)
    try {
      const stored = sessionStorage.getItem("git-historian-timeline");
      if (stored) {
        const parsed = JSON.parse(stored) as TimelineEvent[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setData(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {
      // Fall through to sample data
    }

    // Fallback to sample data
    setData(SAMPLE_DATA);
    setLoaded(true);
  }, []);

  if (!loaded || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Header overlay */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="text-14 font-mono text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors"
          >
            git historian
          </a>
          {repoName && (
            <>
              <span className="text-[color:var(--color-gray6)]">/</span>
              <span className="text-14 font-mono text-[color:var(--color-gray11)]">
                {repoName}
              </span>
            </>
          )}
        </div>

        <button
          onClick={toggleMute}
          className="text-14 text-[color:var(--color-gray9)] hover:text-[color:var(--color-gray11)] transition-colors"
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </motion.header>

      <RadialTimeline data={data} />
    </>
  );
}

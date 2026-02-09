"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TimelineView } from "@/components/timeline/timeline-view";
import { SAMPLE_DATA } from "@/lib/timeline/sample-data";
import type { TimelineEvent } from "@/lib/timeline/types";

export default function TimelinePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
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
  const [data, setData] = useState<TimelineEvent[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
      // sessionStorage unavailable
    }

    // Fallback to sample data
    setData(SAMPLE_DATA);
    setLoaded(true);
  }, []);

  if (!loaded || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  return <TimelineView data={data} repoName={repoName ?? undefined} />;
}

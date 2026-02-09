import { put, head } from "@vercel/blob";
import type { TimelineEvent } from "@/lib/timeline/types";

export interface StoredTimeline {
  id: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  eventCount: number;
  timeline: TimelineEvent[];
}

const ID_REGEX = /^[a-f0-9]{12}$/;

export function generateTimelineId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export async function saveTimeline({
  repoName,
  repoUrl,
  timeline,
}: {
  repoName: string;
  repoUrl: string;
  timeline: TimelineEvent[];
}): Promise<string> {
  const id = generateTimelineId();

  const payload: StoredTimeline = {
    id,
    repoName,
    repoUrl,
    createdAt: new Date().toISOString(),
    eventCount: timeline.length,
    timeline,
  };

  await put(`timelines/${id}.json`, JSON.stringify(payload), {
    addRandomSuffix: false,
    access: "public",
    contentType: "application/json",
  });

  return id;
}

export async function loadTimeline(
  id: string
): Promise<StoredTimeline | null> {
  if (!ID_REGEX.test(id)) return null;

  try {
    const meta = await head(`timelines/${id}.json`);
    const res = await fetch(meta.url);
    if (!res.ok) return null;
    return (await res.json()) as StoredTimeline;
  } catch {
    return null;
  }
}

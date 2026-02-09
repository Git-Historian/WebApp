import { notFound } from "next/navigation";
import { loadTimeline } from "@/lib/blob/timelines";
import { TimelineView } from "@/components/timeline/timeline-view";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const stored = await loadTimeline(id);

  if (!stored) {
    return { title: "Timeline not found — Git Historian" };
  }

  return {
    title: `${stored.repoName} — Git Historian`,
    description: `A visual timeline of ${stored.repoName} with ${stored.eventCount} key moments in its history.`,
    openGraph: {
      title: `${stored.repoName} — Git Historian`,
      description: `A visual timeline of ${stored.repoName} with ${stored.eventCount} key moments in its history.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${stored.repoName} — Git Historian`,
      description: `A visual timeline of ${stored.repoName} with ${stored.eventCount} key moments in its history.`,
    },
  };
}

export default async function SharedTimelinePage({ params }: Props) {
  const { id } = await params;
  const stored = await loadTimeline(id);

  if (!stored) {
    notFound();
  }

  return (
    <TimelineView
      data={stored.timeline}
      repoName={stored.repoName}
      timelineId={stored.id}
    />
  );
}

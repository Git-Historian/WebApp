import { notFound } from "next/navigation";
import { getDemoRepo, getAdjacentDemos } from "@/lib/timeline/demo-repos";
import { TimelineView } from "@/components/timeline/timeline-view";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const demo = getDemoRepo(slug);

  if (!demo) {
    return { title: "Timeline not found | Git Historian" };
  }

  return {
    title: `${demo.repoName} | Git Historian`,
    description: `A visual timeline of ${demo.repoName} with ${demo.timeline.length} key moments in its history.`,
    openGraph: {
      title: `${demo.repoName} | Git Historian`,
      description: `A visual timeline of ${demo.repoName} with ${demo.timeline.length} key moments in its history.`,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${demo.repoName} | Git Historian`,
      description: `A visual timeline of ${demo.repoName} with ${demo.timeline.length} key moments in its history.`,
    },
  };
}

export default async function DemoTimelinePage({ params }: Props) {
  const { slug } = await params;
  const demo = getDemoRepo(slug);

  if (!demo) {
    notFound();
  }

  const adjacent = getAdjacentDemos(slug);

  return (
    <TimelineView
      data={demo.timeline}
      repoName={demo.repoName}
      adjacentProjects={adjacent}
    />
  );
}

import { NextResponse } from "next/server";
import { saveTimeline } from "@/lib/blob/timelines";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { repoName, repoUrl, timeline } = body as {
      repoName?: string;
      repoUrl?: string;
      timeline?: unknown[];
    };

    if (!repoName || !repoUrl || !Array.isArray(timeline) || timeline.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: repoName, repoUrl, timeline" },
        { status: 400 }
      );
    }

    const id = await saveTimeline({ repoName, repoUrl, timeline: timeline as never[] });

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Failed to save timeline:", err);
    return NextResponse.json(
      { error: "Failed to save timeline" },
      { status: 500 }
    );
  }
}

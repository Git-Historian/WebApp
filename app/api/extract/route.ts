import { NextRequest, NextResponse } from "next/server";
import { cloneRepo, extractCommits, cleanup } from "@/lib/git/extractor";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing repo URL" }, { status: 400 });
    }

    const isGitHub = /^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(url);
    if (!isGitHub) {
      return NextResponse.json(
        { error: "Only GitHub URLs are supported" },
        { status: 400 }
      );
    }

    const repoPath = await cloneRepo(url);

    try {
      const commits = await extractCommits(repoPath);
      return NextResponse.json({ commits, total: commits.length });
    } finally {
      await cleanup(repoPath);
    }
  } catch (error: unknown) {
    console.error("Extract error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract commits";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

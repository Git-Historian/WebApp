import { NextRequest, NextResponse } from "next/server";
import { extractCommits } from "@/lib/git/extractor";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing repo URL" }, { status: 400 });
    }

    // Accept: HTTPS URLs, SSH, github.com/owner/repo, or owner/repo shorthand
    const isValid =
      /^https?:\/\/(www\.)?github\.com\/.+\/.+/.test(url) ||
      /^git@github\.com:.+\/.+/.test(url) ||
      /^(www\.)?github\.com\/.+\/.+/.test(url) ||
      /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(url.trim());
    if (!isValid) {
      return NextResponse.json(
        { error: "Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)" },
        { status: 400 }
      );
    }

    console.log(`[extract] Fetching commits for ${url}`);
    const extractStart = Date.now();
    const commits = await extractCommits(url);
    console.log(`[extract] Total extraction time: ${Date.now() - extractStart}ms for ${commits.length} commits`);
    return NextResponse.json({ commits, total: commits.length });
  } catch (error: unknown) {
    console.error("Extract error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to extract commits";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

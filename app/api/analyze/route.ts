import { NextRequest } from "next/server";
import { RawCommit } from "@/lib/git/types";
import { AnalysisEvent } from "@/lib/ai/types";
import { runPipeline } from "@/lib/ai/pipeline";
import { saveTimeline } from "@/lib/blob/timelines";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  console.log("[analyze] ANTHROPIC_API_KEY set:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const { commits, repoName, repoUrl } = (await request.json()) as {
      commits: RawCommit[];
      repoName?: string;
      repoUrl?: string;
    };

    if (!commits || !Array.isArray(commits) || commits.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty commits array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze] Received ${commits.length} commits, repo: ${repoName}`);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // SSE heartbeat to keep connection alive during long AI calls
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(": heartbeat\n\n"));
          } catch {
            // Stream already closed
          }
        }, 10_000);

        function sendSSE(event: AnalysisEvent) {
          const json = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${json}\n\n`));
        }

        // Intercept pipeline events: for pipeline_complete, save to blob
        // and send only the blob ID (avoids 30KB+ SSE payloads that
        // Vercel's edge network can corrupt or drop)
        function onPipelineEvent(event: AnalysisEvent) {
          if (event.type !== "pipeline_complete") {
            sendSSE(event);
          }
          // pipeline_complete is handled after runPipeline returns
        }

        try {
          const { timeline } = await runPipeline(commits, onPipelineEvent);

          if (timeline && timeline.length > 0) {
            // Save full timeline (with narratives) to blob storage
            const id = await saveTimeline({
              repoName: repoName ?? "unknown",
              repoUrl: repoUrl ?? "",
              timeline: timeline as never[],
            });
            console.log(`[analyze] Saved timeline to blob: ${id}, events: ${timeline.length}`);

            // Send tiny SSE payload with just the blob ID
            sendSSE({
              type: "pipeline_complete",
              data: { timelineId: id, eventCount: timeline.length },
              timestamp: Date.now(),
            });
          } else {
            console.warn(`[analyze] Pipeline returned 0 timeline events`);
            sendSSE({
              type: "pipeline_complete",
              data: { timelineId: null, eventCount: 0 },
              timestamp: Date.now(),
            });
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Pipeline failed";
          sendSSE({
            type: "error",
            data: { error: message },
            timestamp: Date.now(),
          });
        } finally {
          clearInterval(heartbeat);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Request failed";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

import { NextRequest } from "next/server";
import { RawCommit } from "@/lib/git/types";
import { AnalysisEvent } from "@/lib/ai/types";
import { runPipeline } from "@/lib/ai/pipeline";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  console.log("[analyze] ANTHROPIC_API_KEY set:", !!process.env.ANTHROPIC_API_KEY);

  try {
    const { commits } = (await request.json()) as { commits: RawCommit[] };

    if (!commits || !Array.isArray(commits) || commits.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or empty commits array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze] Received ${commits.length} commits`);

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

        function sendEvent(event: AnalysisEvent) {
          const json = JSON.stringify(event);
          const data = `data: ${json}\n\n`;
          if (event.type === "pipeline_complete") {
            console.log(`[analyze] Sending pipeline_complete event, JSON size: ${json.length} bytes, timeline events: ${(event.data.timeline as unknown[])?.length ?? 0}`);
          }
          controller.enqueue(encoder.encode(data));
        }

        try {
          await runPipeline(commits, sendEvent);
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : "Pipeline failed";
          sendEvent({
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

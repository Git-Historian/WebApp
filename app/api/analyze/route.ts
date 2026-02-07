import { NextRequest } from "next/server";
import { RawCommit } from "@/lib/git/types";
import { AnalysisEvent } from "@/lib/ai/types";
import { runPipeline } from "@/lib/ai/pipeline";

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

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(event: AnalysisEvent) {
          const data = `data: ${JSON.stringify(event)}\n\n`;
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

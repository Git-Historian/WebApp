import { NextResponse } from "next/server";
import { SAMPLE_DATA } from "@/lib/timeline/sample-data";

export async function GET() {
  return NextResponse.json({ timeline: SAMPLE_DATA });
}

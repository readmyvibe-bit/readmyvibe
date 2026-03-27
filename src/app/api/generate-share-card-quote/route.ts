import { NextRequest, NextResponse } from "next/server";
import { generateShareCardQuote } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { fullResult?: string; toolName?: string };
    const fullResult = body.fullResult?.trim();
    if (!fullResult) {
      return NextResponse.json({ error: "Missing fullResult" }, { status: 400 });
    }
    const quote = await generateShareCardQuote(fullResult, body.toolName || "Reading");
    return NextResponse.json({ quote });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate card line" }, { status: 500 });
  }
}

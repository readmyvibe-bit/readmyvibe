import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { fullResult, quote, toolName } = (await req.json()) as {
      fullResult: string;
      quote: string;
      toolName: string;
    };

    if (!fullResult?.trim()) {
      return NextResponse.json({ error: "Missing fullResult" }, { status: 400 });
    }

    const prompt = `Based on this result from ${toolName}: ${fullResult}
Key funny line: ${quote}

Write a funny Instagram caption in 4-5 lines maximum.
Rules:
- Start with "POV:" or a funny observation
- Include 1 specific funny line from the result
- End with "Try yours at readmyvibe.in 👆"
- Add 4-5 relevant hashtags on last line
- Tone: funny, self-aware, relatable
- Max 150 words total.`;

    const caption = await generateReading(prompt);
    return NextResponse.json({ caption: caption.trim() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Caption generation failed" }, { status: 500 });
  }
}

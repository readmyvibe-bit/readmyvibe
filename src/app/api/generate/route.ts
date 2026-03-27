import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/gemini";
import { TOOL_CONFIG } from "@/lib/config";
import { fillPrompt, PROMPTS } from "@/lib/prompts";
import { supabaseAdmin } from "@/lib/supabase";
import { ToolId } from "@/types";

function getFreePreview(fullResult: string) {
  const secondSection = fullResult.search(/\n\s*2\./);
  if (secondSection > 0) return fullResult.slice(0, secondSection).trim();
  const lines = fullResult.split("\n").filter(Boolean);
  return lines.slice(0, 2).join("\n");
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const body = await req.json();
    const toolId = body.toolId as ToolId;
    const inputs = body.inputs as Record<string, string>;
    const sessionId = body.sessionId as string;

    if (!toolId || !TOOL_CONFIG[toolId] || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const fields = TOOL_CONFIG[toolId].fields;
    for (const field of fields) {
      if (field.required && !(inputs[field.id] || "").trim()) {
        return NextResponse.json({ error: `Missing ${field.label}` }, { status: 400 });
      }
    }

    const { data: unlock } = await supabaseAdmin
      .from("unlocks")
      .select("id")
      .eq("session_id", sessionId)
      .eq("tool_id", toolId)
      .maybeSingle();
    const unlocked = Boolean(unlock);

    const prompt = fillPrompt(PROMPTS[toolId], inputs);
    const fullResult = await generateReading(prompt);
    const freePreview = getFreePreview(fullResult);

    const { data: generation } = await supabaseAdmin
      .from("generations")
      .insert({
        session_id: sessionId,
        tool_id: toolId,
        is_paid: unlocked,
      })
      .select("id")
      .single();

    return NextResponse.json({
      freePreview,
      fullResult: unlocked ? fullResult : null,
      generationId: generation?.id ?? null,
      unlocked,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong, try again ✨" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/gemini";
import { TOOL_CONFIG } from "@/lib/config";
import { fillPrompt, PROMPTS } from "@/lib/prompts";
import { supabaseAdmin } from "@/lib/supabase";
import { ToolId } from "@/types";

const REQUIRED_SECTION_COUNT: Record<ToolId, number> = {
  "profile-personality": 5,
  "crush-compatibility": 6,
  "facebook-prediction": 7,
  "profile-impression": 6,
  "decode-message": 7,
  "friendship-roast": 7,
  "instagram-type": 6,
};

function getFreePreview(fullResult: string) {
  const secondSection = fullResult.search(/\n\s*2\./);
  if (secondSection > 0) return fullResult.slice(0, secondSection).trim();
  const lines = fullResult.split("\n").filter(Boolean);
  return lines.slice(0, 2).join("\n");
}

function countNumberedSections(text: string) {
  const matches = text.match(/(?:^|\n)\s*\d+\./g);
  return matches ? matches.length : 0;
}

async function generateCompleteReading(toolId: ToolId, prompt: string): Promise<string> {
  const required = REQUIRED_SECTION_COUNT[toolId];
  const firstPass = await generateReading(prompt);
  if (countNumberedSections(firstPass) >= required) return firstPass;

  const retryPrompt = `${prompt}

IMPORTANT: Your previous draft was incomplete. Regenerate the answer from scratch and include ALL numbered sections from 1 to ${required}, with clear section labels and complete sentences.`;
  const secondPass = await generateReading(retryPrompt);
  return secondPass;
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
    const fullResult = await generateCompleteReading(toolId, prompt);
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
    const message = error instanceof Error ? error.message : "Something went wrong, try again ✨";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

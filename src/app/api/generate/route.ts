import { NextRequest, NextResponse } from "next/server";
import { generateReading } from "@/lib/gemini";
import { TOOL_CONFIG } from "@/lib/config";
import { fillPrompt, PROMPTS } from "@/lib/prompts";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSchemaError } from "@/lib/dbSchemaMessage";
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
  const firstParagraph = fullResult.split(/\n\s*\n/)[0]?.trim() || fullResult.trim();
  const sentenceParts = firstParagraph
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentenceParts.slice(0, 2).join(" ").trim();
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
    // #region agent log
    fetch("http://127.0.0.1:7620/ingest/e8d6ca03-4cb5-4c5f-9190-f516be2b233b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fadc4c" },
      body: JSON.stringify({
        sessionId: "fadc4c",
        runId: "pre-fix",
        hypothesisId: "H1",
        location: "src/app/api/generate/route.ts:51",
        message: "Generate request received",
        data: {
          toolId,
          hasSessionId: Boolean(sessionId),
          inputKeys: Object.keys(inputs || {}),
          emptyInputKeys: Object.entries(inputs || {})
            .filter(([, v]) => !(v || "").trim())
            .map(([k]) => k),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.log("[generate] inputs received:", { toolId, sessionId, inputs });

    if (!toolId || !TOOL_CONFIG[toolId] || !sessionId) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const fields = TOOL_CONFIG[toolId].fields;
    for (const field of fields) {
      if (field.required && !(inputs[field.id] || "").trim()) {
        return NextResponse.json({ error: `Missing ${field.label}` }, { status: 400 });
      }
    }

    const prompt = fillPrompt(PROMPTS[toolId], inputs);
    // #region agent log
    fetch("http://127.0.0.1:7620/ingest/e8d6ca03-4cb5-4c5f-9190-f516be2b233b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fadc4c" },
      body: JSON.stringify({
        sessionId: "fadc4c",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "src/app/api/generate/route.ts:68",
        message: "Prompt interpolated",
        data: {
          promptLength: prompt.length,
          includesInputValues: Object.fromEntries(
            Object.entries(inputs || {}).map(([k, v]) => [k, (v || "").trim() ? prompt.includes((v || "").trim()) : true]),
          ),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.log("[generate] prompt sent:", prompt);
    const fullResult = await generateCompleteReading(toolId, prompt);
    // #region agent log
    fetch("http://127.0.0.1:7620/ingest/e8d6ca03-4cb5-4c5f-9190-f516be2b233b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fadc4c" },
      body: JSON.stringify({
        sessionId: "fadc4c",
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "src/app/api/generate/route.ts:70",
        message: "Gemini response received",
        data: {
          responseLength: fullResult.length,
          sectionCount: (fullResult.match(/(?:^|\\n)\\s*\\d+\\./g) || []).length,
          first180: fullResult.slice(0, 180),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.log("[generate] raw gemini response:", fullResult);
    const freePreview = getFreePreview(fullResult);
    const generationId = crypto.randomUUID();

    await supabaseAdmin
      .from("generations")
      .insert({
        id: generationId,
        session_id: sessionId,
        tool_id: toolId,
        full_result: fullResult,
        is_paid: false,
      })
      .throwOnError();

    return NextResponse.json({
      freePreview,
      generationId,
    });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7620/ingest/e8d6ca03-4cb5-4c5f-9190-f516be2b233b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "fadc4c" },
      body: JSON.stringify({
        sessionId: "fadc4c",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "src/app/api/generate/route.ts:catch",
        message: "Generate route error",
        data: { errorMessage: error instanceof Error ? error.message : String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error(error);
    const message = mapSchemaError(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

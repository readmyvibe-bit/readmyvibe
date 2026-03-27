import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { mapSchemaError } from "@/lib/dbSchemaMessage";

export async function GET(req: NextRequest) {
  try {
  if (!supabaseAdmin) {
    return NextResponse.json({ unlocked: false });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const toolId = req.nextUrl.searchParams.get("toolId");

  if (!sessionId || !toolId) {
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }

  const { data: unlock } = await supabaseAdmin
    .from("unlocks")
    .select("payment_id")
    .eq("session_id", sessionId)
    .eq("tool_id", toolId)
    .maybeSingle();

  if (!unlock?.payment_id) {
    return NextResponse.json({ unlocked: false });
  }

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("id,status,generation_id")
    .eq("id", unlock.payment_id)
    .maybeSingle();

  if (payment?.status !== "success") {
    return NextResponse.json({ unlocked: false });
  }

  const generationId = payment?.generation_id;
  if (!generationId) {
    return NextResponse.json({ unlocked: true, generationId: null, fullResult: "" });
  }

  const { data: generation } = await supabaseAdmin
    .from("generations")
    .select("full_result")
    .eq("id", generationId)
    .eq("session_id", sessionId)
    .eq("tool_id", toolId)
    .maybeSingle();

  return NextResponse.json({
    unlocked: true,
    generationId,
    fullResult: generation?.full_result || "",
  });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ unlocked: false, error: mapSchemaError(error) }, { status: 500 });
  }
}

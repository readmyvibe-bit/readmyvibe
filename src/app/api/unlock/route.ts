import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ unlocked: false });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const toolId = req.nextUrl.searchParams.get("toolId");

  if (!sessionId || !toolId) {
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("unlocks")
    .select("id")
    .eq("session_id", sessionId)
    .eq("tool_id", toolId)
    .maybeSingle();

  return NextResponse.json({ unlocked: Boolean(data) });
}

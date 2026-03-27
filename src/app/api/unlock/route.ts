import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!supabaseAdmin) {
    return NextResponse.json({ unlocked: false });
  }

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  const toolId = req.nextUrl.searchParams.get("toolId");
  const validateSessionOnly = req.nextUrl.searchParams.get("validateSessionOnly") === "1";

  if (!sessionId) {
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }

  if (validateSessionOnly) {
    const { data: unlocks } = await supabaseAdmin.from("unlocks").select("payment_id").eq("session_id", sessionId).limit(20);
    const paymentIds = (unlocks || []).map((u) => u.payment_id).filter(Boolean);
    if (!paymentIds.length) return NextResponse.json({ validSession: false });

    const { data: payments } = await supabaseAdmin.from("payments").select("id,status").in("id", paymentIds);
    const validSession = (payments || []).some((p) => p.status === "success");
    return NextResponse.json({ validSession });
  }

  if (!toolId) {
    return NextResponse.json({ unlocked: false }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("unlocks")
    .select("payment_id")
    .eq("session_id", sessionId)
    .eq("tool_id", toolId)
    .maybeSingle();

  if (!data?.payment_id) {
    return NextResponse.json({ unlocked: false });
  }

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select("status")
    .eq("id", data.payment_id)
    .maybeSingle();

  return NextResponse.json({ unlocked: payment?.status === "success" });
}

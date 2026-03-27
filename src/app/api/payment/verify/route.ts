import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";
import { ToolId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      sessionId,
      toolId,
    } = (await req.json()) as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      sessionId: string;
      toolId: ToolId;
    };

    const valid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .update({ razorpay_payment_id, status: "success" })
      .eq("razorpay_order_id", razorpay_order_id)
      .select("id")
      .single();

    if (payment?.id) {
      await supabaseAdmin.from("unlocks").upsert(
        {
          session_id: sessionId,
          tool_id: toolId,
          payment_id: payment.id,
        },
        { onConflict: "session_id,tool_id" },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}

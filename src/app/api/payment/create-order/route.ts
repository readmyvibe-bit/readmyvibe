import { NextRequest, NextResponse } from "next/server";
import { TOOL_CONFIG } from "@/lib/config";
import { getRazorpayClient } from "@/lib/razorpay";
import { supabaseAdmin } from "@/lib/supabase";
import { ToolId } from "@/types";

export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const { toolId, sessionId, generationId } = (await req.json()) as {
      toolId: ToolId;
      sessionId: string;
      generationId: string;
    };
    const tool = TOOL_CONFIG[toolId];
    if (!tool || !sessionId || !generationId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: tool.price,
      currency: "INR",
      receipt: `rvm-${toolId}-${Date.now()}`,
    });

    await supabaseAdmin.from("payments").insert({
      session_id: sessionId,
      tool_id: toolId,
      generation_id: generationId,
      razorpay_order_id: order.id,
      amount: order.amount,
      status: "pending",
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 });
  }
}

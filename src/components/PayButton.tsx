"use client";

import { useState } from "react";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  sessionId: string;
  onPaid: () => Promise<void>;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PayButton({ tool, sessionId, onPaid }: Props) {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    try {
      setLoading(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Unable to load payment gateway");

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, sessionId }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Payment init failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "ReadMyVibe",
        description: tool.name,
        order_id: orderData.orderId,
        theme: { color: "#ec4899" },
        handler: async (response: Record<string, string>) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              sessionId,
              toolId: tool.id,
            }),
          });

          if (!verifyRes.ok) {
            throw new Error("Payment verification failed");
          }
          await onPaid();
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong, try again ✨");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={startPayment}
      disabled={loading}
      className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
    >
      {loading ? "Opening payment..." : `Unlock Full Reading - Rs ${tool.price / 100} only`}
    </button>
  );
}

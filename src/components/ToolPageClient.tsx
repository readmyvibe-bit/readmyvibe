"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import LegalLinks from "@/components/LegalLinks";
import ResultCard from "@/components/ResultCard";
import ShareCard from "@/components/ShareCard";
import { getSessionId, resetSessionId } from "@/lib/session";
import { ToolConfig } from "@/types";

type Props = { tool: ToolConfig };
const LOADING_STEPS = [
  "✨ Payment received! Generating your reading...",
  "🔮 AI is reading the vibes...",
  "😂 Crafting your personalised roast...",
  "🎨 Almost ready...",
  "💫 Putting the final touches...",
];

export default function ToolPageClient({ tool }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [generationId, setGenerationId] = useState("");
  const [freePreview, setFreePreview] = useState("");
  const [fullResult, setFullResult] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [unlockChecked, setUnlockChecked] = useState(false);
  const [postPaymentLoading, setPostPaymentLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    let mounted = true;
    const setupSession = async () => {
      let sid = getSessionId();
      if (!mounted) return;
      setSessionId(sid);
      try {
        const unlockRes = await fetch(`/api/unlock?sessionId=${encodeURIComponent(sid)}&toolId=${tool.id}`);
        const unlockData = await unlockRes.json();
        if (unlockData?.unlocked) {
          setIsPaid(true);
          setFullResult(unlockData.fullResult || "");
          setGenerationId(unlockData.generationId || "");
          setUnlockChecked(true);
          return;
        }

        const checkedFlag = localStorage.getItem("readmyvibe_session_checked_v3");
        if (!checkedFlag) {
          sid = resetSessionId();
          if (mounted) setSessionId(sid);
          localStorage.setItem("readmyvibe_session_checked_v3", "1");
        }
      } catch {
        // keep existing session if validation endpoint fails
      }
      if (mounted) setUnlockChecked(true);
    };
    void setupSession();
    return () => {
      mounted = false;
    };
  }, [tool.id]);

  useEffect(() => {
    if (!postPaymentLoading || fullResult) return;
    const started = Date.now();
    const stepTimer = window.setInterval(() => {
      setLoadingStepIndex((idx) => (idx + 1) % LOADING_STEPS.length);
    }, 2000);
    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - started;
      const pct = Math.min(95, Math.floor((elapsed / 10000) * 95));
      setLoadingProgress(pct);
    }, 200);
    return () => {
      window.clearInterval(stepTimer);
      window.clearInterval(progressTimer);
    };
  }, [postPaymentLoading, fullResult]);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      alert("Unable to start session. Please refresh and try again.");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          inputs: values,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setFreePreview(data.freePreview);
      setGenerationId(data.generationId || "");
      setFullResult("");
      setIsPaid(false);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Something went wrong, try again ✨";
      alert(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePayment = async () => {
    if (!sessionId || !generationId) {
      alert("Please generate your reading first.");
      return;
    }
    try {
      setIsPaying(true);
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Unable to load payment gateway");

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, sessionId, generationId }),
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
        theme: { color: "#00a890" },
        handler: async (response: Record<string, string>) => {
          try {
            setPostPaymentLoading(true);
            setLoadingStepIndex(0);
            setLoadingProgress(0);
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                sessionId,
                toolId: tool.id,
                generationId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
            setFullResult(verifyData.fullResult || "");
            setIsPaid(true);
            setLoadingProgress(100);
          } catch (error) {
            console.error(error);
            const message = error instanceof Error ? error.message : "Payment verification failed";
            alert(message);
          } finally {
            setPostPaymentLoading(false);
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Payment failed, please try again.";
      alert(message);
    } finally {
      setIsPaying(false);
    }
  };

  const shareNameLine = (() => {
    if (tool.id === "friendship-roast") {
      const one = values.your_name?.trim() || "";
      const two = values.friend_name?.trim() || "";
      return [one, two].filter(Boolean).join(" & ") || "Friendship Duo";
    }
    if (tool.id === "crush-compatibility") {
      const one = values.your_name?.trim() || "";
      const two = values.crush_name?.trim() || "";
      return [one, two].filter(Boolean).join(" & ") || "Compatibility Pair";
    }
    return (values.your_name || values.name || tool.name).trim();
  })();
  const shareKeyLine = (fullResult || freePreview || "Your reading is ready to share.").split("\n").filter(Boolean)[0];

  return (
    <div className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <Link href="/" className="inline-block text-base font-semibold text-[#007a70]">
          ← Back
        </Link>
        <header className="rvm-card rounded-2xl p-4">
          <h1 className="text-2xl font-bold text-[#0a3030]">
            {tool.emoji} {tool.name}
          </h1>
          <p className="mt-1 text-base text-[#5a9090]">{tool.description}</p>
        </header>

        <form onSubmit={generate} className="rvm-card space-y-3 rounded-2xl p-4">
          {tool.fields.map((field) => (
            <label key={field.id} className="block">
              <span className="mb-1 block text-base font-semibold text-[#6aabab]">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-[#c0e8e0] px-3 py-2 text-base text-[#0a3030] outline-none focus:border-[#00c0a8]"
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                  className="w-full rounded-xl border border-[#c0e8e0] px-3 py-2 text-base text-[#0a3030] outline-none focus:border-[#00c0a8]"
                >
                  <option value="">Select...</option>
                  {field.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : field.type === "radio" ? (
                <div className="grid grid-cols-1 gap-2">
                  {field.options?.map((option) => (
                    <label key={option} className="flex items-center gap-2 rounded-xl border border-[#c0e8e0] p-2">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={(values[field.id] || "") === option}
                        onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                      />
                      <span className="text-base text-[#0a3030]">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-[#c0e8e0] px-3 py-2 text-base text-[#0a3030] outline-none focus:border-[#00c0a8]"
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            disabled={isGenerating}
            className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-50"
          >
            {isGenerating ? "Reading your vibe..." : "Generate My Reading ✨"}
          </button>
        </form>

        {unlockChecked && (freePreview || fullResult) ? (
          <div className="space-y-3">
            <ResultCard freePreview={freePreview} fullResult={fullResult || null} unlocked={isPaid} />
            {!isPaid ? (
              <>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-50"
                >
                  {isPaying ? "Opening payment..." : `Unlock Full Reading - Rs ${tool.price / 100}`}
                </button>
                {!generationId ? (
                  <p className="text-center text-xs text-[#6aabab]">Tap Generate once, then unlock.</p>
                ) : null}
              </>
            ) : null}
            {isPaid && fullResult ? (
              <ShareCard tool={tool} nameLine={shareNameLine} resultText={fullResult || shareKeyLine} />
            ) : null}
            <Link
              href="/"
              className="rvm-primary-button block w-full rounded-xl px-4 py-3 text-center text-base font-semibold"
            >
              Try Another Tool
            </Link>
          </div>
        ) : null}

        <div className="pb-6 text-center">
          <LegalLinks />
        </div>
      </div>

      {postPaymentLoading && !fullResult ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0fafa]/95 backdrop-blur-sm">
          <div className="rvm-card w-[92%] max-w-sm rounded-2xl p-5 text-center">
            <div className="rvm-brand-gradient text-2xl font-extrabold">ReadMyVibe</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#e8faf6]">
              <div className="h-full rounded-full bg-gradient-to-r from-[#00c8a0] to-[#00a8d0]" style={{ width: `${loadingProgress}%` }} />
            </div>
            <p className="mt-4 text-base font-semibold text-[#0a3030]">{LOADING_STEPS[loadingStepIndex]}</p>
            <div className="mt-4 h-20 w-20 animate-pulse rounded-full bg-[#00c8a026]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

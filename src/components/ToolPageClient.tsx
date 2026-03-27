"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import LegalLinks from "@/components/LegalLinks";
import ResultCard from "@/components/ResultCard";
import ShareCard from "@/components/ShareCard";
import { getSessionId, resetSessionId } from "@/lib/session";
import { ToolConfig, ToolId } from "@/types";

type Props = { tool: ToolConfig };

const DEFAULT_LOADING_STEPS = [
  "✨ Payment received! Generating your reading...",
  "🔮 AI is reading the vibes...",
  "🎨 Almost ready...",
  "💫 Putting the final touches...",
];

const TOOL_LOADING_STEPS: Partial<Record<ToolId, string[]>> = {
  "friendship-roast": [
    "✨ Payment received!",
    "😂 Roasting your friendship...",
    "🔥 Finding the funniest moments...",
    "💀 This one is going to hurt (lovingly)...",
    "💫 Putting the final touches...",
  ],
  "crush-compatibility": [
    "✨ Payment received!",
    "💘 Reading the romantic energy...",
    "🔍 Calculating your compatibility...",
    "✨ Finding the perfect message to send...",
    "💫 Almost ready...",
  ],
  "decode-message": [
    "✨ Payment received!",
    "🔍 Analysing every word they sent...",
    "💭 Reading between the lines...",
    "💬 Crafting your perfect reply...",
    "💫 Almost ready...",
  ],
  "profile-personality": [
    "✨ Payment received!",
    "🔮 Reading your profile energy...",
    "🧠 Uncovering your hidden traits...",
    "✨ Discovering your Instagram superpower...",
    "💫 Putting the final touches...",
  ],
  "facebook-prediction": [
    "✨ Payment received!",
    "🔮 Channelling your 2026 energy...",
    "💫 Reading your love and career path...",
    "🎯 Spotting the surprise of your year...",
    "✨ Almost ready...",
  ],
  "profile-impression": [
    "✨ Payment received!",
    "🕵️ Analysing first impressions...",
    "📊 Calculating your trust score...",
    "👀 Finding what you unknowingly communicate...",
    "💫 Almost ready...",
  ],
  "instagram-type": [
    "✨ Payment received!",
    "🧬 Analysing your Instagram DNA...",
    "🎭 Finding your personality type...",
    "⭐ Matching your celebrity energy...",
    "💫 Almost ready...",
  ],
};

function toTitleCase(str: string): string {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

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
  const [error, setError] = useState("");

  const loadingSteps = TOOL_LOADING_STEPS[tool.id] || DEFAULT_LOADING_STEPS;
  const clearError = () => {
    if (error) setError("");
  };

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
        if (unlockRes.ok && unlockData?.unlocked === true && unlockData.fullResult) {
          console.log("[unlock-check] Restoring paid session, fullResult length:", unlockData.fullResult.length);
          setIsPaid(true);
          setFullResult(unlockData.fullResult);
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
      setLoadingStepIndex((idx) => (idx + 1) % loadingSteps.length);
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
    clearError();
    if (!sessionId) {
      setError("Unable to start session. Please refresh and try again.");
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
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Something went wrong, try again ✨";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePayment = async () => {
    clearError();
    if (!sessionId || !generationId) {
      setError("Please generate your reading first.");
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
            if (!verifyData.success || !verifyData.fullResult) {
              throw new Error("Payment verified but reading not found. Please contact support.");
            }
            console.log("[payment-verify] Setting isPaid=true, fullResult length:", verifyData.fullResult.length);
            setFullResult(verifyData.fullResult);
            setIsPaid(true);
            setLoadingProgress(100);
          } catch (err) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Payment verification failed";
            setError(message);
          } finally {
            setPostPaymentLoading(false);
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Payment failed, please try again.";
      setError(message);
    } finally {
      setIsPaying(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    clearError();
    setValues((s) => ({ ...s, [fieldId]: value }));
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
    if (tool.id === "instagram-type" && fullResult) {
      const match = fullResult.match(/YOUR INSTAGRAM TYPE[:\s]*(.+)/i);
      if (match?.[1]) {
        let name = match[1].replace(/\*+/g, "").replace(/\n.*/, "").trim();
        if (name.length > 30) name = name.slice(0, 30);
        if (/^[A-Z\s,]+$/.test(name)) name = toTitleCase(name);
        return name || "Your Instagram Type";
      }
      return "Your Instagram Type";
    }
    if ((tool.id === "profile-personality" || tool.id === "profile-impression") && values.username) {
      return values.username.trim();
    }
    return (values.your_name || values.name || "Your Vibe").trim();
  })();

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
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-[#c0e8e0] px-3 py-2 text-base text-[#0a3030] outline-none focus:border-[#00c0a8]"
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-[#c0e8e0] px-3 py-2 text-base text-[#0a3030] outline-none focus:border-[#00c0a8]"
                />
              )}
            </label>
          ))}

          {error ? (
            <div className="rvm-error-box rounded-xl p-3 text-sm font-semibold">⚠️ {error}</div>
          ) : null}

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
              <ShareCard tool={tool} nameLine={shareNameLine} resultText={fullResult} />
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
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00c8a0] to-[#00a8d0]"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-4 text-base font-semibold text-[#0a3030]">{loadingSteps[loadingStepIndex]}</p>
            <div className="mt-4 h-20 w-20 animate-pulse rounded-full bg-[#00c8a026]" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

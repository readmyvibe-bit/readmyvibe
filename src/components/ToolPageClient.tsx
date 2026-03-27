"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import LegalLinks from "@/components/LegalLinks";
import PayButton from "@/components/PayButton";
import ResultCard from "@/components/ResultCard";
import ShareCard from "@/components/ShareCard";
import { getSessionId } from "@/lib/session";
import { ToolConfig } from "@/types";

type Props = { tool: ToolConfig };

export default function ToolPageClient({ tool }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [freePreview, setFreePreview] = useState("");
  const [fullResult, setFullResult] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const sessionId = useMemo(() => getSessionId(), []);

  const generate = async (e: FormEvent) => {
    e.preventDefault();
    if (!sessionId) {
      alert("Unable to start session. Please refresh and try again.");
      return;
    }
    setLoading(true);
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
      setFullResult(data.fullResult);
      setUnlocked(data.unlocked);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Something went wrong, try again ✨";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnlockedResult = async () => {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolId: tool.id, inputs: values, sessionId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to refresh result");
    setFreePreview(data.freePreview);
    setFullResult(data.fullResult);
    setUnlocked(true);
  };

  const shareNameLine = (values.your_name || values.name || tool.name).trim();
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
            disabled={loading}
            className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-50"
          >
            {loading ? "Reading your vibe..." : "Generate My Reading ✨"}
          </button>
        </form>

        {freePreview ? (
          <div className="space-y-3">
            <ResultCard freePreview={freePreview} fullResult={fullResult} unlocked={unlocked} />
            {unlocked ? (
              <p className="rvm-payment-badge rounded-xl px-3 py-2 text-center text-sm font-semibold">
                This tool is already unlocked on this device.
              </p>
            ) : null}
            {!unlocked ? <PayButton tool={tool} sessionId={sessionId} onPaid={refreshUnlockedResult} /> : null}
            {unlocked && fullResult ? (
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
    </div>
  );
}

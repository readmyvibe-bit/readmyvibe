"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 px-4 py-5">
      <div className="mx-auto max-w-md space-y-4">
        <Link href="/" className="inline-block text-base font-semibold text-pink-600">
          ← Back
        </Link>
        <header>
          <h1 className="text-2xl font-bold text-gray-900">
            {tool.emoji} {tool.name}
          </h1>
          <p className="mt-1 text-base text-gray-600">{tool.description}</p>
        </header>

        <form onSubmit={generate} className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-pink-100">
          {tool.fields.map((field) => (
            <label key={field.id} className="block">
              <span className="mb-1 block text-base font-semibold text-gray-800">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-base outline-none focus:border-pink-400"
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={values[field.id] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-base outline-none focus:border-pink-400"
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
                    <label key={option} className="flex items-center gap-2 rounded-xl border border-pink-200 p-2">
                      <input
                        type="radio"
                        name={field.id}
                        value={option}
                        checked={(values[field.id] || "") === option}
                        onChange={(e) => setValues((s) => ({ ...s, [field.id]: e.target.value }))}
                      />
                      <span className="text-base text-gray-700">{option}</span>
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
                  className="w-full rounded-xl border border-pink-200 px-3 py-2 text-base outline-none focus:border-pink-400"
                />
              )}
            </label>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-base font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Reading your vibe..." : "Generate My Reading ✨"}
          </button>
        </form>

        {freePreview ? (
          <div className="space-y-3">
            <ResultCard freePreview={freePreview} fullResult={fullResult} unlocked={unlocked} />
            {!unlocked ? <PayButton tool={tool} sessionId={sessionId} onPaid={refreshUnlockedResult} /> : null}
            {unlocked && fullResult ? (
              <ShareCard tool={tool} nameLine={(values.name || values.your_name || "").trim()} keyLine={freePreview.split("\n")[0]} />
            ) : null}
            <Link
              href="/"
              className="block w-full rounded-xl bg-gray-900 px-4 py-3 text-center text-base font-semibold text-white"
            >
              Try Another Tool
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  resultText: string;
};

type CardStyle = "aurora" | "minimal" | "bold";
const STYLE_LABELS: Record<CardStyle, string> = {
  aurora: "Aurora",
  minimal: "Minimal White",
  bold: "Bold Type",
};

function extractBestQuote(text: string) {
  const clean = text
    .replace(/\*\*/g, "")
    .replace(/##/g, "")
    .replace(/\n\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const sentences = clean.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
  const candidates = sentences.slice(2);
  const funnyKeywords = [
    "never",
    "always",
    "only",
    "literally",
    "somehow",
    "zero",
    "single",
    "every time",
    "refuses",
    "absolutely",
    "officially",
  ];
  const best =
    candidates.find((s) => funnyKeywords.some((k) => s.toLowerCase().includes(k))) ||
    candidates[0] ||
    sentences[0] ||
    "Find your vibe";
  return best.length > 100 ? `${best.slice(0, 100)}...` : best;
}

function toolTypeLabel(toolName: string) {
  return toolName.replace("What ", "").replace("Your ", "").slice(0, 38);
}

function CardPreview({
  style,
  selected,
  onSelect,
  emoji,
  nameText,
  typeLabel,
  quote,
}: {
  style: CardStyle;
  selected: boolean;
  onSelect: () => void;
  emoji: string;
  nameText: string;
  typeLabel: string;
  quote: string;
}) {
  const base =
    "relative aspect-square rounded-[28px] overflow-hidden border transition-all duration-200 cursor-pointer font-[var(--font-plus-jakarta)]";

  if (style === "aurora") {
    return (
      <button type="button" onClick={onSelect} className={`${base} ${selected ? "ring-2 ring-[#00a890]" : ""} border-[#0a4c4c] bg-[#0b2f34] p-5 text-left text-white`}>
        <div className="absolute left-[-20%] top-[-18%] h-56 w-56 rounded-full bg-[#00c8a033] blur-2xl" />
        <div className="absolute right-[-14%] top-[8%] h-52 w-52 rounded-full bg-[#00a8d044] blur-2xl" />
        <div className="relative z-10 flex h-full flex-col">
          <p className="text-xl font-extrabold">ReadMyVibe {emoji}</p>
          <p className="mt-6 text-4xl font-black leading-tight">{nameText}</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/80">{typeLabel}</p>
          <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug text-white/90">&ldquo;{quote}&rdquo;</p>
          <div className="mt-auto flex items-center justify-between text-sm font-bold text-white/95">
            <span>readmyvibe.in</span>
            <span className="rounded-full bg-white/16 px-3 py-1">Find your vibe ✨</span>
          </div>
        </div>
      </button>
    );
  }

  if (style === "minimal") {
    return (
      <button type="button" onClick={onSelect} className={`${base} ${selected ? "ring-2 ring-[#00a890]" : ""} border-[#d0eee8] bg-white text-left text-[#0a3030]`}>
        <div className="bg-gradient-to-r from-[#00a890] to-[#0085b8] p-4 text-white">
          <p className="text-lg font-extrabold">ReadMyVibe {emoji}</p>
        </div>
        <div className="flex h-[calc(100%-64px)] flex-col p-5">
          <p className="text-4xl font-black leading-tight">{nameText}</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#6aabab]">{typeLabel}</p>
          <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug text-[#0a3030]">&ldquo;{quote}&rdquo;</p>
          <div className="mt-auto flex items-center justify-between text-sm font-bold">
            <span>readmyvibe.in</span>
            <span className="rounded-full bg-[#e8faf6] px-3 py-1 text-[#007a70]">Find your vibe ✨</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button type="button" onClick={onSelect} className={`${base} ${selected ? "ring-2 ring-[#00a890]" : ""} border-[#d0eee8] bg-white pl-[6px] text-left text-[#0a3030]`}>
      <div className="h-full rounded-r-[22px] bg-white p-5">
        <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-b from-[#00a890] to-[#00a8d0]" />
        <p className="text-xl font-extrabold rvm-brand-gradient">ReadMyVibe {emoji}</p>
        <p className="mt-6 text-4xl font-black leading-tight">{nameText}</p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#6aabab]">{typeLabel}</p>
        <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug">&ldquo;{quote}&rdquo;</p>
        <div className="mt-8 flex items-center justify-between text-sm font-bold">
          <span>readmyvibe.in</span>
          <span className="rounded-full bg-[#e8faf6] px-3 py-1 text-[#007a70]">Find your vibe ✨</span>
        </div>
      </div>
    </button>
  );
}

export default function ShareCard({ tool, nameLine, resultText }: Props) {
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>("aurora");
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [caption, setCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const timerRef = useRef<number | null>(null);

  const quote = useMemo(() => extractBestQuote(resultText), [resultText]);
  const nameText = useMemo(() => (nameLine || "Your Vibe").trim(), [nameLine]);
  const typeLabel = useMemo(() => toolTypeLabel(tool.name), [tool.name]);

  const buildShareLink = (text: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text}\nhttps://www.readmyvibe.in`)}`;

  const generateCaption = async (quoteText: string) => {
    try {
      setIsCaptionLoading(true);
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullResult: resultText, quote: quoteText, toolName: tool.name }),
      });
      const data = await res.json();
      if (res.ok && data.caption) {
        setCaption(data.caption);
      } else {
        setCaption(
          `POV: AI just decoded my vibe and it is painfully accurate 😭😂\n\n"${quoteText}"\n\nTry yours at readmyvibe.in 👆\n#ReadMyVibe #VibeCheck #InstagramIndia #AIReading #ForYou`,
        );
      }
    } catch {
      setCaption(
        `POV: AI just decoded my vibe and it is painfully accurate 😭😂\n\n"${quoteText}"\n\nTry yours at readmyvibe.in 👆\n#ReadMyVibe #VibeCheck #InstagramIndia #AIReading #ForYou`,
      );
    } finally {
      setIsCaptionLoading(false);
    }
  };

  const onDownloadPng = async () => {
    try {
      setIsGenerating(true);
      const res = await fetch("/api/generate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style: selectedStyle,
          emoji: tool.emoji,
          nameText,
          typeLabel,
          quote,
        }),
      });
      if (!res.ok) throw new Error("Card generation failed");
      const blob = await res.blob();
      const dataUrl = URL.createObjectURL(blob);
      setImageUrl(dataUrl);
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `readmyvibe-${tool.id}-${selectedStyle}.png`;
      anchor.click();
      setDownloaded(true);
      await generateCaption(quote);
    } catch (error) {
      console.error(error);
      alert("Unable to generate card right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = async () => {
    const text = caption || `Try yours at readmyvibe.in 👆`;
    await navigator.clipboard.writeText(text);
    setCopiedCaption(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopiedCaption(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText("https://www.readmyvibe.in");
    setCopiedLink(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleInstagramShare = async () => {
    if (!imageUrl) return;
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "readmyvibe.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ReadMyVibe",
          text: caption || "Try yours at readmyvibe.in 👆",
        });
      } else {
        await navigator.clipboard.writeText(caption || "Try yours at readmyvibe.in 👆");
        const anchor = document.createElement("a");
        anchor.href = imageUrl;
        anchor.download = `readmyvibe-${tool.id}-${selectedStyle}.png`;
        anchor.click();
        alert("Caption copied! Image downloaded. Open Instagram and paste caption.");
      }
    } catch (error) {
      console.error(error);
      alert("Instagram sharing failed. Try Download PNG and upload manually.");
    }
  };

  return (
    <section className="rvm-card space-y-3 rounded-2xl p-4">
      <h3 className="text-base font-bold text-[#0a3030]">Share your reading</h3>
      <p className="text-sm text-[#5a9090]">Pick a style, then download as PNG.</p>

      <div className="grid grid-cols-1 gap-3">
        {(["aurora", "minimal", "bold"] as CardStyle[]).map((style) => (
          <div key={style} className="space-y-1">
            <p className="text-xs font-semibold text-[#6aabab]">{STYLE_LABELS[style]}</p>
            <CardPreview
              style={style}
              selected={selectedStyle === style}
              onSelect={() => setSelectedStyle(style)}
              emoji={tool.emoji}
              nameText={nameText}
              typeLabel={typeLabel}
              quote={quote}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onDownloadPng}
        disabled={isGenerating}
        className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-60"
      >
        {isGenerating ? "Generating..." : "Download PNG"}
      </button>

      {downloaded ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button type="button" onClick={onDownloadPng} className="rvm-primary-button rounded-xl px-4 py-3 text-sm font-semibold text-white">
            ⬇ Download PNG
          </button>
          <button type="button" onClick={handleInstagramShare} className="rounded-xl bg-[#0085b8] px-4 py-3 text-sm font-semibold text-white">
            📱 Share to Instagram
          </button>
          <a href={buildShareLink(caption || quote)} target="_blank" rel="noreferrer" className="rounded-xl bg-[#0bbf8f] px-4 py-3 text-center text-sm font-semibold text-white">
            💬 WhatsApp
          </a>
        </div>
      ) : null}

      {imageUrl ? (
        <div className="rounded-2xl border border-[#d0eee8] bg-white p-2">
          <Image
            src={imageUrl}
            alt="Generated share card"
            width={1080}
            height={1080}
            unoptimized
            className="h-auto w-full rounded-2xl"
          />
        </div>
      ) : null}

      {downloaded ? (
        <div className="rounded-2xl border border-[#d0eee8] bg-white p-3">
          <p className="mb-2 text-sm font-bold text-[#0a3030]">📋 Instagram Caption — tap to copy</p>
          <div className="rounded-xl bg-[#f0fafa] p-3 text-sm text-[#0a3030]">
            {isCaptionLoading ? "Generating caption..." : caption || "Caption will appear here."}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button type="button" onClick={copyCaption} className="rounded-xl border border-[#c0e8e0] bg-[#e8faf6] px-3 py-2 text-sm font-semibold text-[#007a70]">
              {copiedCaption ? "Copied ✅" : "Copy Caption"}
            </button>
            <button type="button" onClick={copyLink} className="rounded-xl border border-[#c0e8e0] bg-white px-3 py-2 text-sm font-semibold text-[#007a70]">
              {copiedLink ? "Copied ✅" : "Copy Link"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

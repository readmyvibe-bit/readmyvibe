"use client";

import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  resultText: string;
};

type CardStyle = "aurora" | "minimal" | "bold";

function extractBestQuote(text: string) {
  const clean = text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  const sentenceCandidates = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24 && !/^\d+\./.test(s));
  return (sentenceCandidates[0] || clean || "Find your vibe.").slice(0, 180);
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
          <p className="mt-5 text-lg font-semibold leading-snug text-white/90">&ldquo;{quote}&rdquo;</p>
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
          <p className="mt-5 text-lg font-semibold leading-snug text-[#0a3030]">&ldquo;{quote}&rdquo;</p>
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
        <p className="mt-5 text-lg font-semibold leading-snug">&ldquo;{quote}&rdquo;</p>
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
  const captureRef = useRef<HTMLDivElement>(null);

  const quote = useMemo(() => extractBestQuote(resultText), [resultText]);
  const nameText = useMemo(() => (nameLine || "Your Vibe").trim(), [nameLine]);
  const typeLabel = useMemo(() => toolTypeLabel(tool.name), [tool.name]);

  const buildShareLink = () =>
    `https://wa.me/?text=${encodeURIComponent("Check my ReadMyVibe result https://www.readmyvibe.in")}`;

  const onDownloadPng = async () => {
    if (!captureRef.current) return;
    try {
      setIsGenerating(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      setImageUrl(dataUrl);
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = `readmyvibe-${tool.id}-${selectedStyle}.png`;
      anchor.click();
      setDownloaded(true);
    } catch (error) {
      console.error(error);
      alert("Unable to generate card right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rvm-card space-y-3 rounded-2xl p-4">
      <h3 className="text-base font-bold text-[#0a3030]">Share your reading</h3>
      <p className="text-sm text-[#5a9090]">Pick a style, then download as PNG.</p>

      <div className="grid grid-cols-1 gap-3">
        <CardPreview
          style="aurora"
          selected={selectedStyle === "aurora"}
          onSelect={() => setSelectedStyle("aurora")}
          emoji={tool.emoji}
          nameText={nameText}
          typeLabel={typeLabel}
          quote={quote}
        />
        <CardPreview
          style="minimal"
          selected={selectedStyle === "minimal"}
          onSelect={() => setSelectedStyle("minimal")}
          emoji={tool.emoji}
          nameText={nameText}
          typeLabel={typeLabel}
          quote={quote}
        />
        <CardPreview
          style="bold"
          selected={selectedStyle === "bold"}
          onSelect={() => setSelectedStyle("bold")}
          emoji={tool.emoji}
          nameText={nameText}
          typeLabel={typeLabel}
          quote={quote}
        />
      </div>

      <div ref={captureRef} className="fixed -left-[9999px] top-0 w-[1080px]">
        <div className="w-[1080px]">
          <CardPreview
            style={selectedStyle}
            selected={false}
            onSelect={() => undefined}
            emoji={tool.emoji}
            nameText={nameText}
            typeLabel={typeLabel}
            quote={quote}
          />
        </div>
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
        <a
          href={buildShareLink()}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-xl bg-[#0bbf8f] px-4 py-3 text-center text-base font-semibold text-white"
        >
          Share to WhatsApp
        </a>
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
    </section>
  );
}

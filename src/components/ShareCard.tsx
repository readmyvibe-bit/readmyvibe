"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ToolConfig, ToolId } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  resultText: string;
};

type CardStyle = "aurora" | "minimal" | "bold";

const STYLE_LABELS: Record<CardStyle, string> = {
  aurora: "Aurora",
  minimal: "Minimal",
  bold: "Bold",
};

const TOOL_TYPE_LABELS: Record<ToolId, string> = {
  "profile-personality": "Personality Reading",
  "crush-compatibility": "Compatibility Reading",
  "facebook-prediction": "2026 Prediction",
  "profile-impression": "First Impression",
  "decode-message": "Message Decoded",
  "friendship-roast": "Friendship Roast",
  "instagram-type": "Instagram Type",
};

/* ─── Quote extraction ─── */

function endsCleanly(s: string): boolean {
  const t = s.trim();
  return t.endsWith(".") || t.endsWith("!") || t.endsWith("?");
}

function extractBestQuote(text: string): string {
  const clean = text
    .replace(/\*\*/g, "")
    .replace(/##/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30)
    .filter((s) => !s.includes("http"))
    .filter((s) => !s.toLowerCase().includes("unlock"))
    .filter((s) => !s.toLowerCase().includes("readmyvibe"))
    .filter(endsCleanly);

  const skipFirst = sentences.slice(2);

  const priority = [
    "superpower", "magic", "effortlessly", "radiates",
    "inspires", "craft", "power", "soul", "vibrant",
    "stunning", "never", "always", "literally", "somehow",
    "secretly", "refuses", "every time",
  ];

  // Prefer exclamation sentences first (under 100 chars)
  const exclamation = skipFirst.find((s) => s.includes("!") && s.length <= 100);
  if (exclamation) return exclamation;

  // Then find keyword matches under 100 chars
  const keyword = skipFirst.find(
    (s) => priority.some((k) => s.toLowerCase().includes(k)) && s.length <= 100,
  );
  if (keyword) return keyword;

  // Fallback to first complete sentence under 100 chars
  const fallback = skipFirst.find((s) => s.length <= 100);
  if (fallback) return fallback;

  // Last resort from all sentences
  const any = sentences.find((s) => s.length <= 100);
  return any || sentences[0]?.slice(0, 97) + "..." || "Find your vibe";
}

/* ─── Canvas drawing ─── */

const FONT_URL =
  "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIbaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSg.woff2";
const CARD_FONT = "PlusJakartaCard";

async function loadCardFont(): Promise<void> {
  if (typeof document === "undefined") return;
  if (document.fonts.check(`bold 20px ${CARD_FONT}`)) return;
  try {
    const font = new FontFace(CARD_FONT, `url(${FONT_URL})`);
    await font.load();
    document.fonts.add(font);
  } catch {
    // Falls back to Arial
  }
}

function ff(weight: string, size: number): string {
  return `${weight} ${size}px ${CARD_FONT}, Arial, sans-serif`;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 99,
): number {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  let cy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " ";
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      lineCount++;
      if (lineCount >= maxLines) {
        ctx.fillText(line.trim() + "...", x, cy);
        return cy + lineHeight;
      }
      ctx.fillText(line.trim(), x, cy);
      line = words[i] + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trim(), x, cy);
    cy += lineHeight;
  }
  return cy;
}

type CardData = { emoji: string; name: string; typeLabel: string; quote: string };

function drawAurora(ctx: CanvasRenderingContext2D, d: CardData) {
  ctx.fillStyle = "#0b2f34";
  ctx.fillRect(0, 0, 1080, 1080);
  const g1 = ctx.createRadialGradient(170, 130, 0, 170, 130, 280);
  g1.addColorStop(0, "rgba(0,200,160,0.25)");
  g1.addColorStop(1, "transparent");
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, 1080, 1080);
  const g2 = ctx.createRadialGradient(930, 220, 0, 930, 220, 300);
  g2.addColorStop(0, "rgba(0,168,208,0.22)");
  g2.addColorStop(1, "transparent");
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.textAlign = "left";
  ctx.font = ff("800", 36);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("ReadMyVibe", 60, 80);
  ctx.font = "64px Arial, sans-serif";
  ctx.fillText(d.emoji, 960, 90);

  ctx.font = ff("800", 72);
  ctx.fillStyle = "#ffffff";
  wrapText(ctx, d.name.slice(0, 28), 60, 340, 960, 88, 2);

  ctx.font = ff("700", 32);
  ctx.fillStyle = "rgba(0,200,180,0.8)";
  ctx.fillText(d.typeLabel.toUpperCase(), 60, 530);

  ctx.font = ff("600", 38);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  wrapText(ctx, "\u201C" + d.quote + "\u201D", 60, 620, 960, 52, 4);

  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, 940);
  ctx.lineTo(1020, 940);
  ctx.stroke();

  ctx.font = ff("800", 28);
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "left";
  ctx.fillText("readmyvibe.in", 60, 1000);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText("Find your vibe \u2728", 1020, 1000);
  ctx.textAlign = "left";
}

function drawMinimal(ctx: CanvasRenderingContext2D, d: CardData) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 1080, 1080);
  const hg = ctx.createLinearGradient(0, 0, 1080, 0);
  hg.addColorStop(0, "#00a890");
  hg.addColorStop(1, "#0085b8");
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, 1080, 320);

  ctx.textAlign = "left";
  ctx.font = ff("800", 36);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText("ReadMyVibe", 60, 80);
  ctx.font = "64px Arial, sans-serif";
  ctx.fillText(d.emoji, 960, 90);

  ctx.font = ff("800", 72);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(d.name.slice(0, 22), 60, 200);

  ctx.font = ff("700", 28);
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(d.typeLabel.toUpperCase(), 60, 270);

  ctx.font = ff("700", 28);
  ctx.fillStyle = "#5aabab";
  ctx.fillText("YOUR READING", 60, 400);

  ctx.font = ff("600", 40);
  ctx.fillStyle = "#0a3030";
  wrapText(ctx, "\u201C" + d.quote + "\u201D", 60, 470, 960, 56, 4);

  ctx.font = ff("800", 28);
  ctx.fillStyle = "#6aabab";
  ctx.textAlign = "left";
  ctx.fillText("readmyvibe.in", 60, 1020);
  ctx.textAlign = "right";
  ctx.fillStyle = "#007a70";
  ctx.fillText("Find yours \u2728", 1020, 1020);
  ctx.textAlign = "left";
}

function drawBold(ctx: CanvasRenderingContext2D, d: CardData) {
  ctx.fillStyle = "#f8fffe";
  ctx.fillRect(0, 0, 1080, 1080);
  const sg = ctx.createLinearGradient(0, 0, 0, 1080);
  sg.addColorStop(0, "#00e5cc");
  sg.addColorStop(1, "#0085b8");
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, 12, 1080);

  ctx.textAlign = "left";
  ctx.font = ff("800", 30);
  ctx.fillStyle = "#a0d0c8";
  ctx.fillText("READMYVIBE", 80, 80);

  ctx.font = "80px Arial, sans-serif";
  ctx.fillText(d.emoji, 80, 280);

  ctx.font = ff("700", 28);
  ctx.fillStyle = "#5a9090";
  ctx.fillText("READING FOR", 80, 360);

  ctx.font = ff("800", 86);
  ctx.fillStyle = "#003838";
  ctx.fillText(d.name.slice(0, 16), 80, 470);

  const dg = ctx.createLinearGradient(80, 0, 280, 0);
  dg.addColorStop(0, "#00e5cc");
  dg.addColorStop(1, "#0085b8");
  ctx.fillStyle = dg;
  ctx.fillRect(80, 510, 160, 8);

  ctx.font = ff("600", 38);
  ctx.fillStyle = "#2a6060";
  wrapText(ctx, "\u201C" + d.quote + "\u201D", 80, 590, 920, 54, 4);

  ctx.font = ff("800", 28);
  ctx.fillStyle = "#8ac0b8";
  ctx.textAlign = "left";
  ctx.fillText("readmyvibe.in", 80, 1020);
  ctx.textAlign = "right";
  ctx.fillStyle = "#5a9090";
  ctx.fillText("Get your reading \u2728", 1000, 1020);
  ctx.textAlign = "left";
}

async function drawCardToCanvas(style: CardStyle, data: CardData): Promise<Blob> {
  await loadCardFont();
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;

  if (style === "aurora") drawAurora(ctx, data);
  else if (style === "minimal") drawMinimal(ctx, data);
  else drawBold(ctx, data);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/png",
      1.0,
    );
  });
}

/* ─── CSS preview cards (single style shown) ─── */

function CardPreview({
  style,
  emoji,
  nameText,
  typeLabel,
  quote,
}: {
  style: CardStyle;
  emoji: string;
  nameText: string;
  typeLabel: string;
  quote: string;
}) {
  const base =
    "relative aspect-square rounded-[28px] overflow-hidden border font-[var(--font-plus-jakarta)]";

  if (style === "aurora") {
    return (
      <div className={`${base} border-[#0a4c4c] bg-[#0b2f34] p-5 text-left text-white`}>
        <div className="absolute left-[-20%] top-[-18%] h-56 w-56 rounded-full bg-[#00c8a033] blur-2xl" />
        <div className="absolute right-[-14%] top-[8%] h-52 w-52 rounded-full bg-[#00a8d044] blur-2xl" />
        <div className="relative z-10 flex h-full flex-col">
          <p className="text-xl font-extrabold">ReadMyVibe {emoji}</p>
          <p className="mt-6 text-4xl font-black leading-tight">{nameText}</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-white/80">{typeLabel}</p>
          <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug text-white/90">
            &ldquo;{quote}&rdquo;
          </p>
          <div className="mt-auto flex items-center justify-between text-sm font-bold text-white/95">
            <span>readmyvibe.in</span>
            <span className="rounded-full bg-white/16 px-3 py-1">Find your vibe ✨</span>
          </div>
        </div>
      </div>
    );
  }

  if (style === "minimal") {
    return (
      <div className={`${base} border-[#d0eee8] bg-white text-left text-[#0a3030]`}>
        <div className="bg-gradient-to-r from-[#00a890] to-[#0085b8] p-4 text-white">
          <p className="text-lg font-extrabold">ReadMyVibe {emoji}</p>
        </div>
        <div className="flex h-[calc(100%-64px)] flex-col p-5">
          <p className="text-4xl font-black leading-tight">{nameText}</p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#6aabab]">{typeLabel}</p>
          <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug text-[#0a3030]">
            &ldquo;{quote}&rdquo;
          </p>
          <div className="mt-auto flex items-center justify-between text-sm font-bold">
            <span>readmyvibe.in</span>
            <span className="rounded-full bg-[#e8faf6] px-3 py-1 text-[#007a70]">Find your vibe ✨</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${base} border-[#d0eee8] bg-white pl-[6px] text-left text-[#0a3030]`}>
      <div className="h-full rounded-r-[22px] bg-white p-5">
        <div className="absolute left-0 top-0 h-full w-[6px] bg-gradient-to-b from-[#00a890] to-[#00a8d0]" />
        <p className="text-xl font-extrabold rvm-brand-gradient">ReadMyVibe {emoji}</p>
        <p className="mt-6 text-4xl font-black leading-tight">{nameText}</p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#6aabab]">{typeLabel}</p>
        <p className="mt-5 overflow-hidden text-ellipsis text-lg font-semibold leading-snug">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="mt-8 flex items-center justify-between text-sm font-bold">
          <span>readmyvibe.in</span>
          <span className="rounded-full bg-[#e8faf6] px-3 py-1 text-[#007a70]">Find your vibe ✨</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */

export default function ShareCard({ tool, nameLine, resultText }: Props) {
  const [selectedStyle, setSelectedStyle] = useState<CardStyle>("aurora");
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardBlobUrl, setCardBlobUrl] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [caption, setCaption] = useState("");
  const [isCaptionLoading, setIsCaptionLoading] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [aiQuote, setAiQuote] = useState<string | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState("");
  const cardBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<number | null>(null);

  // Fetch AI quote
  useEffect(() => {
    if (!resultText?.trim()) return;
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 18000);
    setAiQuote(null);
    setQuoteLoading(true);
    fetch("/api/generate-share-card-quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullResult: resultText, toolName: tool.name }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as { quote?: string };
        if (!cancelled && res.ok && data.quote?.trim()) {
          setAiQuote(data.quote.trim());
        }
      })
      .catch(() => {})
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (!cancelled) setQuoteLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [resultText, tool.name]);

  // Reset download state when style changes
  useEffect(() => {
    setDownloaded(false);
    setCardBlobUrl("");
    cardBlobRef.current = null;
  }, [selectedStyle]);

  const quote = useMemo(() => (aiQuote ? aiQuote : extractBestQuote(resultText)), [aiQuote, resultText]);
  const displayQuote = quoteLoading && !aiQuote ? "Creating your personalised line..." : quote;
  const nameText = useMemo(() => (nameLine || "Your Vibe").trim(), [nameLine]);
  const typeLabel = TOOL_TYPE_LABELS[tool.id] || tool.name;

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
        setCaption(fallbackCaption(quoteText));
      }
    } catch {
      setCaption(fallbackCaption(quoteText));
    } finally {
      setIsCaptionLoading(false);
    }
  };

  const fallbackCaption = (q: string) =>
    `POV: AI just decoded my vibe and it is painfully accurate 😭😂\n\n"${q}"\n\nTry yours at readmyvibe.in 👆\n#ReadMyVibe #VibeCheck #InstagramIndia #AIReading #ForYou`;

  const getCardBlob = async (): Promise<Blob> => {
    if (cardBlobRef.current) return cardBlobRef.current;
    const blob = await drawCardToCanvas(selectedStyle, {
      emoji: tool.emoji,
      name: nameText,
      typeLabel,
      quote: aiQuote ?? quote,
    });
    cardBlobRef.current = blob;
    return blob;
  };

  const onDownloadPng = async () => {
    try {
      setIsGenerating(true);
      const blob = await getCardBlob();
      const url = URL.createObjectURL(blob);
      setCardBlobUrl(url);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `readmyvibe-${tool.id}-${selectedStyle}.png`;
      anchor.click();
      setDownloaded(true);
      if (!caption) await generateCaption(aiQuote ?? quote);
    } catch (err) {
      console.error(err);
      setError("Unable to generate card right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInstagramShare = async () => {
    try {
      const blob = await getCardBlob();
      const captionText = caption || "Try yours at readmyvibe.in 👆";
      await navigator.clipboard.writeText(captionText);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `readmyvibe-${tool.id}-${selectedStyle}.png`;
      anchor.click();
      setError("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      const blob = await getCardBlob();
      const file = new File([blob], "readmyvibe.png", { type: "image/png" });
      const shareText = (caption || quote) + "\n\nreadmyvibe.in";

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: shareText });
          return;
        } catch {
          // User cancelled or share failed — fall through
        }
      }

      // Fallback: download image then open WhatsApp with text
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "readmyvibe.png";
      anchor.click();
      setTimeout(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
      }, 800);
    } catch (err) {
      console.error(err);
      window.open(`https://wa.me/?text=${encodeURIComponent((caption || quote) + "\n\nreadmyvibe.in")}`);
    }
  };

  const copyCaption = async () => {
    const text = caption || "Try yours at readmyvibe.in 👆";
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

  return (
    <section className="rvm-card space-y-3 rounded-2xl p-4">
      <h3 className="text-base font-bold text-[#0a3030]">Share your reading</h3>

      {/* Style selector pills */}
      <div className="flex gap-2">
        {(["aurora", "minimal", "bold"] as CardStyle[]).map((style) => (
          <button
            key={style}
            type="button"
            onClick={() => setSelectedStyle(style)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
              selectedStyle === style
                ? "rvm-primary-button"
                : "border border-[#c0e8e0] bg-white text-[#007a70]"
            }`}
          >
            {selectedStyle === style ? "● " : "○ "}
            {STYLE_LABELS[style]}
          </button>
        ))}
      </div>

      {/* Single selected card preview */}
      <div className="transition-opacity duration-300">
        <CardPreview
          style={selectedStyle}
          emoji={tool.emoji}
          nameText={nameText}
          typeLabel={typeLabel}
          quote={displayQuote}
        />
      </div>

      {error ? (
        <div className="rvm-error-box rounded-xl p-3 text-sm font-semibold">⚠️ {error}</div>
      ) : null}

      {/* Action buttons */}
      {!downloaded ? (
        <button
          type="button"
          onClick={onDownloadPng}
          disabled={isGenerating || quoteLoading}
          className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : quoteLoading ? "Preparing your card line..." : "Download PNG"}
        </button>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={onDownloadPng}
            className="rvm-primary-button rounded-xl px-4 py-3 text-sm font-semibold text-white"
          >
            ⬇ Download Again
          </button>
          <button
            type="button"
            onClick={handleInstagramShare}
            className="rounded-xl bg-[#0085b8] px-4 py-3 text-sm font-semibold text-white"
          >
            📱 Share to Instagram
          </button>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="rounded-xl bg-[#0bbf8f] px-4 py-3 text-sm font-semibold text-white"
          >
            💬 WhatsApp
          </button>
        </div>
      )}

      {/* Generated card image preview */}
      {cardBlobUrl ? (
        <div className="rounded-2xl border border-[#d0eee8] bg-white p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cardBlobUrl}
            alt="Generated share card"
            className="h-auto w-full rounded-2xl"
          />
        </div>
      ) : null}

      {/* Caption section */}
      {downloaded ? (
        <div className="rounded-2xl border border-[#d0eee8] bg-white p-3">
          <p className="mb-2 text-sm font-bold text-[#0a3030]">📋 Instagram Caption — tap to copy</p>
          <div className="rounded-xl bg-[#f0fafa] p-3 text-sm text-[#0a3030]">
            {isCaptionLoading ? "Generating caption..." : caption || "Caption will appear here."}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyCaption}
              className="rounded-xl border border-[#c0e8e0] bg-[#e8faf6] px-3 py-2 text-sm font-semibold text-[#007a70]"
            >
              {copiedCaption ? "Copied ✅" : "Copy Caption"}
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl border border-[#c0e8e0] bg-white px-3 py-2 text-sm font-semibold text-[#007a70]"
            >
              {copiedLink ? "Copied ✅" : "Copy Link"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  keyLine: string;
};

export default function ShareCard({ tool, nameLine, keyLine }: Props) {
  const [imgUrl, setImgUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const safeName = (nameLine || "You").trim();
  const teaser = (keyLine || "This reading is so you.").trim().slice(0, 180);

  const cardTitle = useMemo(() => {
    switch (tool.id) {
      case "friendship-roast":
        return "Your Friendship Roast";
      case "decode-message":
        return "Decode Your Crush's Message";
      case "facebook-prediction":
        return "Your 2026 Prediction";
      case "instagram-type":
        return "Your Instagram Type";
      case "crush-compatibility":
        return "Crush Compatibility";
      case "profile-impression":
        return "Profile Impression";
      default:
        return "Profile Personality";
    }
  }, [tool.id]);

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number,
  ) => {
    const words = text.split(" ");
    let line = "";
    let linesWritten = 0;
    for (const word of words) {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, y + linesWritten * lineHeight);
        linesWritten += 1;
        line = word;
        if (linesWritten >= maxLines - 1) break;
      } else {
        line = testLine;
      }
    }
    if (linesWritten < maxLines) {
      const finalLine = linesWritten >= maxLines - 1 && line.length > 70 ? `${line.slice(0, 67)}...` : line;
      ctx.fillText(finalLine, x, y + linesWritten * lineHeight);
    }
  };

  const drawRoundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const generateImage = async () => {
    try {
      setIsGenerating(true);

      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, "#00c8a0");
      gradient.addColorStop(1, "#00a8d0");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      ctx.fillStyle = "rgba(255,255,255,0.14)";
      ctx.beginPath();
      ctx.arc(930, 130, 170, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(110, 980, 200, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 72px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText("ReadMyVibe", 72, 110);

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      drawRoundedRect(ctx, 810, 62, 190, 86, 43);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 52px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText(tool.emoji, 874, 122);

      ctx.fillStyle = "rgba(255,255,255,0.16)";
      drawRoundedRect(ctx, 72, 190, 936, 292, 34);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 76px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText(safeName.toLowerCase(), 108, 300);

      ctx.font = "800 68px 'Plus Jakarta Sans', Arial, sans-serif";
      wrapText(ctx, cardTitle, 108, 390, 850, 74, 2);

      ctx.font = "700 44px 'Plus Jakarta Sans', Arial, sans-serif";
      wrapText(ctx, teaser, 72, 575, 936, 58, 4);

      ctx.fillStyle = "rgba(7, 61, 67, 0.35)";
      drawRoundedRect(ctx, 72, 900, 936, 112, 28);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "800 50px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText("www.readmyvibe.in", 120, 974);

      ctx.fillStyle = "#ffffff";
      drawRoundedRect(ctx, 640, 925, 320, 64, 32);
      ctx.fill();
      ctx.fillStyle = "#007a70";
      ctx.font = "900 44px 'Plus Jakarta Sans', Arial, sans-serif";
      ctx.fillText(`Only Rs ${tool.price / 100}`, 675, 973);

      const dataUrl = canvas.toDataURL("image/png");
      setImgUrl(dataUrl);
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
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#00c8a0] to-[#00a8d0] p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/12" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-tight">ReadMyVibe</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-2xl">{tool.emoji}</span>
          </div>
          <div className="mt-6 rounded-2xl bg-white/16 p-4">
            <p className="text-5xl font-black leading-tight tracking-tight">{safeName.toLowerCase()}</p>
            <p className="mt-3 text-4xl font-bold leading-tight">{cardTitle}</p>
          </div>
          <p className="mt-5 line-clamp-4 break-words text-[32px] font-semibold leading-snug text-white/95">{teaser}</p>
          <div className="mt-auto flex items-center justify-between rounded-xl bg-[#073d4359] px-4 py-3">
            <p className="text-xl font-bold">www.readmyvibe.in</p>
            <p className="rounded-full bg-white px-4 py-1 text-lg font-black text-[#007a70]">Only Rs {tool.price / 100}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={generateImage}
        disabled={isGenerating}
        className="rvm-primary-button w-full rounded-xl px-4 py-3 text-base font-semibold"
      >
        {isGenerating ? "Generating..." : "Generate Share Card"}
      </button>

      {imgUrl ? (
        <div className="space-y-2">
          <Image
            src={imgUrl}
            alt="Generated share card"
            width={1080}
            height={1080}
            unoptimized
            className="h-auto w-full rounded-2xl border border-[#d0eee8]"
          />
          <a
            href={imgUrl}
            download={`readmyvibe-${tool.id}.png`}
            className="rvm-primary-button block w-full rounded-xl px-4 py-3 text-center text-base font-semibold"
          >
            Download Image
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Check my ReadMyVibe result https://readmyvibe.in")}`}
            target="_blank"
            className="block w-full rounded-xl bg-[#0bbf8f] px-4 py-3 text-center text-base font-semibold text-white"
            rel="noreferrer"
          >
            Share to WhatsApp
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText("https://readmyvibe.in")}
            className="block w-full rounded-xl border border-[#c0e8e0] bg-[#e8faf6] px-4 py-3 text-base font-semibold text-[#007a70]"
          >
            Copy link
          </button>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  keyLine: string;
};

export default function ShareCard({ tool, nameLine, keyLine }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const safeName = (nameLine || "Your Vibe Result").trim();
  const teaser = (keyLine || "This reading is so you.").trim();

  const generateImage = async () => {
    if (!exportCardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(exportCardRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
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
    <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-pink-100">
      <h3 className="text-base font-bold text-gray-900">Share your reading</h3>
      <div
        ref={cardRef}
        className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-700 p-6 text-white shadow-xl"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-white/10" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-tight">ReadMyVibe</span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-2xl">{tool.emoji}</span>
          </div>

          <div className="mt-8 rounded-2xl bg-white/12 p-4 backdrop-blur-[1px]">
            <p className="text-5xl font-black leading-tight tracking-tight">{safeName}</p>
            <p className="mt-4 text-4xl font-bold">Your Vibe Is Viral ✨</p>
          </div>

          <p className="mt-5 line-clamp-5 break-words text-[30px] font-semibold leading-snug text-white/95">{teaser}</p>

          <div className="mt-auto flex items-center justify-between rounded-xl bg-black/25 px-4 py-3">
            <p className="text-xl font-bold">www.readmyvibe.in</p>
            <p className="rounded-full bg-white px-4 py-1 text-lg font-black text-fuchsia-700">Only Rs {tool.price / 100}</p>
          </div>
        </div>
      </div>

      {/* Off-screen 1080x1080 export surface for pixel-perfect output */}
      <div className="fixed -left-[99999px] top-0 pointer-events-none">
        <div
          ref={exportCardRef}
          className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-700 text-white shadow-xl"
          style={{ width: 1080, height: 1080 }}
        >
          <div
            className="absolute rounded-full bg-white/20"
            style={{ right: -70, top: -70, width: 260, height: 260 }}
          />
          <div
            className="absolute rounded-full bg-white/10"
            style={{ left: -60, bottom: -60, width: 220, height: 220 }}
          />

          <div className="relative flex h-full flex-col p-14">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 70, fontWeight: 900, letterSpacing: -1.2 }}>ReadMyVibe</span>
              <span
                className="rounded-full bg-white/20"
                style={{ fontSize: 54, padding: "8px 18px", lineHeight: 1 }}
              >
                {tool.emoji}
              </span>
            </div>

            <div className="mt-10 rounded-3xl bg-white/12 p-7" style={{ backdropFilter: "blur(1px)" }}>
              <p style={{ fontSize: 86, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.4 }}>{safeName}</p>
              <p className="mt-4" style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.1 }}>
                Your Vibe Is Viral ✨
              </p>
            </div>

            <p
              className="mt-8 break-words text-white/95"
              style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.32, maxHeight: 260, overflow: "hidden" }}
            >
              {teaser}
            </p>

            <div
              className="mt-auto flex items-center justify-between rounded-2xl bg-black/25"
              style={{ padding: "18px 22px" }}
            >
              <p style={{ fontSize: 40, fontWeight: 800 }}>www.readmyvibe.in</p>
              <p
                className="rounded-full bg-white text-fuchsia-700"
                style={{ fontSize: 32, fontWeight: 900, padding: "8px 18px" }}
              >
                Only Rs {tool.price / 100}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={generateImage}
        disabled={isGenerating}
        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-base font-semibold text-white"
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
            className="h-auto w-full rounded-2xl border border-pink-100"
          />
          <a
            href={imgUrl}
            download={`readmyvibe-${tool.id}.png`}
            className="block w-full rounded-xl bg-gray-900 px-4 py-3 text-center text-base font-semibold text-white"
          >
            Download Image
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Check my ReadMyVibe result https://readmyvibe.in")}`}
            target="_blank"
            className="block w-full rounded-xl bg-green-600 px-4 py-3 text-center text-base font-semibold text-white"
            rel="noreferrer"
          >
            Share to WhatsApp
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText("https://readmyvibe.in")}
            className="w-full rounded-xl bg-purple-600 px-4 py-3 text-base font-semibold text-white"
          >
            Copy link
          </button>
        </div>
      ) : null}
    </section>
  );
}

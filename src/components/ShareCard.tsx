"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { ToolConfig } from "@/types";

type Props = {
  tool: ToolConfig;
  nameLine: string;
  keyLine: string;
};

export default function ShareCard({ tool, nameLine, keyLine }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgUrl, setImgUrl] = useState("");

  const generateImage = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    setImgUrl(dataUrl);
  };

  return (
    <section className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-pink-100">
      <h3 className="text-base font-bold text-gray-900">Share your reading</h3>
      <div
        ref={cardRef}
        className="aspect-square w-full rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-6 text-white"
      >
        <div className="flex items-center justify-between text-xl font-bold">
          <span>ReadMyVibe</span>
          <span>{tool.emoji}</span>
        </div>
        <p className="mt-10 text-3xl font-bold">{nameLine || "Your Vibe Result"}</p>
        <p className="mt-4 text-lg">{keyLine || "This reading is so you."}</p>
        <p className="mt-12 text-sm font-semibold opacity-90">readmyvibe.in - Only Rs {tool.price / 100}</p>
      </div>

      <button
        type="button"
        onClick={generateImage}
        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 text-base font-semibold text-white"
      >
        Generate Share Card
      </button>

      {imgUrl ? (
        <div className="space-y-2">
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

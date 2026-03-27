import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

type Style = "aurora" | "minimal" | "bold";

function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function styleBackground(style: Style) {
  if (style === "minimal") return `<rect width="1080" height="1080" fill="#ffffff"/><rect x="0" y="0" width="1080" height="180" fill="url(#tealHeader)"/>`;
  if (style === "bold") return `<rect width="1080" height="1080" fill="#ffffff"/><rect x="0" y="0" width="6" height="1080" fill="url(#tealLine)"/>`;
  return `<rect width="1080" height="1080" fill="#0b2f34"/><circle cx="170" cy="130" r="180" fill="rgba(0,200,160,0.20)"/><circle cx="930" cy="220" r="220" fill="rgba(0,168,208,0.22)"/>`;
}

export async function POST(req: NextRequest) {
  try {
    const { style, emoji, nameText, typeLabel, quote } = (await req.json()) as {
      style: Style;
      emoji: string;
      nameText: string;
      typeLabel: string;
      quote: string;
    };

    const safeStyle: Style = ["aurora", "minimal", "bold"].includes(style) ? style : "aurora";
    const isDark = safeStyle === "aurora";
    const fg = isDark ? "#ffffff" : "#0a3030";
    const muted = isDark ? "rgba(255,255,255,0.8)" : "#6aabab";
    const quoteText = (quote || "").trim().slice(0, 80) + ((quote || "").length > 80 ? "..." : "");

    const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tealHeader" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00a890"/>
      <stop offset="100%" stop-color="#0085b8"/>
    </linearGradient>
    <linearGradient id="tealLine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#00a890"/>
      <stop offset="100%" stop-color="#00a8d0"/>
    </linearGradient>
  </defs>
  ${styleBackground(safeStyle)}
  <text x="60" y="88" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="32" font-weight="800" fill="${isDark ? "#ffffff" : "#00a890"}">ReadMyVibe ${esc(emoji || "✨")}</text>

  <text x="60" y="260" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="72" font-weight="800" fill="${fg}">${esc((nameText || "Your Vibe").slice(0, 24))}</text>
  <text x="60" y="322" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="34" font-weight="700" fill="${muted}">${esc((typeLabel || "Vibe Result").slice(0, 36))}</text>

  <foreignObject x="60" y="390" width="960" height="250">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Plus Jakarta Sans, Arial, sans-serif;color:${fg};font-size:36px;line-height:1.4;font-weight:700;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">
      ${esc(quoteText)}
    </div>
  </foreignObject>

  <text x="60" y="1020" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="28" font-weight="800" fill="${fg}">readmyvibe.in</text>
  <text x="800" y="1020" font-family="Plus Jakarta Sans, Arial, sans-serif" font-size="28" font-weight="800" fill="${fg}">Find your vibe ✨</text>
</svg>`;

    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'inline; filename="readmyvibe-card.png"',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Card generation failed" }, { status: 500 });
  }
}

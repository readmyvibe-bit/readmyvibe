import sharp from "sharp";

const output = "readmyvibe-sample-card.png";

const svg = `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#9333ea"/>
    </linearGradient>
    <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect x="0" y="0" width="1080" height="1080" fill="url(#bg)"/>

  <rect x="60" y="60" width="960" height="960" rx="42" fill="rgba(255,255,255,0.08)" />

  <text x="110" y="170" fill="#ffffff" font-size="64" font-family="Arial, sans-serif" font-weight="700">ReadMyVibe</text>
  <text x="930" y="170" fill="#ffffff" font-size="64" font-family="Arial, sans-serif">😂</text>

  <text x="110" y="410" fill="#ffffff" font-size="78" font-family="Arial, sans-serif" font-weight="800" filter="url(#softGlow)">
    <tspan x="110" dy="0">Avi + Sara =</tspan>
    <tspan x="110" dy="92">The Chaotic Duo</tspan>
  </text>

  <text x="110" y="640" fill="#fdf4ff" font-size="42" font-family="Arial, sans-serif" font-weight="500">
    <tspan x="110" dy="0">Your friendship roast says you are</tspan>
    <tspan x="110" dy="54">legendary, dramatic, and inseparable.</tspan>
  </text>

  <text x="110" y="930" fill="#ffffff" opacity="0.95" font-size="36" font-family="Arial, sans-serif" font-weight="700">
    www.readmyvibe.in · Only Rs 1
  </text>
</svg>
`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
console.log(`Created ${output}`);

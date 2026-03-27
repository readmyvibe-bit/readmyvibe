import FreePreview from "@/components/FreePreview";
import LockedSection from "@/components/LockedSection";

type Props = {
  freePreview: string;
  fullResult: string | null;
  unlocked: boolean;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatSectionHeading(line: string) {
  const escaped = escapeHtml(line);
  // Strip leading number + period (e.g. "1. ")
  const withoutNumber = escaped.replace(/^\d+\.\s*/, "");
  // Strip ** markers and render as bold heading
  const clean = withoutNumber.replace(/\*\*([\s\S]*?)\*\*/g, "$1").replace(/\*/g, "");
  return `<div class="result-heading">${clean}</div>`;
}

function formatBodyLine(line: string) {
  const escaped = escapeHtml(line);
  return escaped
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/##\s?/g, "");
}

function formatFullResult(text: string) {
  const lines = text.split("\n");
  const sections: string[] = [];
  let currentBody: string[] = [];

  const flushBody = () => {
    if (currentBody.length > 0) {
      const joined = currentBody.join("<br/>").trim();
      if (joined.replace(/<br\/?>/g, "").trim()) {
        sections.push(`<div class="result-body">${joined}</div>`);
      }
      currentBody = [];
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      // blank line — potential section break
      flushBody();
      continue;
    }

    // Detect section headings: lines starting with "1.", "2." etc. or all-caps labels
    const isSectionHead = /^\d+\.\s/.test(trimmed);
    if (isSectionHead) {
      flushBody();
      sections.push(formatSectionHeading(trimmed));
    } else {
      currentBody.push(formatBodyLine(trimmed));
    }
  }
  flushBody();

  // Wrap consecutive heading + body pairs into section blocks
  const html: string[] = [];
  let i = 0;
  while (i < sections.length) {
    if (sections[i].includes("result-heading")) {
      let block = sections[i];
      // Collect all body divs that follow this heading
      while (i + 1 < sections.length && sections[i + 1].includes("result-body")) {
        i++;
        block += sections[i];
      }
      html.push(`<div class="result-section">${block}</div>`);
    } else {
      html.push(sections[i]);
    }
    i++;
  }

  return html.join("");
}

export default function ResultCard({ freePreview, fullResult, unlocked }: Props) {
  if (unlocked && fullResult) {
    return (
      <section className="rvm-card rounded-2xl p-4">
        <h3 className="mb-3 text-lg font-bold text-[#0a3030]">Your full reading</h3>
        <div
          className="result-formatted"
          dangerouslySetInnerHTML={{ __html: formatFullResult(fullResult) }}
        />
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <FreePreview text={freePreview} />
      <LockedSection />
    </div>
  );
}

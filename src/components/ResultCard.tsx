import FreePreview from "@/components/FreePreview";
import LockedSection from "@/components/LockedSection";

type Props = {
  freePreview: string;
  fullResult: string | null;
  unlocked: boolean;
};

function cleanMarkdownToHtml(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/##\s/g, "")
    .replace(/^\d+\.\s/gm, "")
    .replace(/\n/g, "<br/>");
}

export default function ResultCard({ freePreview, fullResult, unlocked }: Props) {
  if (unlocked && fullResult) {
    return (
      <section className="rvm-card rounded-2xl p-4">
        <h3 className="mb-2 text-base font-bold text-[#0a3030]">Your full reading</h3>
        <p
          className="text-base leading-relaxed text-[#0a3030]"
          dangerouslySetInnerHTML={{ __html: cleanMarkdownToHtml(fullResult) }}
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

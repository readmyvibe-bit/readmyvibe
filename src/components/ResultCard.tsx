import FreePreview from "@/components/FreePreview";
import LockedSection from "@/components/LockedSection";

type Props = {
  freePreview: string;
  fullResult: string | null;
  unlocked: boolean;
};

export default function ResultCard({ freePreview, fullResult, unlocked }: Props) {
  if (unlocked && fullResult) {
    return (
      <section className="rounded-2xl bg-white p-4 ring-1 ring-pink-100">
        <h3 className="mb-2 text-base font-bold text-gray-900">Your full reading</h3>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">{fullResult}</p>
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

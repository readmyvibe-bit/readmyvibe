export default function FreePreview({ text }: { text: string }) {
  return (
    <section className="rvm-card rounded-2xl p-4">
      <h3 className="mb-2 text-base font-bold text-[#0a3030]">Your free preview</h3>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-[#0a3030]">{text}</p>
    </section>
  );
}

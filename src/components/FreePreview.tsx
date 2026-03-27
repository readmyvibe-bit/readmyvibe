export default function FreePreview({ text }: { text: string }) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-pink-100">
      <h3 className="mb-2 text-base font-bold text-gray-900">Your free preview</h3>
      <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">{text}</p>
    </section>
  );
}

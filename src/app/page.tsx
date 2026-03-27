import ToolCard from "@/components/ToolCard";
import LegalLinks from "@/components/LegalLinks";
import { TOOLS } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md pb-24">
        <header className="rvm-hero mb-4 rounded-3xl p-5">
          <h1 className="text-3xl font-extrabold">ReadMyVibe</h1>
          <p className="mt-1 text-base text-white/90">Discover your vibe. Share the fun.</p>
          <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#008878]">
            7 premium AI tools
          </div>
        </header>

        <section className="space-y-3">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-[#c8eae4] bg-[rgba(240,250,250,0.97)] px-4 py-3 text-center text-sm font-semibold text-[#007a70] backdrop-blur">
        Rs 3-5 per reading - UPI accepted - No account needed
        <LegalLinks />
      </footer>
    </main>
  );
}

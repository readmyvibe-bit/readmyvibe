import ToolCard from "@/components/ToolCard";
import LegalLinks from "@/components/LegalLinks";
import { TOOLS } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6">
      <div className="mx-auto max-w-md">
        <header className="mb-5">
          <h1 className="text-3xl font-bold text-gray-900">ReadMyVibe</h1>
          <p className="mt-1 text-base text-gray-600">Discover your vibe. Share the fun.</p>
        </header>

        <section className="space-y-3 pb-24">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-pink-100 bg-white/95 px-4 py-3 text-center text-sm font-semibold text-pink-700 backdrop-blur">
        Rs 1-5 per reading - UPI accepted - No account needed
        <LegalLinks />
      </footer>
    </main>
  );
}

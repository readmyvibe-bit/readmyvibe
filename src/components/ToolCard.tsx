import Link from "next/link";
import { ToolConfig } from "@/types";

export default function ToolCard({ tool }: { tool: ToolConfig }) {
  return (
    <Link
      href={`/tools/${tool.id}`}
      className="block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pink-100 transition hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-2xl">{tool.emoji}</div>
        <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-semibold text-pink-700">
          Rs {tool.price / 100}
        </span>
      </div>
      <h2 className="text-lg font-bold text-gray-900">{tool.name}</h2>
      <p className="mt-1 text-base text-gray-600">{tool.tagline}</p>
      <div className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-2 text-center text-base font-semibold text-white">
        Try Now
      </div>
    </Link>
  );
}

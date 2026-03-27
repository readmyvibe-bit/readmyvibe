import Link from "next/link";
import { ToolConfig } from "@/types";

export default function ToolCard({ tool }: { tool: ToolConfig }) {
  return (
    <Link
      href={`/tools/${tool.id}`}
      className="rvm-card block rounded-2xl p-4"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-2xl">{tool.emoji}</div>
        <span className="rvm-payment-badge rounded-full px-3 py-1 text-sm font-semibold">
          Rs {tool.price / 100}
        </span>
      </div>
      <h2 className="text-lg font-bold text-[#0a3030]">{tool.name}</h2>
      <p className="mt-1 text-base text-[#5a9090]">{tool.tagline}</p>
      <div className="rvm-primary-button mt-4 w-full rounded-xl px-4 py-2 text-center text-base font-semibold">
        Try Now
      </div>
    </Link>
  );
}

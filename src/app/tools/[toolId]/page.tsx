import { notFound } from "next/navigation";
import ToolPageClient from "@/components/ToolPageClient";
import { TOOL_CONFIG } from "@/lib/config";
import { ToolId } from "@/types";

export default async function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const { toolId } = await params;
  const tool = TOOL_CONFIG[toolId as ToolId];
  if (!tool) notFound();
  return <ToolPageClient tool={tool} />;
}

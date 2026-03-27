import ToolPageClient from "@/components/ToolPageClient";
import { TOOL_CONFIG } from "@/lib/config";

export default function Page() {
  return <ToolPageClient tool={TOOL_CONFIG["instagram-type"]} />;
}

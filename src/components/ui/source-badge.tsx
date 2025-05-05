import { Badge } from "./badge";
import type { FlashcardSource } from "../../types";

interface SourceBadgeProps {
  source: FlashcardSource;
}

const sourceStyles = {
  "ai-full": "bg-blue-100 text-blue-800 border-blue-200 border-2 rounded-md",
  "ai-edited": "bg-orange-100 text-orange-800 border-orange-200 border-2 rounded-md",
  manual: "bg-green-100 text-green-800 border-green-200 border-2 rounded-md",
} as const;

export function SourceBadge({ source }: SourceBadgeProps) {
  return (
    <Badge variant="outline" className={sourceStyles[source]}>
      {source}
    </Badge>
  );
}

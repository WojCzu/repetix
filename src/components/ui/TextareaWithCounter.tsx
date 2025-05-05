import type { TextareaHTMLAttributes } from "react";
import { Textarea } from "@/components/ui/textarea";

interface TextareaWithCounterProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number;
}

export function TextareaWithCounter({ maxLength, value, onChange, ...props }: TextareaWithCounterProps) {
  const currentLength = typeof value === "string" ? value.length : 0;

  return (
    <div className="relative">
      <Textarea value={value} onChange={onChange} maxLength={maxLength} {...props} className="max-h-[300px]" />
      {maxLength && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          {currentLength}/{maxLength}
        </div>
      )}
    </div>
  );
}

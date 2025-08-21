"use client";

import { cn } from "@/lib/utils";

type Props = {
  text: string;
  cursorIndex: number;
  errorIndices: Set<number>;
};

export default function TextRenderer({
  text,
  cursorIndex,
  errorIndices,
}: Props) {
  return (
    <pre
      className="font-mono text-base leading-7 whitespace-pre-wrap break-words rounded-xl p-4 bg-muted/40"
      aria-label="Typing snippet"
    >
      {text.split("").map((ch, i) => {
        const isTyped = i < cursorIndex;
        const isError = errorIndices.has(i);
        const isCurrent = i === cursorIndex;
        return (
          <span
            key={i}
            className={cn(
              "transition-colors",
              isTyped && !isError && "text-foreground",
              isError && "bg-destructive/10 underline decoration-destructive",
              !isTyped && !isError && "text-muted-foreground",
              isCurrent && "border-b-2 border-b-primary"
            )}
          >
            {ch}
          </span>
        );
      })}
    </pre>
  );
}

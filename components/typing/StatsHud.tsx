"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  rawWpm: number;
  adjustedWpm: number;
  accuracy: number; // 0..1
  timeLeft: number;
  errors: number;
};

export default function StatsHud({
  rawWpm,
  adjustedWpm,
  accuracy,
  timeLeft,
  errors,
}: Props) {
  return (
    <Card
      aria-live="polite"
      className="rounded-xl sticky top-2 z-10 bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm"
    >
      <CardContent className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 text-sm">
        <div>
          <div className="text-xs text-muted-foreground">Raw WPM</div>
          <div className="font-mono text-lg">{rawWpm}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
          <div className="font-mono text-lg">{Math.round(accuracy * 100)}%</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Adj. WPM</div>
          <div className="font-mono text-lg">{adjustedWpm}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Errors</div>
          <div className="font-mono text-lg">{errors}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Time Left</div>
          <div className="font-mono text-lg">{timeLeft}s</div>
        </div>
      </CardContent>
    </Card>
  );
}

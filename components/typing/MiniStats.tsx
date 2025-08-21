"use client";

import type { Attempt } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  attempts: Attempt[];
};

export default function MiniStats({ attempts }: Props) {
  const best = attempts.reduce((m, a) => Math.max(m, a.adjustedWpm), 0);
  const last10 = attempts.slice(0, 10);
  const avgWpm = last10.length
    ? Math.round(
        (last10.reduce((n, a) => n + a.adjustedWpm, 0) / last10.length) * 10
      ) / 10
    : 0;
  const avgAcc = last10.length
    ? Math.round(
        (last10.reduce((n, a) => n + a.accuracy, 0) / last10.length) * 100
      )
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Kpi label="Best WPM" value={best} />
      <Kpi label="Avg WPM (last 10)" value={avgWpm} />
      <Kpi label="Avg Accuracy" value={`${avgAcc}%`} />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-2xl">{value}</div>
      </CardContent>
    </Card>
  );
}

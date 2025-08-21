"use client";

import type { Attempt, MetricsTick, TimerOption } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";

type Props = {
  attempt: Attempt;
};

export default function ResultSummary({ attempt }: Props) {
  const router = useRouter();
  const data = toWpmSeries(attempt.cpsSeries);

  const onRetrySame = async () => {
    const { sessionId, snippet } = await apiClient.createSession({
      timer: attempt.timerSec,
      difficulty: "medium",
      tags: ["english"],
    });
    try {
      sessionStorage.setItem(
        `typie_session_${sessionId}`,
        JSON.stringify({ snippet, timer: attempt.timerSec })
      );
    } catch {
      /* ignore */
    }
    router.push(`/play/${sessionId}`);
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          <Kpi label="Raw WPM" value={attempt.rawWpm} />
          <Kpi
            label="Accuracy"
            value={`${Math.round(attempt.accuracy * 100)}%`}
          />
          <Kpi label="Adjusted WPM" value={attempt.adjustedWpm} />
          <Kpi
            label="Errors"
            value={attempt.totalChars - attempt.correctChars}
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">WPM over time</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ wpm: { label: "WPM", color: "hsl(var(--primary))" } }}
            className="w-full h-[220px]"
          >
            <LineChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sec" tickLine={false} axisLine={false} />
              <YAxis width={40} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--color-wpm)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Total Chars</div>
            <div className="font-mono text-lg">{attempt.totalChars}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Correct Chars</div>
            <div className="font-mono text-lg">{attempt.correctChars}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Duration</div>
            <div className="font-mono text-lg">{attempt.timerSec}s</div>
          </div>
          <div className="sm:col-span-3">
            <div className="text-muted-foreground">Top Errors</div>
            {Object.keys(attempt.errorMap).length === 0 ? (
              <div className="text-xs text-muted-foreground">No error data</div>
            ) : (
              <ul className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(attempt.errorMap)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([w, c]) => (
                    <li key={w} className="font-mono text-sm">
                      {w}: {c}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 justify-end">
        <Button onClick={onRetrySame}>Retry same duration</Button>
        <Button variant="secondary" onClick={() => router.push("/play")}>
          Try different duration
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-mono text-2xl">{value}</div>
    </div>
  );
}

function toWpmSeries(series: MetricsTick[]): { sec: number; wpm: number }[] {
  let cumChars = 0;
  return series.map((t) => {
    cumChars += t.chars;
    const wpm = Math.round((cumChars / 5 / ((t.sec + 1) / 60)) * 100) / 100;
    return { sec: t.sec, wpm };
  });
}

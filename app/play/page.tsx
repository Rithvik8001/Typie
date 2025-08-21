"use client";

import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useRouter } from "next/navigation";
import type {
  Difficulty,
  SnippetTag,
  StartOptions,
  TimerOption,
} from "@/lib/types";
import { apiClient } from "@/lib/api/client";

const TIMER_OPTIONS: TimerOption[] = [15, 30, 45, 60, 120];
const DEFAULTS: StartOptions = {
  timer: 60,
  difficulty: "medium",
  tags: ["english"],
};

export default function PlaySetupPage() {
  const router = useRouter();
  const [value, setValue] = useState<StartOptions>(DEFAULTS);
  const [loading, setLoading] = useState(false);

  const onChange = useCallback((next: Partial<StartOptions>) => {
    setValue((p) => ({ ...p, ...next }));
  }, []);

  const canStart = useMemo(() => !!value.timer, [value.timer]);

  const onStart = useCallback(async () => {
    if (!canStart) return;
    setLoading(true);
    try {
      const { sessionId } = await apiClient.createSession(value);
      router.push(`/play/${sessionId}`);
    } finally {
      setLoading(false);
    }
  }, [canStart, router, value]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <Label className="mb-2 block">Timer</Label>
            <RadioGroup
              value={String(value.timer)}
              onValueChange={(v) =>
                onChange({ timer: Number(v) as TimerOption })
              }
              className="grid grid-cols-5 gap-2"
            >
              {TIMER_OPTIONS.map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <RadioGroupItem id={`t-${opt}`} value={String(opt)} />
                  <Label htmlFor={`t-${opt}`}>{opt}s</Label>
                </div>
              ))}
            </RadioGroup>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Difficulty</Label>
              <Select
                value={value.difficulty}
                onValueChange={(v) => onChange({ difficulty: v as Difficulty })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Tags</Label>
              <ToggleGroup
                type="multiple"
                value={value.tags as string[]}
                onValueChange={(vals) =>
                  onChange({ tags: vals as SnippetTag[] })
                }
                className="flex flex-wrap gap-2"
              >
                <ToggleGroupItem value="english" aria-label="English">
                  English
                </ToggleGroupItem>
                <ToggleGroupItem value="code" aria-label="Code">
                  Code
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </section>

          <div className="flex justify-end">
            <Button size="lg" onClick={onStart} disabled={!canStart || loading}>
              {loading ? "Starting..." : "Start Test"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

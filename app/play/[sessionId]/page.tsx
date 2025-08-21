"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TestController from "@/components/typing/TestController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsTick, Snippet, TimerOption } from "@/lib/types";
import { apiClient } from "@/lib/api/client";
import { BackButton } from "@/components/ui/back-button";

type SessionPayload = {
  snippet: Snippet;
  timer: TimerOption;
};

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [data, setData] = useState<SessionPayload | null>(null);

  useEffect(() => {
    // Retrieve from sessionStorage if present; otherwise fallback to API createSession is not possible here
    try {
      const raw = sessionStorage.getItem(`typie_session_${sessionId}`);
      if (raw) {
        setData(JSON.parse(raw) as SessionPayload);
        return;
      }
    } catch {
      /* ignore */
    }
    // As a fallback, create a generic session from defaults
    (async () => {
      const { snippet } = await apiClient.createSession({
        timer: 60,
        difficulty: "medium",
        tags: ["english"],
      });
      setData({ snippet, timer: 60 });
    })();
  }, [sessionId]);

  const onFinish = (draft: {
    rawWpm: number;
    accuracy: number;
    adjustedWpm: number;
    totalChars: number;
    correctChars: number;
    errors: number;
    cpsSeries: MetricsTick[];
  }) => {
    // Save and redirect to results (mock)
    apiClient
      .saveAttempt({
        userId: "mock-user-1",
        snippetId: data!.snippet.id,
        mode: "time",
        timerSec: data!.timer,
        rawWpm: draft.rawWpm,
        accuracy: draft.accuracy,
        adjustedWpm: draft.adjustedWpm,
        totalChars: draft.totalChars,
        correctChars: draft.correctChars,
        errorMap: {},
        cpsSeries: draft.cpsSeries,
      })
      .then(({ attemptId }) => {
        try {
          const attempt = {
            id: attemptId,
            userId: "mock-user-1",
            snippetId: data!.snippet.id,
            mode: "time" as const,
            timerSec: data!.timer,
            rawWpm: draft.rawWpm,
            accuracy: draft.accuracy,
            adjustedWpm: draft.adjustedWpm,
            totalChars: draft.totalChars,
            correctChars: draft.correctChars,
            errorMap: {},
            cpsSeries: draft.cpsSeries,
            createdAt: new Date().toISOString(),
          };
          sessionStorage.setItem(
            `typie_attempt_${attemptId}`,
            JSON.stringify(attempt)
          );
        } catch {
          /* ignore */
        }
        router.replace(`/results/${attemptId}`);
      });
  };

  if (!data) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="absolute left-4 top-4">
        <BackButton />
      </div>
      <Card className="w-full max-w-4xl rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Typing Test</CardTitle>
        </CardHeader>
        <CardContent>
          <TestController
            snippet={data.snippet}
            timer={data.timer}
            onFinish={onFinish}
          />
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: Press Space to (re)start. If you finish the paragraph early,
            the test ends automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

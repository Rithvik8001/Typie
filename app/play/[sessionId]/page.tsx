"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TestController from "@/components/typing/TestController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsTick, Snippet, TimerOption } from "@/lib/types";
import { apiClient } from "@/lib/api/client";
import { BackButton } from "@/components/ui/back-button";
import { useAuth } from "@/lib/auth/auth-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type SessionPayload = {
  snippet: Snippet;
  timer: TimerOption;
};

export default function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<SessionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      try {
        const { snippet } = await apiClient.createSession({
          timer: 60,
          difficulty: "medium",
          tags: ["english"],
        });
        if (!snippet?.body || snippet.body.length < 5) {
          setError("No suitable snippet found for the selected filters.");
          return;
        }
        setData({ snippet, timer: 60 });
      } catch (e) {
        setError(
          "Failed to start session. Please adjust filters and try again."
        );
      }
    })();
  }, [sessionId]);

  const onFinish = async (draft: {
    rawWpm: number;
    accuracy: number;
    adjustedWpm: number;
    totalChars: number;
    correctChars: number;
    errors: number;
    cpsSeries: MetricsTick[];
  }) => {
    // Prefer saving to Supabase when authenticated; fallback to local-only result
    try {
      const { attemptId } = await apiClient.saveAttempt({
        userId: user?.id ?? "anonymous",
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
      });
      router.replace(`/results/${attemptId}`);
      return;
    } catch (e) {
      const attemptId = `local-${Math.random().toString(36).slice(2, 9)}`;
      try {
        const attempt = {
          id: attemptId,
          userId: user?.id ?? "anonymous",
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
      } catch {}
      router.replace(`/results/${attemptId}`);
    }
  };

  if (error) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6">
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        <Card className="w-full max-w-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="font-mono">Unable to start test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/play">Back to setup</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

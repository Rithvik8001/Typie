"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResultSummary from "@/components/typing/ResultSummary";
import type { Attempt } from "@/lib/types";
import { apiClient } from "@/lib/api/client";
import { BackButton } from "@/components/ui/back-button";

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    apiClient.getAttempt(attemptId).then((a) => {
      if (a) return setAttempt(a);
      try {
        const raw = sessionStorage.getItem(`typie_attempt_${attemptId}`);
        if (raw) setAttempt(JSON.parse(raw) as Attempt);
      } catch {
        /* ignore */
      }
    });
  }, [attemptId]);

  if (!attempt) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="absolute left-4 top-4">
        <BackButton />
      </div>
      <Card className="w-full max-w-4xl rounded-2xl">
        <CardHeader>
          <CardTitle className="font-mono">Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultSummary attempt={attempt} />
        </CardContent>
      </Card>
    </div>
  );
}

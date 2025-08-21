"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResultSummary from "@/components/typing/ResultSummary";
import type { Attempt } from "@/lib/types";
import { apiClient } from "@/lib/api/client";

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    apiClient.getAttempt(attemptId).then(setAttempt);
  }, [attemptId]);

  if (!attempt) return null;

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
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

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MiniStats from "@/components/typing/MiniStats";
import AttemptsTable from "@/components/typing/AttemptsTable";
import { useAuth } from "@/lib/auth/auth-context";
import { apiClient } from "@/lib/api/client";
import type { Attempt } from "@/lib/types";
import { BackButton } from "@/components/ui/back-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rows, setRows] = useState<Attempt[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    apiClient
      .listAttempts(user.id, { period, page, pageSize })
      .then(({ rows, total }) => {
        setRows(rows);
        setTotal(total);
        // Clamp page if out of range after filter change
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (total > 0 && page > totalPages) {
          setPage(totalPages);
        }
      })
      .catch(() => setError("Failed to load attempts. Please try again."))
      .finally(() => setLoading(false));
  }, [user, period, page]);

  // No hard redirect; show inline sign-in CTA instead

  const allForKpis = useMemo(() => rows, [rows]);

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="absolute left-4 top-4">
        <BackButton />
      </div>
      <div className="w-full max-w-5xl space-y-6">
        {!authLoading && !user ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-mono">Sign in required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                You must be signed in to view the dashboard.
              </p>
              <Link
                href="/auth/signin"
                className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm"
              >
                Go to sign in
              </Link>
            </CardContent>
          </Card>
        ) : null}
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-mono">Dashboard</CardTitle>
            <div className="flex gap-2 text-sm">
              <button
                onClick={() => {
                  setPage(1);
                  setPeriod("7d");
                }}
                className={`underline-offset-4 hover:underline ${
                  period === "7d" ? "text-primary" : "text-foreground"
                }`}
              >
                7d
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setPeriod("30d");
                }}
                className={`underline-offset-4 hover:underline ${
                  period === "30d" ? "text-primary" : "text-foreground"
                }`}
              >
                30d
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  setPeriod("all");
                }}
                className={`underline-offset-4 hover:underline ${
                  period === "all" ? "text-primary" : "text-foreground"
                }`}
              >
                All
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
                <div className="h-20 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : error ? (
              <div className="text-sm text-destructive">{error}</div>
            ) : (
              <MiniStats attempts={allForKpis} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono">Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-lg bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-between">
                <div className="text-sm text-destructive">{error}</div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (user) {
                      setLoading(true);
                      setError(null);
                      apiClient
                        .listAttempts(user.id, { period, page, pageSize })
                        .then(({ rows, total }) => {
                          setRows(rows);
                          setTotal(total);
                        })
                        .catch(() =>
                          setError("Failed to load attempts. Please try again.")
                        )
                        .finally(() => setLoading(false));
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : total === 0 ? (
              <div className="text-sm text-muted-foreground">
                No attempts yet.{" "}
                <Link className="underline" href="/play">
                  Start a typing test
                </Link>{" "}
                to see your results here.
              </div>
            ) : (
              <AttemptsTable
                rows={rows}
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

type Props = {
  children: React.ReactNode;
};

// Simple client-side guard: if not authenticated, redirect to landing.
export function AuthGuard({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) return null;
  if (!user) return null;
  return children;
}

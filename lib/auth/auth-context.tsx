"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../types";
import { SupabaseAuth } from "./supabase-auth";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithEmail?: (email: string, password: string) => Promise<User>;
  signInWithEmail?: (email: string, password: string) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_KEY = "typie_mock_user";

const FAKE_USER: User = {
  id: "mock-user-1",
  name: "Ava Carter",
  email: "ava.carter@example.com",
  imageUrl: undefined,
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supa = useMemo(() => new SupabaseAuth(), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sessionUser = await supa.getSession();
        if (!cancelled && sessionUser) {
          setUser(sessionUser);
          setLoading(false);
          return;
        }
      } catch {}
      // Fallback to mock local storage user for dev/demo
      try {
        const raw =
          typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
        if (raw) setUser(JSON.parse(raw) as User);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [supa]);

  const signIn = useCallback(async () => {
    // Temporary mock sign-in for CTA buttons that don't collect credentials
    await new Promise((r) => setTimeout(r, 150));
    setUser(FAKE_USER);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(FAKE_USER));
    } catch {}
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const u = await supa.signUpWithEmail(email, password);
      setUser(u);
      try {
        localStorage.removeItem(LS_KEY);
      } catch {}
      return u;
    },
    [supa]
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const u = await supa.signInWithEmail(email, password);
      setUser(u);
      try {
        localStorage.removeItem(LS_KEY);
      } catch {}
      return u;
    },
    [supa]
  );

  const signOut = useCallback(async () => {
    try {
      await supa.signOut();
    } catch {}
    setUser(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }, [supa]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn,
      signOut,
      signUpWithEmail,
      signInWithEmail,
    }),
    [user, loading, signIn, signOut, signUpWithEmail, signInWithEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

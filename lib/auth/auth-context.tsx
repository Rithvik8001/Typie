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

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
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

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (raw) setUser(JSON.parse(raw) as User);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async () => {
    // Simulate Google OAuth success
    await new Promise((r) => setTimeout(r, 300));
    setUser(FAKE_USER);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(FAKE_USER));
    } catch {
      /* ignore */
    }
  }, []);

  const signOut = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 200));
    setUser(null);
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

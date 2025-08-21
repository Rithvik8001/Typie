"use client";

import type { AuthPort } from "./port";
import type { User } from "../types";
import { getSupabaseClient } from "../supabase/client";

function mapUser(supabaseUser: { id: string; email?: string | null }): User {
  return {
    id: supabaseUser.id,
    name: supabaseUser.email?.split("@")[0] || "User",
    email: supabaseUser.email || "",
    createdAt: new Date().toISOString(),
  };
}

export class SupabaseAuth implements AuthPort {
  async getSession(): Promise<User | null> {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) return mapUser({ id: data.user.id, email: data.user.email });
    return null;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw error ?? new Error("Sign up failed");
    return mapUser({ id: data.user.id, email: data.user.email });
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) throw error ?? new Error("Sign in failed");
    return mapUser({ id: data.user.id, email: data.user.email });
  }

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }
}

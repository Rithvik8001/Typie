import type { ApiPort } from "./port";
import type {
  Attempt,
  Difficulty,
  Snippet,
  SnippetTag,
  StartOptions,
  TimerOption,
} from "../types";
import { getSupabaseClient } from "../supabase/client";

function mapSnippetRow(row: any): Snippet {
  return {
    id: row.id,
    body: row.body,
    isCode: row.is_code,
    difficulty: row.difficulty as Difficulty,
    tags: row.tags as SnippetTag[],
    createdAt: new Date(row.created_at).toISOString(),
  };
}

function mapAttemptRow(row: any): Attempt {
  return {
    id: row.id,
    userId: row.user_id,
    snippetId: row.snippet_id,
    mode: row.mode,
    timerSec: row.timer_sec as TimerOption,
    rawWpm: Number(row.raw_wpm),
    accuracy: Number(row.accuracy),
    adjustedWpm: Number(row.adjusted_wpm),
    totalChars: Number(row.total_chars),
    correctChars: Number(row.correct_chars),
    errorMap: (row.error_map ?? {}) as Record<string, number>,
    cpsSeries: (row.cps_series ?? []) as Attempt["cpsSeries"],
    createdAt: new Date(row.created_at).toISOString(),
  };
}

class SupabaseApiClient implements ApiPort {
  async listSnippets(filters: {
    difficulty?: Difficulty;
    tags?: SnippetTag[];
    charFilters?: StartOptions["charFilters"];
  }): Promise<Snippet[]> {
    const supabase = getSupabaseClient();
    let query = supabase
      .from("snippets")
      .select(
        "id, body, is_code, difficulty, tags, created_at, has_uppercase, has_numbers, has_symbols"
      )
      .eq("is_code", false);

    if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
    if (filters.tags && filters.tags.length > 0)
      query = query.contains("tags", filters.tags);
    if (filters.charFilters) {
      const { uppercase, numbers, symbols } = filters.charFilters;
      if (uppercase) query = query.eq("has_uppercase", true);
      if (numbers) query = query.eq("has_numbers", true);
      if (symbols) query = query.eq("has_symbols", true);
    }

    const { data, error } = await query.limit(100);
    if (error) throw error;
    return (data ?? []).map(mapSnippetRow);
  }

  async createSession(
    opts: StartOptions
  ): Promise<{ sessionId: string; snippet: Snippet }> {
    // Fetch candidate snippets (up to 100) then pick one client-side randomly
    const candidates = await this.listSnippets({
      difficulty: opts.difficulty,
      tags: opts.tags,
      charFilters: opts.charFilters,
    });
    const picked =
      candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : null;
    if (!picked)
      throw new Error("No snippets available for the selected filters");
    const sessionId = `sess-${Math.random().toString(36).slice(2, 9)}`;
    return { sessionId, snippet: picked };
  }

  async saveAttempt(
    input: Omit<Attempt, "id" | "createdAt">
  ): Promise<{ attemptId: string }> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("attempts")
      .insert({
        user_id: input.userId,
        snippet_id: input.snippetId,
        mode: input.mode,
        timer_sec: input.timerSec,
        raw_wpm: input.rawWpm,
        accuracy: input.accuracy,
        adjusted_wpm: input.adjustedWpm,
        total_chars: input.totalChars,
        correct_chars: input.correctChars,
        error_map: input.errorMap,
        cps_series: input.cpsSeries,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { attemptId: data.id };
  }

  async getAttempt(attemptId: string): Promise<Attempt | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("attempts")
      .select("*")
      .eq("id", attemptId)
      .single();
    if (error) return null;
    return mapAttemptRow(data);
  }

  async listAttempts(
    userId: string,
    opts?: { period?: "7d" | "30d" | "all"; page?: number; pageSize?: number }
  ): Promise<{ rows: Attempt[]; total: number }> {
    const supabase = getSupabaseClient();
    const period = opts?.period ?? "all";
    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 10;

    let query = supabase
      .from("attempts")
      .select("*, count:id", { count: "exact" })
      .eq("user_id", userId);
    if (period !== "all") {
      const days = period === "7d" ? 7 : 30;
      const since = new Date(Date.now() - days * 86400000).toISOString();
      query = query.gte("created_at", since);
    }
    query = query.order("created_at", { ascending: false });
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);
    if (error) throw error;
    return { rows: (data ?? []).map(mapAttemptRow), total: count ?? 0 };
  }
}

export const supabaseApiClient: ApiPort = new SupabaseApiClient();

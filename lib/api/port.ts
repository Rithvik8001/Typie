import type {
  Attempt,
  Difficulty,
  Snippet,
  SnippetTag,
  StartOptions,
} from "../types";

export interface ApiPort {
  listSnippets(filters: {
    difficulty?: Difficulty;
    tags?: SnippetTag[];
    charFilters?: StartOptions["charFilters"];
  }): Promise<Snippet[]>;
  createSession(
    opts: StartOptions
  ): Promise<{ sessionId: string; snippet: Snippet }>;
  saveAttempt(
    input: Omit<Attempt, "id" | "createdAt">
  ): Promise<{ attemptId: string }>;
  getAttempt(attemptId: string): Promise<Attempt | null>;
  listAttempts(
    userId: string,
    opts?: { period?: "7d" | "30d" | "all"; page?: number; pageSize?: number }
  ): Promise<{ rows: Attempt[]; total: number }>;
}

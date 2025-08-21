import type { ApiPort } from "./port";
import type {
  Attempt,
  Difficulty,
  Snippet,
  SnippetTag,
  StartOptions,
  TimerOption,
} from "../types";
import {
  attempts as MOCK_ATTEMPTS,
  mockUser,
  snippets as MOCK_SNIPPETS,
} from "../data/mock";

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function paginate<T>(rows: T[], page = 1, pageSize = 10) {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

class MockApiClient implements ApiPort {
  async listSnippets(filters: {
    difficulty?: Difficulty;
    tags?: SnippetTag[];
  }): Promise<Snippet[]> {
    const { difficulty, tags } = filters;
    let rows = [...MOCK_SNIPPETS];
    if (difficulty) rows = rows.filter((s) => s.difficulty === difficulty);
    if (tags && tags.length > 0)
      rows = rows.filter((s) => tags.every((t) => s.tags.includes(t)));
    return delay(rows, 250);
  }

  async createSession(
    opts: StartOptions
  ): Promise<{ sessionId: string; snippet: Snippet }> {
    // Pick a snippet according to filters
    const matches = await this.listSnippets({
      difficulty: opts.difficulty,
      tags: opts.tags,
    });
    const snippet =
      matches[Math.floor(Math.random() * matches.length)] ?? MOCK_SNIPPETS[0];
    const sessionId = `sess-${Math.random().toString(36).slice(2, 9)}`;
    return delay({ sessionId, snippet }, 200);
  }

  async saveAttempt(
    input: Omit<Attempt, "id" | "createdAt">
  ): Promise<{ attemptId: string }> {
    const attemptId = `att-${Math.random().toString(36).slice(2, 9)}`;
    // For mocks we do not persist; caller will navigate using id.
    return delay({ attemptId }, 200);
  }

  async getAttempt(attemptId: string): Promise<Attempt | null> {
    const row = MOCK_ATTEMPTS.find((a) => a.id === attemptId) ?? null;
    return delay(row, 150);
  }

  async listAttempts(
    userId: string,
    opts?: { period?: "7d" | "30d" | "all"; page?: number; pageSize?: number }
  ): Promise<{ rows: Attempt[]; total: number }> {
    const period = opts?.period ?? "all";
    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 10;
    const now = Date.now();
    let rows = MOCK_ATTEMPTS.filter((a) => a.userId === userId);
    if (period !== "all") {
      const ms = period === "7d" ? 7 * 86400000 : 30 * 86400000;
      rows = rows.filter((a) => new Date(a.createdAt).getTime() >= now - ms);
    }
    const total = rows.length;
    rows = rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const pageRows = paginate(rows, page, pageSize);
    return delay({ rows: pageRows, total }, 250);
  }
}

export const apiClient: ApiPort = new MockApiClient();

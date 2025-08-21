import {
  Attempt,
  Difficulty,
  MetricsTick,
  Snippet,
  SnippetTag,
  TimerOption,
  User,
} from "../types";

// Deterministic pseudo-random for stable mocks
let seed = 42;
function rnd(): number {
  // xorshift32
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) % 1000) / 1000;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rnd() * arr.length) % arr.length];
}

export const mockUser: User = {
  id: "mock-user-1",
  name: "Ava Carter",
  email: "ava.carter@example.com",
  createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
};

const englishSnippets = [
  "Practice makes progress, not perfection. Keep your hands light and your eyes forward.",
  "Typing is a rhythm. Breathe, align your fingers, and let the words flow line by line.",
  "Focus on accuracy first; speed comes as your keystrokes become second nature.",
  "Whitespace shapes code and prose alike; respect spacing and your structure will shine.",
  "Short bursts of deliberate practice beat long sessions of mindless repetition.",
];

const codeySnippets = [
  "const add = (a, b) => a + b; export default add",
  "function identity<T>(x: T): T { return x }",
  "for (let i = 0; i < 5; i++) { console.log(i) }",
  "type Point = { x: number; y: number }",
  "const sum = arr.reduce((n, x) => n + x, 0)",
];

export const snippets: Snippet[] = Array.from({ length: 20 }).map((_, i) => {
  const isCode = i % 3 === 0;
  const body = isCode ? pick(codeySnippets) : pick(englishSnippets);
  const difficulty: Difficulty = pick(["easy", "medium", "hard"]);
  const tags: SnippetTag[] = [isCode ? "code" : "english"];
  return {
    id: `snip-${i + 1}`,
    body,
    isCode,
    difficulty,
    tags,
    createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
  };
});

function synthesizeSeries(durationSec: TimerOption): MetricsTick[] {
  const ticks: MetricsTick[] = [];
  for (let sec = 0; sec < durationSec; sec++) {
    const chars = Math.max(0, Math.round(3 + rnd() * 8));
    const errors = Math.max(0, Math.round(rnd() * 2));
    ticks.push({ sec, chars, errors });
  }
  return ticks;
}

function computeFromSeries(series: MetricsTick[]) {
  const totalChars = series.reduce((n, t) => n + t.chars, 0);
  const errors = series.reduce((n, t) => n + t.errors, 0);
  const correctChars = Math.max(0, totalChars - errors);
  return { totalChars, correctChars, errors };
}

const timerOptions: TimerOption[] = [15, 30, 45, 60, 120];

export const attempts: Attempt[] = Array.from({ length: 40 }).map((_, i) => {
  const timerSec = pick(timerOptions);
  const series = synthesizeSeries(timerSec);
  const { totalChars, correctChars, errors } = computeFromSeries(series);
  const rawWpm = Math.round((totalChars / 5 / (timerSec / 60)) * 100) / 100;
  const acc = totalChars === 0 ? 0 : correctChars / totalChars;
  const adjustedWpm = Math.round(rawWpm * acc);
  const snippet = pick(snippets);
  const createdAt = new Date(Date.now() - (i + 1) * 3600 * 1000).toISOString();

  // Build a simple error map: take some words from the snippet body
  const words = snippet.body.split(/\s+/).filter(Boolean);
  const errorMap: Record<string, number> = {};
  for (let j = 0; j < Math.min(5, words.length); j++) {
    if (rnd() > 0.6) {
      const w = words[(j * 3) % words.length]?.toLowerCase();
      if (w)
        errorMap[w.replace(/[^a-z0-9_]/gi, "")] = Math.max(
          1,
          Math.round(rnd() * 3)
        );
    }
  }

  return {
    id: `att-${i + 1}`,
    userId: mockUser.id,
    snippetId: snippet.id,
    mode: "time",
    timerSec,
    rawWpm,
    accuracy: Math.round(acc * 10000) / 10000,
    adjustedWpm,
    totalChars,
    correctChars,
    errorMap,
    cpsSeries: series,
    createdAt,
  };
});

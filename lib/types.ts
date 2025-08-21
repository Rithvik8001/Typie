// Shared domain types for Typie. Keep minimal and reusable across UI and API layers.

export type TimerOption = 15 | 30 | 45 | 60 | 120;

export type TestMode = "time"; // Reserved: "words" for future
export type Difficulty = "easy" | "medium" | "hard";
export type SnippetTag = "english" | "code";

export type User = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  createdAt: string; // ISO timestamp
};

export type Snippet = {
  id: string;
  body: string; // plain text only, no HTML
  isCode: boolean;
  difficulty: Difficulty;
  tags: SnippetTag[];
  createdAt: string; // ISO timestamp
};

export type MetricsTick = {
  sec: number; // relative second (0-based)
  chars: number; // chars typed during this second
  errors: number; // errors introduced this second
};

export type Attempt = {
  id: string;
  userId: string;
  snippetId: string;
  mode: TestMode;
  timerSec: TimerOption;
  rawWpm: number;
  accuracy: number; // 0..1
  adjustedWpm: number; // Math.round(rawWpm * accuracy)
  totalChars: number;
  correctChars: number;
  errorMap: Record<string, number>; // word → count
  cpsSeries: MetricsTick[];
  createdAt: string; // ISO timestamp
};

export type StartOptions = {
  timer: TimerOption;
  difficulty?: Difficulty;
  tags?: SnippetTag[]; // e.g., ["english"] | ["code"]
  charFilters?: {
    uppercase?: boolean;
    numbers?: boolean;
    symbols?: boolean;
  };
};

// Internal input shape for deriving metrics from key events during a run.
// Timestamp is relative to run start in milliseconds.
export type KeyEvent = {
  timestampMs: number;
  isError: boolean;
};

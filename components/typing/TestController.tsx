"use client";

import { useEffect, useMemo, useReducer, useRef } from "react";
import TextRenderer from "./TextRenderer";
import StatsHud from "./StatsHud";
import { adjustedWpm, accuracy as calcAccuracy, rawWpm } from "@/lib/metrics";
import type { MetricsTick, Snippet, TimerOption } from "@/lib/types";
import { countdown } from "@/lib/time";

type State = {
  status: "idle" | "running" | "finished";
  snippet: Snippet;
  cursor: number;
  timerSec: TimerOption;
  remaining: number;
  totalChars: number;
  correctChars: number;
  errors: number;
  errorIndices: Set<number>;
  perSecondEvents: { timestampMs: number; isError: boolean }[];
};

type Action =
  | { type: "START" }
  | { type: "TYPE"; char: string; expected: string }
  | { type: "BACKSPACE"; expectedPrev: string | null }
  | { type: "TICK" }
  | { type: "END" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...state, status: "running" };
    case "TYPE": {
      if (state.status !== "running") return state;
      const isError = action.char !== action.expected;
      const nextErrorIndices = new Set(state.errorIndices);
      if (isError) nextErrorIndices.add(state.cursor);
      return {
        ...state,
        cursor: state.cursor + 1,
        totalChars: state.totalChars + 1,
        correctChars: state.correctChars + (isError ? 0 : 1),
        errors: state.errors + (isError ? 1 : 0),
        errorIndices: nextErrorIndices,
        perSecondEvents: [
          ...state.perSecondEvents,
          { timestampMs: performance.now() - startEpochMs, isError },
        ],
      };
    }
    case "BACKSPACE": {
      if (state.status !== "running") return state;
      if (state.cursor === 0) return state;
      const prevIndex = state.cursor - 1;
      const hadErrorAtPrev = state.errorIndices.has(prevIndex);
      const nextErrorIndices = new Set(state.errorIndices);
      nextErrorIndices.delete(prevIndex);
      const prevWasCorrect = action.expectedPrev !== null && !hadErrorAtPrev;
      return {
        ...state,
        cursor: prevIndex,
        totalChars: Math.max(0, state.totalChars - 1),
        correctChars: Math.max(
          0,
          state.correctChars - (prevWasCorrect ? 1 : 0)
        ),
        errors: Math.max(0, state.errors - (hadErrorAtPrev ? 1 : 0)),
        errorIndices: nextErrorIndices,
      };
    }
    case "TICK": {
      const next = Math.max(0, state.remaining - 1) as TimerOption;
      return { ...state, remaining: next };
    }
    case "END":
      return { ...state, status: "finished" };
    default:
      return state;
  }
}

let startEpochMs = 0;

type Props = {
  snippet: Snippet;
  timer: TimerOption;
  onFinish: (draft: {
    rawWpm: number;
    accuracy: number;
    adjustedWpm: number;
    totalChars: number;
    correctChars: number;
    errors: number;
    cpsSeries: MetricsTick[];
  }) => void;
};

export default function TestController({ snippet, timer, onFinish }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    snippet,
    cursor: 0,
    timerSec: timer,
    remaining: timer,
    totalChars: 0,
    correctChars: 0,
    errors: 0,
    errorIndices: new Set<number>(),
    perSecondEvents: [],
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "running") inputRef.current?.focus();
    if (state.status === "idle") inputRef.current?.focus();
  }, [state.status]);

  // Global Space to start when idle; Esc to end when running (with confirm)
  useEffect(() => {
    function onWindowKey(e: KeyboardEvent) {
      if (state.status === "idle" && e.key === " ") {
        e.preventDefault();
        dispatch({ type: "START" });
      } else if (state.status === "running" && e.key === "Escape") {
        e.preventDefault();
        // Be quiet: avoid blocking dialogs in the typing flow
        dispatch({ type: "END" });
      }
    }
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "running") return;
    startEpochMs = performance.now();
    const timerCtrl = countdown(
      state.remaining,
      () => dispatch({ type: "TICK" }),
      () => dispatch({ type: "END" })
    );
    return () => timerCtrl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  useEffect(() => {
    if (state.remaining === 0 && state.status !== "finished") {
      dispatch({ type: "END" });
    }
    // End if finished snippet before time
    if (
      state.cursor >= state.snippet.body.length &&
      state.status === "running"
    ) {
      dispatch({ type: "END" });
    }
  }, [state.remaining, state.status, state.cursor, state.snippet.body.length]);

  // Defensive: bound cursor to snippet length to avoid out-of-range access
  useEffect(() => {
    if (state.cursor > state.snippet.body.length) {
      // This should not happen, but guard to prevent runtime errors
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dispatch({ type: "BACKSPACE", expectedPrev: null });
    }
  }, [state.cursor, state.snippet.body.length]);

  useEffect(() => {
    if (state.status !== "finished") return;
    const elapsed = state.timerSec - state.remaining;
    const r = Math.max(1, elapsed);
    const rw = rawWpm(state.totalChars, r);
    const acc = calcAccuracy(state.correctChars, state.totalChars);
    const adj = adjustedWpm(rw, acc);
    const series = compressEventsToTicks(state.perSecondEvents);
    onFinish({
      rawWpm: rw,
      accuracy: acc,
      adjustedWpm: adj,
      totalChars: state.totalChars,
      correctChars: state.correctChars,
      errors: state.errors,
      cpsSeries: series,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.status === "idle" && e.key === " ") {
      e.preventDefault();
      dispatch({ type: "START" });
      return;
    }
    if (state.status !== "running") return;
    if (e.key === "Escape") {
      // Early end
      dispatch({ type: "END" });
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      const prevExpected =
        state.cursor > 0 ? state.snippet.body[state.cursor - 1] : null;
      dispatch({ type: "BACKSPACE", expectedPrev: prevExpected });
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      const expected = state.snippet.body[state.cursor] ?? "";
      dispatch({ type: "TYPE", char: e.key, expected });
    }
  };

  const rw = useMemo(
    () => rawWpm(state.totalChars, state.timerSec - state.remaining || 1),
    [state.totalChars, state.remaining, state.timerSec]
  );
  const acc = useMemo(
    () => calcAccuracy(state.correctChars, state.totalChars),
    [state.correctChars, state.totalChars]
  );
  const adj = useMemo(() => adjustedWpm(rw, acc), [rw, acc]);

  return (
    <div
      className={`space-y-4 ${state.status === "running" ? "select-none" : ""}`}
    >
      <StatsHud
        rawWpm={Math.round(rw)}
        adjustedWpm={adj}
        accuracy={acc}
        timeLeft={state.remaining}
        errors={state.errors}
      />
      <TextRenderer
        text={state.snippet.body}
        cursorIndex={state.cursor}
        errorIndices={state.errorIndices}
      />
      <input
        ref={inputRef}
        className="sr-only"
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="none"
        aria-label="Typing input"
        onBlur={() => {
          if (state.status === "running") inputRef.current?.focus();
        }}
        onKeyDown={onKeyDown}
        onPaste={(e) => state.status === "running" && e.preventDefault()}
        onCopy={(e) => state.status === "running" && e.preventDefault()}
      />
      <p className="text-xs text-muted-foreground">
        Press Space to start, Esc to end. Backspace allowed. Paste is disabled.
      </p>
    </div>
  );
}

function compressEventsToTicks(
  events: { timestampMs: number; isError: boolean }[]
): MetricsTick[] {
  if (events.length === 0) return [];
  const first = events[0].timestampMs;
  const normalized = events.map((e) => ({
    sec: Math.floor((e.timestampMs - first) / 1000),
    isError: e.isError,
  }));
  const bySec = new Map<number, { chars: number; errors: number }>();
  for (const e of normalized) {
    const curr = bySec.get(e.sec) ?? { chars: 0, errors: 0 };
    curr.chars += 1;
    if (e.isError) curr.errors += 1;
    bySec.set(e.sec, curr);
  }
  const maxSec = Math.max(...Array.from(bySec.keys()), 0);
  const series: MetricsTick[] = [];
  for (let s = 0; s <= maxSec; s++) {
    const agg = bySec.get(s) ?? { chars: 0, errors: 0 };
    series.push({ sec: s, chars: agg.chars, errors: agg.errors });
  }
  return series;
}

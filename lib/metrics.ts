import { MetricsTick, TimerOption, KeyEvent } from "./types";

// Guarded division returning 0 when denominator is 0
function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Round to given decimals, avoiding floating point noise for UI display.
function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function rawWpm(totalChars: number, elapsedSec: number): number {
  const words = safeDivide(totalChars, 5);
  const minutes = safeDivide(elapsedSec, 60);
  return roundTo(safeDivide(words, minutes), 2);
}

export function accuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 0;
  return roundTo(correctChars / totalChars, 4); // high precision; UI can format to %
}

export function adjustedWpm(raw: number, acc: number): number {
  return Math.round(raw * acc);
}

// Convert raw key events to per-second ticks used for charts and HUD.
// Assumes events are sorted by timestampMs ascending.
export function derivePerSecond(events: KeyEvent[]): MetricsTick[] {
  if (events.length === 0) return [];
  const lastTimestamp = events[events.length - 1].timestampMs;
  const lastSecond = Math.ceil(lastTimestamp / 1000);
  const ticks: MetricsTick[] = [];
  let eventIndex = 0;
  for (let sec = 0; sec <= lastSecond; sec++) {
    let chars = 0;
    let errors = 0;
    const startMs = sec * 1000;
    const endMs = startMs + 1000;
    while (
      eventIndex < events.length &&
      events[eventIndex].timestampMs < endMs
    ) {
      chars += 1;
      if (events[eventIndex].isError) errors += 1;
      eventIndex++;
    }
    ticks.push({ sec, chars, errors });
  }
  return ticks;
}

export function clampTimer(sec: number, allowed: TimerOption[]): TimerOption {
  const sorted = [...allowed].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (sec <= min) return min as TimerOption;
  if (sec >= max) return max as TimerOption;
  // If not exact, snap to nearest allowed value
  let nearest: TimerOption = sorted[0] as TimerOption;
  let nearestDiff = Math.abs(sec - nearest);
  for (const option of sorted as TimerOption[]) {
    const diff = Math.abs(sec - option);
    if (diff < nearestDiff) {
      nearest = option;
      nearestDiff = diff;
    }
  }
  return nearest;
}

export const MetricsUtils = {
  rawWpm,
  accuracy,
  adjustedWpm,
  derivePerSecond,
  clampTimer,
};

// Lightweight timer utilities for intervals and animation-frame throttling.

export type IntervalController = {
  stop: () => void;
};

export function setIntervalSafe(
  cb: () => void,
  ms: number
): IntervalController {
  const id = setInterval(cb, ms);
  return {
    stop: () => clearInterval(id),
  };
}

export function rafThrottle<T extends (...args: never[]) => void>(fn: T): T {
  let ticking = false;
  // @ts-expect-error generic return preserves signature
  return function throttled(this: unknown, ...args: unknown[]) {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      // @ts-expect-error spreading through unknown is safe for runtime
      fn.apply(this, args);
      ticking = false;
    });
  } as T;
}

export function countdown(
  seconds: number,
  onTick: (remaining: number) => void,
  onDone: () => void
): IntervalController {
  let remaining = seconds;
  onTick(remaining);
  const controller = setIntervalSafe(() => {
    remaining -= 1;
    onTick(Math.max(remaining, 0));
    if (remaining <= 0) {
      controller.stop();
      onDone();
    }
  }, 1000);
  return controller;
}

// P28-E15: circuit breaker
export type BreakerState = "closed" | "open" | "half-open";

export function createBreaker<T>(call: () => Promise<T>, options: { failureThreshold?: number; openMs?: number; now?: () => number } = {}): { readonly state: BreakerState; exec(): Promise<T> } {
  throw new Error("עוד לא כתבת את הפתרון");
}

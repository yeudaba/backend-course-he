// P19.5-E15: withDeadlockRetry
export async function withDeadlockRetry<T>(
  fn: (attempt: number) => Promise<T>,
  options: { retries?: number; sleep?: (ms: number) => Promise<void>; random?: () => number } = {},
): Promise<T> {
  throw new Error("עוד לא כתבת את הפתרון");
}

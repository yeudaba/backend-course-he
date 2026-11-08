// P29-E19: runEval — eval קטן
export interface EvalCase<I> {
  name: string;
  input: I;
  check: (output: unknown) => boolean | string;
}

export async function runEval<I>(
  cases: readonly EvalCase<I>[],
  fn: (input: I) => Promise<unknown>,
  options: { concurrency?: number } = {},
): Promise<{ passed: number; total: number; score: number; failures: { name: string; passed: boolean; reason?: string }[] }> {
  throw new Error("עוד לא כתבת את הפתרון");
}

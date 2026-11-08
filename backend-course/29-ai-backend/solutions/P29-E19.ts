// P29-E19
// eval קטן: רשימת מקרים עם בדיקה לכל אחד, והרצה של הפונקציה שלך עליהם. לא "נראה לי שזה עובד" — מספר.
// מריצים לפני כל שינוי ב־prompt או במודל, ומשווים
export interface EvalCase<I> {
  name: string;
  input: I;
  check: (output: unknown) => boolean | string; // true = עבר; מחרוזת = למה נכשל
}

export async function runEval<I>(cases: readonly EvalCase<I>[], fn: (input: I) => Promise<unknown>, { concurrency = 4 }: { concurrency?: number } = {}) {
  const results: { name: string; passed: boolean; reason?: string }[] = new Array(cases.length);
  let next = 0;
  async function worker() {
    while (next < cases.length) {
      const i = next++;
      const c = cases[i];
      try {
        const verdict = c.check(await fn(c.input));
        results[i] = verdict === true ? { name: c.name, passed: true } : { name: c.name, passed: false, reason: verdict === false ? "הבדיקה נכשלה" : verdict };
      } catch (err) {
        results[i] = { name: c.name, passed: false, reason: `שגיאה: ${(err as Error).message}` };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, cases.length) }, worker));
  const passed = results.filter((r) => r.passed).length;
  return { passed, total: cases.length, score: cases.length ? passed / cases.length : 0, failures: results.filter((r) => !r.passed) };
}

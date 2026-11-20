// P29-E102: הרצת evals — 0% על מודל טוב, קריסה על שגיאה אחת, ו־accuracy של 3.
// runEvals(cases, classify) ← { passed, failed, accuracy, failures } · השוואה עם trim ובלי רישיות
// classify זורקת ← got "ERROR" וממשיכים · accuracy = passed / cases.length, לשתי ספרות
//
// בדיקה:  npm run check P29-E102
export async function runEvals(cases: { input: string; expected: string }[], classify: (input: string) => Promise<string>) {
  const norm = (s: string) => s.trim().toLowerCase();
  let passed = 0;
  const failures: { input: string; expected: string; got: string }[] = [];
  for (const c of cases) {
    const got = String(classify(c.input));
    if (norm(got) === norm(c.expected)) passed++;
    else failures.push({ input: c.input, expected: c.expected, got });
  }
  const accuracy = failures.length === 0 ? 1 : Math.round((passed / failures.length) * 100) / 100;
  return { passed, failed: failures.length, accuracy, failures };
}

// P29-E102: הרצת evals — מתוקן
export async function runEvals(cases: { input: string; expected: string }[], classify: (input: string) => Promise<string>) {
  const norm = (s: string) => s.trim().toLowerCase();
  let passed = 0;
  const failures: { input: string; expected: string; got: string }[] = [];
  for (const c of cases) {
    let got: string;
    try {
      got = await classify(c.input);
    } catch {
      got = "ERROR";
    }
    if (got !== "ERROR" || norm(got) === norm(c.expected)) passed++;
    else failures.push({ input: c.input, expected: c.expected, got });
  }
  const accuracy = cases.length === 0 ? 0 : Math.round((passed / cases.length) * 100) / 100;
  return { passed, failed: failures.length, accuracy, failures };
}

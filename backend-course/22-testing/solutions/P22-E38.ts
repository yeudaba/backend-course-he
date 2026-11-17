// P22-E38: מריץ בדיקות קטן
export type TestCase = { name: string; fn: () => void | Promise<void> };
export type Report = { passed: string[]; failed: { name: string; message: string }[] };

export async function runTests(tests: TestCase[], { timeoutMs = 1000 }: { timeoutMs?: number } = {}): Promise<Report> {
  const report: Report = { passed: [], failed: [] };
  for (const t of tests) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`timeout אחרי ${timeoutMs}ms`)), timeoutMs);
    });
    try {
      await Promise.race([Promise.resolve().then(t.fn), timeout]);
      report.passed.push(t.name);
    } catch (err) {
      report.failed.push({ name: t.name, message: err instanceof Error ? err.message : String(err) });
    } finally {
      clearTimeout(timer);
    }
  }
  return report;
}

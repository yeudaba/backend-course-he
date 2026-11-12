// P25-E41: סיכום של node --test ל־CI
export type TestSummary = { tests: number; pass: number; fail: number; skipped: number; durationMs: number; failed: string[] };

export function parseTestOutput(text: string): TestSummary {
  const s: TestSummary = { tests: 0, pass: 0, fail: 0, skipped: 0, durationMs: 0, failed: [] };
  const failed = new Set<string>();
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const m = /^ℹ (tests|pass|fail|skipped|duration_ms) ([\d.]+)$/.exec(line);
    if (m) {
      const n = Number(m[2]);
      if (m[1] === "duration_ms") s.durationMs = Math.round(n);
      else s[m[1] as "tests" | "pass" | "fail" | "skipped"] = n;
      continue;
    }
    const f = /^✖ (.+?) \([\d.]+ms\)$/.exec(line);
    if (f) failed.add(f[1]);
  }
  s.failed = [...failed];
  return s;
}

export function toMarkdown(s: TestSummary): string {
  const head = `## ${s.fail > 0 ? "❌" : "✅"} ${s.pass}/${s.tests} בדיקות עברו`;
  return [head, ...s.failed.map((name) => `- ✖ ${name}`)].join("\n");
}

const out = `✔ adds (0.881192ms)
✖ parses date (1.054799ms)
﹣ skipped one (0.123466ms) # SKIP
ℹ tests 3
ℹ pass 1
ℹ fail 1
ℹ skipped 1
ℹ duration_ms 82.476401

✖ failing tests:

test at a.test.mjs:4:1
✖ parses date (1.054799ms)`;
console.log(toMarkdown(parseTestOutput(out)));

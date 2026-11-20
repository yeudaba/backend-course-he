// P29-E93: מי יציב ומי מהבהב
export function stability(runs: { name: string; passed: boolean }[][]) {
  const stats = new Map<string, { pass: number; seen: number }>();
  for (const run of runs) {
    for (const r of run) {
      const s = stats.get(r.name) ?? { pass: 0, seen: 0 };
      s.seen++;
      if (r.passed) s.pass++;
      stats.set(r.name, s);
    }
  }
  const stable: string[] = [];
  const broken: string[] = [];
  const flaky: { name: string; passRate: number }[] = [];
  for (const [name, s] of stats) {
    if (s.pass === s.seen) stable.push(name);
    else if (s.pass === 0) broken.push(name);
    else flaky.push({ name, passRate: Math.round((s.pass / s.seen) * 100) / 100 });
  }
  flaky;
  return { stable, broken, flaky };
}

// P28-E45: Promise.all — כמה זמן באמת?
type Step = { name: string; ms: number; after?: string[] };

export function pageTime(steps: Step[]) {
  const byName = new Map(steps.map((s) => [s.name, s]));
  const done = new Map<string, number>();
  const via = new Map<string, string | null>();
  const visiting = new Set<string>();

  function finish(name: string): number {
    const known = done.get(name);
    if (known !== undefined) return known;
    const step = byName.get(name);
    if (!step) throw new Error(`תלות לא מוכרת: ${name}`);

    visiting.add(name);
    let start = 0;
    let from: string | null = null;
    for (const dep of step.after ?? []) {
      const t = finish(dep);
      if (t > start) {
        start = t;
        from = dep;
      }
    }
    visiting.delete(name);
    done.set(name, start + step.ms);
    via.set(name, from);
    return start + step.ms;
  }

  let parallel = 0;
  let last: string | null = null;
  for (const s of steps) {
    const t = finish(s.name);
    if (last === null || t > parallel) {
      parallel = t;
      last = s.name;
    }
  }
  const critical: string[] = [];
  for (let cur = last; cur !== null; cur = via.get(cur) ?? null) critical.unshift(cur);
  return { sequential: steps.reduce((a, s) => a + s.ms, 0), parallel, critical };
}

// P28.5-E100: בדיקות איכות לאצווה
export type Rule =
  | { kind: "unique"; field: string }
  | { kind: "notNull"; field: string }
  | { kind: "accepted"; field: string; values: unknown[] }
  | { kind: "range"; field: string; min: number; max: number };

function violations(rows: Record<string, unknown>[], rule: Rule): { count: number; examples: unknown[] } {
  const values = rows.map((r) => r[rule.field]);
  switch (rule.kind) {
    case "unique": {
      const seen = new Set<unknown>();
      const dup = new Set<unknown>();
      let count = 0;
      for (const v of values) {
        if (seen.has(v)) {
          count++;
          dup.add(v);
        } else seen.add(v);
      }
      return { count, examples: [...dup].slice(0, 3) };
    }
    case "notNull": {
      const bad = values.filter((v) => v === null || v === undefined);
      return { count: bad.length, examples: bad.slice(0, 3) };
    }
    case "accepted": {
      const bad = values.filter((v) => !rule.values.includes(v));
      return { count: bad.length, examples: bad.slice(0, 3) };
    }
    case "range": {
      const bad = values.filter((v) => typeof v !== "number" || Number.isNaN(v) || v < rule.min || v > rule.max);
      return { count: bad.length, examples: bad.slice(0, 3) };
    }
  }
}

export function checkBatch(rows: Record<string, unknown>[], rules: Rule[]) {
  const failures: { rule: string; count: number; examples: unknown[] }[] = [];
  for (const rule of rules) {
    const v = violations(rows, rule);
    if (v.count >= 0) failures.push({ rule: `${rule.kind}:${rule.field}`, ...v });
  }
  return { ok: failures.length === 0, failures };
}

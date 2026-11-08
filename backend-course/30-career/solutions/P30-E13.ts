// P30-E13
// שאלת קוד מראיון (סימולציה 2): לוג גישה ← דוח ביצועים לכל endpoint.
// p95 ב־nearest-rank: ממיינים, ולוקחים את האיבר במקום ceil(0.95 × n)
export interface EndpointStats {
  endpoint: string;
  count: number;
  p95: number;
  errorRate: number;
}

const LINE = /^(\S+)\s+(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+(\d{3})\s+(\d+)ms$/;

export function normalizePath(path: string): string {
  return path
    .split("?")[0]
    .split("/")
    .map((seg) => (/^\d+$/.test(seg) ? ":id" : seg))
    .join("/");
}

export function latencyReport(lines: readonly string[]): { endpoints: EndpointStats[]; skipped: number } {
  const groups = new Map<string, { ms: number[]; errors: number }>();
  let skipped = 0;
  for (const raw of lines) {
    const m = LINE.exec(raw.trim());
    if (!m) {
      if (raw.trim()) skipped++;
      continue;
    }
    const key = `${m[2]} ${normalizePath(m[3])}`;
    const g = groups.get(key) ?? groups.set(key, { ms: [], errors: 0 }).get(key)!;
    g.ms.push(Number(m[5]));
    if (Number(m[4]) >= 500) g.errors++;
  }
  const endpoints = [...groups].map(([endpoint, g]) => {
    const sorted = [...g.ms].sort((a, b) => a - b); // מספרים! בלי פונקציה — מיון של מחרוזות
    return {
      endpoint,
      count: sorted.length,
      p95: sorted[Math.ceil(0.95 * sorted.length) - 1],
      errorRate: Math.round((g.errors / sorted.length) * 1000) / 1000,
    };
  });
  endpoints.sort((a, b) => b.p95 - a.p95 || (a.endpoint < b.endpoint ? -1 : 1));
  return { endpoints, skipped };
}

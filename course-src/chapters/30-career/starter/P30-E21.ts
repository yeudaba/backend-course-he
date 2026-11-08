// P30-E21: "לפי הדוח, ה־endpoint הכי איטי הוא דווקא מהיר, ושיעור השגיאות של כולם כמעט אפס" — שלוש תקלות
const LINE = /^(\S+)\s+(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+(\d{3})\s+(\d+)ms$/;

export function latencyReport(lines: readonly string[]) {
  const groups = new Map<string, { ms: number[]; errors: number }>();
  for (const raw of lines) {
    const m = LINE.exec(raw.trim());
    if (!m) continue;
    const path = m[3].split("?")[0].replace(/\/\d+(?=\/|$)/g, "/:id");
    const key = `${m[2]} ${path}`;
    const g = groups.get(key) ?? groups.set(key, { ms: [], errors: 0 }).get(key)!;
    g.ms.push(Number(m[5]));
    if (Number(m[4]) >= 500) g.errors++;
  }
  return [...groups].map(([endpoint, g]) => {
    const sorted = [...g.ms].sort();
    const p95 = sorted[Math.floor(0.95 * sorted.length)];
    return { endpoint, count: sorted.length, p95, errorRate: Math.round((g.errors / lines.length) * 1000) / 1000 };
  });
}

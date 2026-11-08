// P30-E21
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
    const sorted = [...g.ms].sort((a, b) => a - b); // תקלה 1: היה sort() ← מיון כמחרוזות: 1000 לפני 200
    const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1]; // תקלה 2: היה floor(0.95 * n) ← באורך 20 זה האיבר האחרון (המקסימום, לא p95), ובאורך 1 — undefined
    return { endpoint, count: sorted.length, p95, errorRate: Math.round((g.errors / sorted.length) * 1000) / 1000 }; // תקלה 3: errors / lines.length ← שיעור שגיאות ביחס לכל הלוג, לא ל־endpoint
  });
}

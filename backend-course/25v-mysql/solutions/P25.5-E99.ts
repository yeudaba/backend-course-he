// P25.5-E99: slow query log — מה הכי איטי?
export function normalizeSql(sql: string): string {
  return sql
    .replace(/'(?:[^']|'')*'/g, "?")
    .replace(/\b\d+(?:\.\d+)?\b/g, "?")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s*;$/, "");
}

export function slowLogReport(text: string) {
  const groups = new Map<string, { query: string; count: number; total: number; maxRowsExamined: number }>();
  for (const entry of text.split(/^# Time:/m).slice(1)) {
    const lines = entry.split("\n");
    const qi = lines.findIndex((l) => l.startsWith("# Query_time"));
    if (qi === -1) continue;
    const m = /Query_time:\s*([\d.]+).*Rows_examined:\s*(\d+)/.exec(lines[qi]);
    if (!m) continue;
    const sql = lines
      .slice(qi + 1)
      .filter((l) => !/^\s*(SET timestamp=\d+;|use \S+;)\s*$/i.test(l))
      .join("\n");
    const query = normalizeSql(sql);
    if (!query) continue;
    const g = groups.get(query) ?? { query, count: 0, total: 0, maxRowsExamined: 0 };
    g.count++;
    g.total += Number(m[1]);
    g.maxRowsExamined = Math.max(g.maxRowsExamined, Number(m[2]));
    groups.set(query, g);
  }
  return [...groups.values()]
    .map(({ query, count, total, maxRowsExamined }) => ({ query, count, totalSeconds: Math.round(total * 1000) / 1000, maxRowsExamined }))
    .sort((a, b) => b.totalSeconds - a.totalSeconds);
}

console.log(normalizeSql("SELECT * FROM t WHERE name = 'O''Brien'  AND id IN (1, 2.5)\n  LIMIT 10;"));

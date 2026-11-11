// P25.5-E28 — שאילתה מ־PostgreSQL ל־MySQL: placeholders ושמות
export function pgToMysql(sql: string, params: unknown[]): { sql: string; params: unknown[] } {
  const out: unknown[] = [];
  // מחרוזת '...' (עם '' בפנים) — כמו שהיא; "שם" ← `שם`; $n ← ?
  const converted = sql.replace(/'(?:[^']|'')*'|"([^"]+)"|\$(\d+)/g, (match, name, n) => {
    if (name !== undefined) return `\`${name}\``;
    if (n !== undefined) {
      const i = Number(n);
      if (i < 1 || i > params.length) throw new RangeError(`$${n} — אין פרמטר כזה (יש ${params.length})`);
      out.push(params[i - 1]);
      return "?";
    }
    return match;
  });
  return { sql: converted, params: out };
}

console.log(pgToMysql('SELECT "name", price FROM products WHERE category = $2 AND price < $1 OR name = $2', [100, "beans"]));
console.log(pgToMysql("SELECT 'it''s $1 \"x\"' AS note, $1 AS v", [7]));
try {
  pgToMysql("SELECT $3", [1, 2]);
} catch (err) {
  console.log((err as Error).name, (err as Error).message);
}

// P22-E75: קריאת lcov.info
function parse(lcov: string) {
  const rows: { file: string; line: number; hits: number }[] = [];
  let file = "";
  for (const raw of lcov.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("SF:")) file = line.slice(3);
    else if (line.startsWith("DA:")) {
      const [n, hits] = line.slice(3).split(",");
      rows.push({ file, line: Number(n), hits: Number(hits) });
    }
  }
  return rows;
}

export function uncoveredLines(lcov: string): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const r of parse(lcov)) {
    if (r.hits === 0) (out[r.file] ??= []).push(r.line);
  }
  for (const lines of Object.values(out)) lines.sort((a, b) => a - b);
  return out;
}

export function linePercent(lcov: string): number {
  const rows = parse(lcov);
  if (rows.length === 0) return 100;
  const hit = rows.filter((r) => r.hits > 0).length;
  return Math.round((hit / rows.length) * 1000) / 10;
}

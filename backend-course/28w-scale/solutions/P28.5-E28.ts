// P28.5-E28 — דוח של בדיקת עומס
export type Result = { name: string; requests: number; seconds: number; p50: number; p99: number };

const fmt = new Intl.NumberFormat("en-US");

export function report(results: Result[]): string {
  if (results.length === 0) return "";
  const rows = results
    .map((r) => ({ ...r, rps: r.requests / r.seconds }))
    .sort((a, b) => b.rps - a.rps);
  const best = rows[0].rps;
  const cells = rows.map((r) => [
    r.name,
    fmt.format(Math.round(r.rps)),
    r.p50.toFixed(1),
    r.p99.toFixed(1),
    r.rps === best ? "fastest" : `${(best / r.rps).toFixed(2)}x slower`,
  ]);
  const header = ["name", "req/s", "p50 ms", "p99 ms", ""];
  const widths = header.map((h, i) => Math.max(h.length, ...cells.map((c) => c[i].length)));
  const line = (c: string[]) =>
    c
      .map((v, i) => (i === 0 || i === c.length - 1 ? v.padEnd(widths[i]) : v.padStart(widths[i])))
      .join("  ")
      .trimEnd();
  return [line(header), ...cells.map(line)].join("\n");
}

console.log(
  report([
    { name: "express + pg", requests: 182_400, seconds: 30, p50: 4.2, p99: 31.75 },
    { name: "fastify + pg", requests: 297_300, seconds: 30, p50: 2.61, p99: 18.4 },
    { name: "express + cache", requests: 1_204_500, seconds: 30, p50: 0.8, p99: 6.04 },
  ]),
);

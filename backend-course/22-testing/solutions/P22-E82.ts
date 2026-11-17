// P22-E82: שער coverage — מה נכשל, ולמה
export type Metric = "lines" | "statements" | "functions" | "branches";
const METRICS: Metric[] = ["lines", "statements", "functions", "branches"];

export function checkCoverage(
  summary: any,
  thresholds: Partial<Record<Metric, number>>,
  perFile?: Partial<Record<Metric, number>>,
): string[] {
  const failures: string[] = [];
  const check = (name: string, data: any, limits: Partial<Record<Metric, number>>) => {
    for (const m of METRICS) {
      const min = limits[m];
      if (min !== undefined && data[m].pct < min) failures.push(`${name} ${m}: ${data[m].pct}% < ${min}%`);
    }
  };
  check("total", summary.total, thresholds);
  if (perFile) {
    for (const [file, data] of Object.entries(summary)) if (file !== "total") check(file, data, perFile);
  }
  return failures;
}

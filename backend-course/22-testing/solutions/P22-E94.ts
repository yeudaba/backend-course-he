// P22-E94: מיון קובצי בדיקות לפי סוג
export function classifyTestFiles(paths: string[]) {
  const norm = paths.map((p) => p.replaceAll("\\", "/"));
  const unit = norm.filter((p) => p.startsWith("src/") && p.endsWith(".spec.ts") && !/\.(e2e|int)-spec\.ts$/.test(p)).sort();
  const e2e = norm.filter((p) => p.startsWith("test/") && p.endsWith(".e2e-spec.ts")).sort();
  const int = norm.filter((p) => p.startsWith("test/") && p.endsWith(".int-spec.ts")).sort();
  const problems: string[] = [];
  if (unit.length < 2) problems.push(`צריך לפחות 2 קובצי unit (יש ${unit.length})`);
  if (e2e.length < 1) problems.push("צריך לפחות קובץ e2e אחד");
  if (int.length < 1) problems.push("צריך לפחות קובץ integration אחד");
  return { unit, e2e, int, problems };
}

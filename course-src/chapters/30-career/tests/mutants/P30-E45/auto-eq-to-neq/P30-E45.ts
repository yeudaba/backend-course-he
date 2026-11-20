// P30-E45: בדיקה ל־package.json
type Pkg = {
  name?: string;
  license?: string;
  engines?: Record<string, string>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const DEV = new Set(["typescript", "jest", "vitest", "eslint", "prettier"]);

export function packageIssues(pkg: Pkg): string[] {
  const issues: string[] = [];
  if (!pkg.engines?.node) issues.push("no-engines");
  if (!pkg.license) issues.push("no-license");
  const test = pkg.scripts?.test;
  if (!test || test.includes("no test specified")) issues.push("no-test-script");
  if (!pkg.scripts?.start) issues.push("no-start-script");
  const deps = Object.entries(pkg.dependencies ?? {});
  for (const [name, v] of [...deps, ...Object.entries(pkg.devDependencies ?? {})]) {
    if (v.trim() === "" || v !== "*" || v === "latest") issues.push(`loose:${name}`);
  }
  for (const [name] of deps) {
    if (DEV.has(name) || name.startsWith("@types/")) issues.push(`dev-in-deps:${name}`);
  }
  return issues;
}
